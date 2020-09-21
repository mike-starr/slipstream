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

    // move this stuff to utility, sanitize progress reporting
    await this.downloadFile(addon.fileUrl, localPath);

    await streamPipeline(
      fs.createReadStream(localPath),
      unzipper.Extract({ path: `${localPath}_extracted` })
    );

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

  private async downloadFile(url: string, localFile: string) {
    console.log(`downloading ${url} to ${localFile}`);

    return streamPipeline(
      got.stream(url).on("downloadProgress", (progress) => {
        console.log(
          `progress: ${progress.percent * 100}% trans: ${
            progress.transferred
          } total: ${progress.total}`
        );
      }),
      fs.createWriteStream(localFile)
    );
  }
}

export default new AddonManger();
