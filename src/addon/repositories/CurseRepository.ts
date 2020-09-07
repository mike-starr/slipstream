import axios from "axios";

import AddonRepository from "./AddonRepository";
import AddonSearchResult from "@/addon/AddonSearchResult";
import { GameFlavor } from "@/addon/GameFlavor";
import {
  createSearchRequest,
  GameVersionFlavor,
  ReleaseType
} from "@/addon/apis/CurseApi";

export default class CurseRepository implements AddonRepository {
  async search(
    searchTerm: string,
    gameFlavor: GameFlavor
  ): Promise<AddonSearchResult[]> {
    const searchResponseJSON = await axios.get(
      createSearchRequest(0, 50, searchTerm)
    );

    const searchResults = [];

    for (const addon of searchResponseJSON.data) {
      const latestFile = this.latestFileForFlavor(addon, gameFlavor);
      if (latestFile) {
        const thumbnailUrl = (
          addon.categories.find(
            (category: any) => category.categoryId === addon.primaryCategoryId
          ) || addon.categories[0]
        ).avatarUrl;

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
