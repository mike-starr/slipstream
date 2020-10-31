import AddonDescription from "./AddonDescription";
import { AddonInstallOperation } from "./AddonStatus";
import CurseRepository from "./repositories/CurseRepository";
import AddonRepository from "./repositories/AddonRepository";
import fs from "fs";
import got from "got";
import path from "path";
import util from "util";
import stream from "stream";
import { unzipToDirectory } from "@/util/Unzip";
import { GameFlavor } from "./GameFlavor";
import TaskQueue from "@/util/TaskQueue";

const streamPipeline = util.promisify(stream.pipeline);

const addonConfigurationVersion = "1.0";
const addonConfigurationFilename = "slipstream.json";

const maxConcurrentDownloads = 3;

interface AddonConfiguration {
  version: string;
  installedAddons: AddonDescription[];
}

interface RepositoryMap {
  [key: string]: AddonRepository;
}

class AddonManger {
  private readonly repositories: RepositoryMap = {
    curse: new CurseRepository()
  };

  private tempDirectory = "";
  private downloadQueue = new TaskQueue(maxConcurrentDownloads);
  private configurationUpdateQueue = new TaskQueue();

  async initialize(tempDirectory: string) {
    this.tempDirectory = tempDirectory;
  }

  async install(
    addon: AddonDescription,
    directory: string,
    progress: (status: AddonInstallOperation, progress: number) => void
  ) {
    console.log(
      `installing ${addon.title} to ${directory} folders: ${addon.directories}`
    );

    const localPath = path.join(
      this.tempDirectory,
      `${addon.repositoryId}-${Date.now()}.zip`
    );
    const extractionDirectory = `${localPath}_extracted`;

    await this.downloadQueue.enqueue(() => {
      return this.downloadFile(addon.fileUrl, localPath, (pct) => {
        progress("Downloading", pct * 0.8);
      });
    });

    progress("Extracting", 0.8);

    await unzipToDirectory(localPath, extractionDirectory, true);

    progress("Finalizing", 0.98);

    await this.validateAndMove(
      extractionDirectory,
      directory,
      addon.directories
    );

    await this.configurationUpdateQueue.enqueue(() => {
      return this.updateConfigurationForAddon(addon, directory);
    });

    progress("Finalizing", 1.0);
  }

  async search(
    searchTerm: string,
    gameVersion: string
  ): Promise<AddonDescription[]> {
    const gameFlavor = this.flavorForGameVersion(gameVersion);

    const results = await Promise.allSettled(
      Object.values(this.repositories).map((repository) =>
        repository.search(searchTerm, gameFlavor)
      )
    );

    const fulfilledResults: AddonDescription[] = [];

    results.forEach((result) => {
      switch (result.status) {
        case "fulfilled":
          fulfilledResults.push(...result.value);
          break;
        default:
          break;
      }
    });

    return fulfilledResults;
  }

  async findInstalledAddons(directory: string) {
    const addonConfig = await this.readAddonConfiguration(directory);
    return addonConfig.installedAddons;
  }

  async latestVersionForAddons(
    addons: AddonDescription[]
  ): Promise<AddonDescription[]> {
    if (addons.length === 0) {
      return [];
    }

    if (!addons.every((addon) => addon.gameFlavor === addons[0].gameFlavor)) {
      throw new Error(
        "All addons passed to findAddonUpdates must have the same game flavor."
      );
    }

    try {
      const latestAddons = await this.repositories[
        "curse"
      ].addonDescriptionsForIds(
        addons.map((addon) => addon.repositoryId),
        addons[0].gameFlavor
      );
      return latestAddons;
    } catch (error) {
      console.warn(`Failed to retrieve latest addon versions: ${error}`);
      return [];
    }
  }

  async delete(addon: AddonDescription, directory: string) {
    await this.configurationUpdateQueue.enqueue(() => {
      return this.removeAddonFromConfiguration(addon, directory);
    });

    await Promise.all(
      addon.directories.map((addonDirectory) => {
        return fs.promises.rmdir(path.join(directory, addonDirectory), {
          recursive: true,
          maxRetries: 3
        });
      })
    );
  }

