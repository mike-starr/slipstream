//import axios from "axios";
import fs from "fs";

export interface AddonSearchResult {
  id: number;
  title: string;
  summary: string;
  thumbnailUrl: string;
}

enum CurseReleaseType {
  Release = 1,
  Beta = 2,
  Alpha = 3
}

type GameFlavor = "retail" | "classic";

type CurseAddon = {
  id: number;
  name: string;
  date: string;
  folders: string[];
};

type FolderIndex = {
  [folderName: string]: number[];
};

type AddonIndex = {
  [id: number]: CurseAddon;
};

type CurseAddonDatabase = {
  [gameFlavor in GameFlavor]: {
    folderIndex: FolderIndex;
    addonIndex: AddonIndex;
  };
};

type CurseAddonIdentificationResult = {
  installedAddons: CurseAddon[];
  conflicts: CurseAddon[][];
  unidentified: string[];
};

class CurseRepository {
  private static readonly baseApiUrl = "https://addons-ecs.forgesvc.net/api/v2";
  private static readonly databaseFilename = "curse_addon_database.json";
  private static readonly maxAddons = 15000;

  private databaseDirectory = "";

  private addonDatabase: CurseAddonDatabase = {
    classic: {
      folderIndex: {},
      addonIndex: {}
    },
    retail: {
      folderIndex: {},
      addonIndex: {}
    }
  };

  /*  async downloadCurseAddonList() {

    const pageSize = 500;
    let index = 0;

    const aggregateResponses = [];

    while (index < CurseRepository.maxAddons) {
      let apiResponse;
      try {
        apiResponse = await axios.get(
          this.createAddonSearchRequest(index, pageSize)
        );

        if (apiResponse.data.length > 0) {
          aggregateResponses.push(...apiResponse.data);
          console.log(`appended ${apiResponse.data.length} addons.`);
        } else {
          break;
        }

        index += pageSize;
      } catch (error) {
        console.log(`curse api error: ${error}`);
        break;
      }
    }

    fs.promises.writeFile(
      databaseDirectory + "/all_curse_addons.json",
      JSON.stringify(aggregateResponses)
    );
  }*/

  async initialize(databaseDirectory: string) {
    this.databaseDirectory = databaseDirectory;

    const curseAddonFile = await fs.promises.readFile(
      this.databaseDirectory + "/all_curse_addons.json"
    );
    const response = { data: JSON.parse(curseAddonFile.toString()) };

    this.addonDatabase = {
      classic: {
        folderIndex: {},
        addonIndex: {}
      },
      retail: {
        folderIndex: {},
        addonIndex: {}
      }
    };

    for (const addon of response.data) {
      try {
        for (const latestFile of addon.latestFiles) {
          if (
            latestFile.releaseType !== CurseReleaseType.Release ||
            latestFile.isAlternate
          ) {
            // Ignoring beta/alpha channels for now, and "alternate" releases.
            continue;
          }

          // Ignore addons that haven't been updated in years?
          /*const oldestValidDate = new Date();
          oldestValidDate.setUTCFullYear(oldestValidDate.getUTCFullYear() - 2);
          const lastUpdateDate = new Date(latestFile.fileDate);

          if (oldestValidDate > lastUpdateDate) {
            console.log(`Ignoring addon ${addon.name} - last updated ${lastUpdateDate}`);
            continue;
          }*/

          const flavor: GameFlavor =
            latestFile.gameVersionFlavor === "wow_classic"
              ? "classic"
              : "retail";

          this.addonDatabase[flavor].addonIndex[addon.id] = {
            id: addon.id,
            name: addon.name,
            date: latestFile.fileDate,
            folders: []
          };

          for (const module of latestFile.modules) {
            if (!this.addonDatabase[flavor].folderIndex[module.foldername]) {
              this.addonDatabase[flavor].folderIndex[module.foldername] = [];
            }
            this.addonDatabase[flavor].folderIndex[module.foldername].push(
              addon.id
            );

            this.addonDatabase[flavor].addonIndex[addon.id].folders.push(
              module.foldername
            );
          }
        }
      } catch (error) {
        console.log(`Failed to process addon: ${addon}: ${error}`);
      }
    }

    try {
      await fs.promises.writeFile(
        `${databaseDirectory}/${CurseRepository.databaseFilename}`,
        JSON.stringify(this.addonDatabase)
      );
    } catch (error) {
      console.log(`Failed to write addon database: ${error}.`);
    }

    console.log(this.addonDatabase);

    /*for (const folderMapEntry of Object.entries(
      this.addonDatabase.retail.folderIndex
    )) {
      if (folderMapEntry[1].length > 1) {
        this.doAddonsConflict(
          folderMapEntry[1],
          this.addonDatabase.retail.addonIndex
        );
        const addonList = [];
        for (const addonId of folderMapEntry[1]) {
          addonList.push(this.addonDatabase.retail.addonIndex[addonId].name);
        }

        //console.log(`Folder ${folderMapEntry[0]} in addons: ${addonList}`);
      }
    }*/
  }

