import AddonReference from "./AddonReference";
import CurseRepository from "./repositories/CurseRepository";
import AddonRepository from "./repositories/AddonRepository";
import { GameFlavor } from "@/addon/GameFlavor";
import fs from "fs";
import got from "got";
import path from "path";
import util from "util";
import stream from "stream";
import { unzipToDirectory } from "@/util/Unzip";

const streamPipeline = util.promisify(stream.pipeline);

const configurationVersion = "1.0";
const configurationFilename = "config.json";

const addonConfigurationVersion = "1.0";
const addonConfigurationFilename = "slipstream.json";

interface ApplicationConfiguration {
  version: string;
}

interface AddonConfiguration {
  version: string;
  installedAddons: InstalledAddon[];
}

interface InstalledAddon {
  id: number;
  repository: string;
  directories: string[];
  fileDate: string;
}

interface RepositoryMap {
  [key: string]: AddonRepository;
}

class AddonManger {
  private readonly repositories: RepositoryMap = {
    curse: new CurseRepository()
  };

  private configurationDirectory = "";
  private tempDirectory = "";

  private configuration: ApplicationConfiguration = {
    version: configurationVersion
  };

  async initialize(configurationDirectory: string, tempDirectory: string) {
    this.configurationDirectory = configurationDirectory;
    this.tempDirectory = tempDirectory;

    const configurationFile = path.join(
      this.configurationDirectory,
      configurationFilename
    );

    try {
      await fs.promises.access(
        configurationFile,
        fs.constants.W_OK | fs.constants.R_OK
      );

      const fileBuffer = await fs.promises.readFile(configurationFile);
      this.configuration = JSON.parse(fileBuffer.toString());
    } catch (error) {
      console.log(
        `Configuration file does not exist or is inaccessible. Starting from an empty configuration. ${error}`
      );
      return;
    }
  }

  async install(addon: AddonReference, directory: string) {
    console.log(
      `installing ${addon.title} to ${directory} folders: ${addon.directories}`
    );

    const addonConfig = await this.readAddonConfiguration(directory);

    const localPath = path.join(
      this.tempDirectory,
      `${addon.id}-${Date.now()}.zip`
    );
    const extractionDirectory = `${localPath}_extracted`;

    await this.downloadFile(addon.fileUrl, localPath, (pct) =>
      console.log(`downloading ${pct * 100}%`)
    );
    console.log("unzipping");

    await unzipToDirectory(localPath, extractionDirectory, true);
    console.log("moving");

    await this.validateAndMove(
      extractionDirectory,
      directory,
      addon.directories
    );

    console.log("updating config");
    const addonIndex = addonConfig.installedAddons.findIndex(
      (installedAddon) => {
        return (
          installedAddon.id === addon.id &&
          installedAddon.repository === addon.repository
        );
      }
    );

    const updatedAddonConfig = {
      id: addon.id,
      repository: addon.repository,
      fileDate: addon.fileDate,
      directories: addon.directories
    };

    if (addonIndex >= 0) {
      addonConfig.installedAddons[addonIndex] = updatedAddonConfig;
    } else {
      addonConfig.installedAddons.push(updatedAddonConfig);
    }

    this.writeAddonConfiguration(addonConfig, directory);
    console.log("installation complete");
    // set up the UI hooks to display status
  }

  async search(
    searchTerm: string,
    gameFlavor: GameFlavor
  ): Promise<AddonReference[]> {
    const results = await Promise.allSettled(
      Object.values(this.repositories).map((repository) =>
        repository.search(searchTerm, gameFlavor)
      )
    );

    const fulfilledResults: AddonReference[] = [];

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
      await fs.promises.access(filename, fs.constants.W_OK | fs.constants.R_OK);

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