  private flavorForGameVersion(gameVersion: string): GameFlavor {
    return gameVersion === "_classic_" ? "classic" : "retail";
  }

  private downloadFile(
    url: string,
    localFile: string,
    progressCallback?: (pctComplete: number) => void
  ) {
    console.log(`downloading ${url} to ${localFile}`);

    return streamPipeline(
      got.stream(url).on("downloadProgress", (progress) => {
        if (progressCallback && progress.total && progress.total > 0) {
          progressCallback(progress.percent);
        }
      }),
      fs.createWriteStream(localFile)
    );
  }

  private async updateConfigurationForAddon(
    addon: AddonDescription,
    directory: string
  ) {
    const addonConfig = await this.readAddonConfiguration(directory);

    const addonIndex = addonConfig.installedAddons.findIndex(
      (installedAddon) => {
        return (
          installedAddon.repositoryId === addon.repositoryId &&
          installedAddon.repository === addon.repository
        );
      }
    );

    if (addonIndex >= 0) {
      addonConfig.installedAddons[addonIndex] = addon;
    } else {
      addonConfig.installedAddons.push(addon);
    }

    await this.writeAddonConfiguration(addonConfig, directory);
  }

  private async removeAddonFromConfiguration(
    addon: AddonDescription,
    directory: string
  ) {
    const addonConfig = await this.readAddonConfiguration(directory);

    const addonIndex = addonConfig.installedAddons.findIndex(
      (installedAddon) => {
        return (
          installedAddon.repositoryId === addon.repositoryId &&
          installedAddon.repository === addon.repository
        );
      }
    );

    addonConfig.installedAddons.splice(addonIndex, 1);

    await this.writeAddonConfiguration(addonConfig, directory);
  }

  private async validateAndMove(
    sourceDirectoryPath: string,
    destinationDirectoryPath: string,
    expectedDirectories: string[]
  ) {
    const allEntries = await fs.promises.readdir(sourceDirectoryPath, {
      withFileTypes: true
    });

    const addonDirectories = allEntries
      .filter((entry) => entry.isDirectory)
      .map((entry) => entry.name);

    if (!this.validateAddonDirectories(expectedDirectories, addonDirectories)) {
      throw new Error(
        `Addon's unzipped contents don't match manifest. Expected ${expectedDirectories} Actual ${addonDirectories}`
      );
    }

    // problem here if the prior version contained directories the new one does not.
    // need to remove those
    await Promise.all(
      addonDirectories.map((directory) => {
        return fs.promises.rmdir(
          path.join(destinationDirectoryPath, directory),
          {
            recursive: true,
            maxRetries: 3
          }
        );
      })
    );

    await Promise.all(
      addonDirectories.map((directory) => {
        return fs.promises.rename(
          path.join(sourceDirectoryPath, directory),
          path.join(destinationDirectoryPath, directory)
        );
      })
    );
  }

  private validateAddonDirectories(
    expectedDirectories: string[],
    actualDirectories: string[]
  ) {
    const actualDirectoriesSet = new Set();
    for (const entry of actualDirectories) {
      actualDirectoriesSet.add(entry);
    }

    return (
      expectedDirectories.length === actualDirectories.length &&
      expectedDirectories.every((value) => actualDirectoriesSet.has(value))
    );
  }

  private async readAddonConfiguration(
    directory: string
  ): Promise<AddonConfiguration> {
    const filename = path.join(directory, addonConfigurationFilename);

    try {
      const fileBuffer = await fs.promises.readFile(filename);
      return JSON.parse(fileBuffer.toString());
    } catch (error) {
      return {
        version: addonConfigurationVersion,
        installedAddons: []
      };
    }
  }

  private async writeAddonConfiguration(
    addonConfiguration: AddonConfiguration,
    directory: string
  ) {
    await fs.promises.writeFile(
      path.join(directory, addonConfigurationFilename),
      JSON.stringify(addonConfiguration)
    );
  }
}

export default new AddonManger();
