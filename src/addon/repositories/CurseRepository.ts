import AddonRepository from "./AddonRepository";
import {
  makeAddonDescription,
  default as AddonDescription
} from "@/addon/AddonDescription";
import { GameFlavor } from "@/addon/GameFlavor";
import * as CurseApi from "@/addon/apis/CurseApi";

export default class CurseRepository implements AddonRepository {
  async search(
    searchTerm: string,
    gameFlavor: GameFlavor
  ): Promise<AddonDescription[]> {
    const searchApiResponse = await CurseApi.search(searchTerm, 0, 50);
    return this.addonDescriptionsFromApiResponse(searchApiResponse, gameFlavor);
  }

  async addonDescriptionsForIds(
    ids: number[],
    gameFlavor: GameFlavor
  ): Promise<AddonDescription[]> {
    const response = await CurseApi.addonDescriptions(ids);
    return this.addonDescriptionsFromApiResponse(response, gameFlavor);
  }

  private addonDescriptionsFromApiResponse(
    apiResponse: any,
    gameFlavor: GameFlavor
  ) {
    const descriptions = [];

    for (const addon of apiResponse) {
      const latestFile = this.latestFileForFlavor(addon, gameFlavor);
      if (latestFile) {
        const thumbnailUrl = (
          addon.categories.find(
            (category: any) => category.categoryId === addon.primaryCategoryId
          ) || addon.categories[0]
        ).avatarUrl;

        let gameVersion = "unknown";

        if (
          Array.isArray(addon.gameVersionLatestFiles) &&
          addon.gameVersionLatestFiles.length > 0
        ) {
          const versionEntry = addon.gameVersionLatestFiles.find(
            (item: any) => item.projectFileName === latestFile.fileName
          );

          if (versionEntry) {
            gameVersion = versionEntry.gameVersion;
          } else {
            gameVersion = addon.gameVersionLatestFiles[0].gameVersion;
          }
        }

        descriptions.push(
          makeAddonDescription(
            addon.id,
            "curse",
            addon.authors?.[0]?.name || "unknown",
            gameFlavor,
            addon.name,
            addon.summary,
            latestFile.downloadUrl,
            latestFile.fileDate,
            latestFile.fileName,
            gameVersion,
            thumbnailUrl,
            addon.websiteUrl,
            latestFile.modules.map((module: any) => module.foldername)
          )
        );
      }
    }

    return descriptions;
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
