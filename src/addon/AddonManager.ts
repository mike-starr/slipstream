import AddonReference from "./AddonReference";
import CurseRepository from "./repositories/CurseRepository";
import AddonRepository from "./repositories/AddonRepository";
import { GameFlavor } from "@/addon/GameFlavor";
import fs from "fs";
import got from "got";
import path from "path";
import util from "util";
import stream from "stream";
import unzipper from "unzipper";

const streamPipeline = util.promisify(stream.pipeline);

const configurationVersion = "1.0";
const configurationFilename = "config.json";

interface Configuration {
  registry: AddonRegistry;
  version: string;
}

interface AddonRegistry {
  [key: string]: InstalledAddonList;
}

interface InstalledAddonList {
  rootDirectory: string;
  gameFlavor: GameFlavor;
  installedAddons: InstalledAddon[];
}

interface InstalledAddon {
  id: number;
  repository: string;
}

interface RepositoryMap {
  [key: string]: AddonRepository;
}

class AddonManger {
  private readonly repositories: RepositoryMap = {
    curse: new CurseRepository()
  };
  private configuration: Configuration = {
    version: configurationVersion,
    registry: {}
  };

  private configurationDirectory = "";
  private tempDirectory = "";

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
    console.log(`installing ${addon.title} to ${directory}`);

    const localPath = path.join(
      this.tempDirectory,
      `${addon.id}-${Date.now()}.zip`
    );
    const extractionDirectory = `${localPath}_extracted`;

    await this.downloadFile(addon.fileUrl, localPath, (pct) =>
      console.log(`downloading ${pct * 100}%`)
    );
    console.log("unzipping");
    await this.unzipFile(localPath, extractionDirectory);
    console.log("validating");
    await this.validateAddon(extractionDirectory, addon);
    console.log("moving");
    await this.moveAddonDirectories(extractionDirectory, directory);

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

  private unzipFile(filename: string, destinationDirectory: string) {
    return streamPipeline(
      fs.createReadStream(filename),
      unzipper.Extract({ path: destinationDirectory })
    );
  }

  private validateAddon(directory: string, addon: AddonReference) {
    // list stuff in directory, compare to contents of addon reference.
    return new Promise((resolve) => {
      resolve();
    });
  }

  private async moveAddonDirectories(
    sourceDirectoryPath: string,
    destinationDirectoryPath: string
  ) {
    const allEntries = await fs.promises.readdir(sourceDirectoryPath, {
      withFileTypes: true
    });

    const addonDirectories = allEntries
      .filter((entry) => entry.isDirectory)
      .map((entry) => entry.name);

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
}

export default new AddonManger();