  /*private doAddonsConflict(addonIds: number[], addonIndex: AddonIndex) {
    for (let i = 0; i < addonIds.length; ++i) {
      for (let j = i + 1; j < addonIds.length; ++j) {
        const addon1 = addonIndex[addonIds[i]];
        const addon2 = addonIndex[addonIds[j]];
        let conflicts = true;

        //console.log(`checking ${addon1.name} and ${addon2.name}}`)

        if (addon1.folders.length === addon2.folders.length) {
          for (const addon1Folder of addon1.folders) {
            if (!addon2.folders.includes(addon1Folder)) {
              conflicts = false;
              break;
            }
          }

          if (conflicts) {
            //console.log(`Addon ${addon1.name} conflicts with ${addon2.name}`);
          }
        }
      }
    }
  }*/

  async identifyInstalledAddons(
    addonDirectory: string,
    gameFlavor: GameFlavor
  ): Promise<CurseAddonIdentificationResult> {
    console.log(`addon dir ${addonDirectory}`);
    const addonDirectoryContents = await fs.promises.readdir(addonDirectory, {
      withFileTypes: true
    });

    const potentiallyInstalledAddons = new Set<number>();
    const folders = new Set<string>();
    const unidentifiedFolders: string[] = [];

    addonDirectoryContents
      .filter((entry) => entry.isDirectory())
      .forEach((entry) => {
        folders.add(entry.name);
        const addonIds = this.addonDatabase[gameFlavor].folderIndex[entry.name];
        if (addonIds) {
          addonIds.forEach((addonId) =>
            potentiallyInstalledAddons.add(addonId)
          );
        } else {
          unidentifiedFolders.push(entry.name);
        }
      });

    console.log(potentiallyInstalledAddons);

    const verifiedAddons = new Set<CurseAddon>();
    const folderUseMap = new Map<string, number[]>();

    potentiallyInstalledAddons.forEach((addonId) => {
      const curseAddon = this.addonDatabase[gameFlavor].addonIndex[addonId];

      if (this.verifyAddonInstalled(curseAddon, folders)) {
        verifiedAddons.add(curseAddon);
        curseAddon.folders.forEach((folder) => {
          const folderMapEntry = folderUseMap.get(folder);
          if (folderMapEntry) {
            folderMapEntry.push(curseAddon.id);
          } else {
            folderUseMap.set(folder, [curseAddon.id]);
          }
        });
      }
    });

    // look at stuff in folder use that has more than
    // one elemnent in the array
    // several different cases
    // 1. some addons share a dependency, that's fine
    // 2. some addons like details are total dupes, needs resolution
    // 3. some addon could be a total subset of the other? would need to pick the bigger one in that case.
    // 4. some combination of the above, which sucks.
    // should download the entire curse repo and run the folder index to figure out which of
    // these problems actually exist. right now only 1/2.

    console.log(folders);
    console.log(verifiedAddons);

    return {
      installedAddons: Array.from(verifiedAddons),
      conflicts: [],
      unidentified: unidentifiedFolders
    };
  }

  async searchAddons(searchTerm: string): Promise<AddonSearchResult[]> {
    /*const searchResponseJSON = await axios.get(
      this.createAddonSearchRequest(0, 50, searchTerm)
    );*/

    const searchResponse = await fs.promises.readFile(
      this.databaseDirectory + "/curse_search_result.json"
    );

    const searchResponseJSON = { data: JSON.parse(searchResponse.toString()) };

    console.log(`searching for ${searchTerm}`);

    const jsonResults = searchResponseJSON.data.filter((addon: any) =>
      addon.name.toLowerCase().startsWith(searchTerm.toLowerCase())
    );

    const searchResults = [];

    for (const addon of jsonResults) {
      const latestFile = this.latestFileForFlavor(addon, "retail");
      if (latestFile) {
        const thumbnailUrl = (addon.categories.find(
          (category: any) => category.categoryId === addon.primaryCategoryId
        ) || addon.categories[0]).avatarUrl;

        searchResults.push({
          id: addon.id,
          title: addon.name,
          summary: addon.summary,
          thumbnailUrl: thumbnailUrl
        });
      }
    }

    return searchResults;
  }

  private latestFileForFlavor(addon: any, gameFlavor: GameFlavor) {
    for (const latestFile of addon.latestFiles) {
      if (
        latestFile.releaseType !== CurseReleaseType.Release ||
        latestFile.isAlternate
      ) {
        // Ignoring beta/alpha channels for now, and "alternate" releases.
        continue;
      }

      const flavor: GameFlavor =
        latestFile.gameVersionFlavor === "wow_classic" ? "classic" : "retail";

      if (flavor === gameFlavor) {
        return latestFile;
      }
    }
  }

  private createAddonSearchRequest(
    index: number,
    pageSize: number,
    searchFilter = ""
  ) {
    return `${CurseRepository.baseApiUrl}/addon/search?gameId=1&index=${index}&pageSize=${pageSize}&searchFilter=${searchFilter}`;
  }

  private verifyAddonInstalled(
    addon: CurseAddon,
    folders: Set<string>
  ): boolean {
    for (const folder of addon.folders) {
      if (!folders.has(folder)) {
        console.log(`rejected  ${addon.name} for not having ${folder}`);
        return false;
      }
    }

    return true;
  }
}

//export default new CurseRepository();
