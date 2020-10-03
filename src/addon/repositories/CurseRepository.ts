import got from "got";

import AddonRepository from "./AddonRepository";
import AddonDescription from "@/addon/AddonDescription";
import { GameFlavor } from "@/addon/GameFlavor";
import {
  createSearchRequest,
  GameVersionFlavor,
  ReleaseType
} from "@/addon/apis/CurseApi";
import Addon from "@/store/modules/Addon";

export default class CurseRepository implements AddonRepository {
  async search(
    searchTerm: string,
    gameFlavor: GameFlavor
  ): Promise<AddonDescription[]> {
    const searchResponseJSON: any = await got
      .get(createSearchRequest(0, 50, searchTerm))
      .json();

    const searchResults = [];

    for (const addon of searchResponseJSON) {
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
          ),
          status: {
            state: "NotInstalled"
          }
        } as AddonDescription);
      }
    }

    return searchResults;
  }



  private latestFileForFlavor(addon: any, gameFlavor: GameFlavor) {
    for (const latestFile of addon.latestFiles) {
      if (
        latestFile.releaseType !== ReleaseType.Release ||
        latestFile.isAlternate
      ) {
        // Ignoring beta/alpha channels for now, and "alternate" releases.
        continue;
      }

      if (
        (latestFile.gameVersionFlavor === GameVersionFlavor.Classic
          ? "classic"
          : "retail") === gameFlavor
      ) {
        return latestFile;
      }
    }
  }
}
