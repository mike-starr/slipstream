import AddonRepository from "./AddonRepository";
import AddonDescription from "@/addon/AddonDescription";
import { GameFlavor } from "@/addon/GameFlavor";
import * as CurseApi from "@/addon/apis/CurseApi";

export default class CurseRepository implements AddonRepository {
  async search(
    searchTerm: string,
    gameFlavor: GameFlavor
  ): Promise<AddonDescription[]> {
    const searchApiResponse = await CurseApi.search(searchTerm, 0, 50);
    const searchResults = [];

    for (const addon of searchApiResponse) {
      const latestFile = this.latestFileForFlavor(addon, gameFlavor);
      if (latestFile) {
        const thumbnailUrl = (
          addon.categories.find(
            (category: any) => category.categoryId === addon.primaryCategoryId
          ) || addon.categories[0]
        ).avatarUrl;

        searchResults.push({
          id: addon.id,
          repository: "curse",
          gameFlavor: gameFlavor,
          title: addon.name,
          summary: addon.summary,
          fileUrl: latestFile.downloadUrl,
          fileDate: latestFile.fileDate,
          thumbnailUrl: thumbnailUrl,
          directories: latestFile.modules.map(
            (module: any) => module.foldername
          )
        } as AddonDescription);
      }
    }

    return searchResults;
  }

  async addonDescriptionsForIds(
    ids: number[],
    gameFlavor: GameFlavor
  ): Promise<AddonDescription[]> {
    const response = await CurseApi.addonDescriptions(ids);

   /* console.log(
      `response ${descriptions.map((entry) => JSON.stringify(entry))}`
    );*/

    return this.addonDescriptionsFromApiResponse(
      response,
      gameFlavor
    );
  }

  private addonDescriptionsFromApiResponse(
    apiResponse: any,
    gameFlavor: GameFlavor
  ) {
    const searchResults = [];

    for (const addon of apiResponse) {
      const latestFile = this.latestFileForFlavor(addon, gameFlavor);
      if (latestFile) {
        const thumbnailUrl = (
          addon.categories.find(
            (category: any) => category.categoryId === addon.primaryCategoryId
          ) || addon.categories[0]
        ).avatarUrl;

        searchResults.push({
          id: addon.id,
          repository: "curse",
          title: addon.name,
          summary: addon.summary,
          fileUrl: latestFile.downloadUrl,
          fileDate: latestFile.fileDate,
          thumbnailUrl: thumbnailUrl,
          directories: latestFile.modules.map(
            (module: any) => module.foldername
          )
        } as AddonDescription);
      }
    }

    return searchResults;
  }

  private latestFileForFlavor(addon: any, gameFlavor: GameFlavor) {
    for (const latestFile of addon.latestFiles) {
      if (
        latestFile.releaseType !== CurseApi.ReleaseType.Release ||
        latestFile.isAlternate
      ) {
        // Ignoring beta/alpha channels for now, and "alternate" releases.
        continue;
      }

      if (
        (latestFile.gameVersionFlavor === CurseApi.GameVersionFlavor.Classic
          ? "classic"
          : "retail") === gameFlavor
      ) {
        return latestFile;
      }
    }
  }
}
