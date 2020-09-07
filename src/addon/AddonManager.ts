import AddonSearchResult from "./AddonSearchResult";
import CurseRepository from "./repositories/CurseRepository";
import { GameFlavor } from "@/addon/GameFlavor";
import fs from "fs";

const configurationVersion = "1.0";

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

class AddonManger {
  private readonly repositories = [new CurseRepository()];
  private configuration: Configuration = {
    version: configurationVersion,
    registry: {}
  };

  async initializeFromFile(filename: string) {
    try {
      await fs.promises.access(filename, fs.constants.W_OK | fs.constants.R_OK);
    } catch (error) {
      console.log(
        `Configuration file does not exist or is inaccessible. Starting from an empty configuration. ${error}`
      );
      return;
    }

    const fileBuffer = await fs.promises.readFile(filename);
    this.configuration = JSON.parse(fileBuffer.toString());

    // add to config and save when installing an addon.
  }

  async search(
    searchTerm: string,
    gameFlavor: GameFlavor
  ): Promise<AddonSearchResult[]> {
    const results = await Promise.allSettled(
      this.repositories.map((repository) =>
        repository.search(searchTerm, gameFlavor)
      )
    );

    const fulfilledResults: AddonSearchResult[] = [];

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
}

export default new AddonManger();
