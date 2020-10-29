import { GameFlavor } from "./GameFlavor";

export default interface AddonDescription {
  readonly slipstreamId: string; // An ID that uniquely identifies this addon within slipstream.
  readonly repositoryId: number; // The addon's ID as defined by its repository (i.e. curse).
  readonly repository: string;
  readonly author: string;
  readonly gameFlavor: GameFlavor;
  readonly title: string;
  readonly summary: string;
  readonly fileUrl: string;
  readonly fileDate: string;
  readonly displayVersion: string;
  readonly gameVersion: string;
  readonly thumbnailUrl: string;
  readonly websiteUrl: string;
  readonly directories: string[];
}

export function makeAddonDescription(
  repositoryId: number,
  repository: string,
  author: string,
  gameFlavor: GameFlavor,
  title: string,
  summary: string,
  fileUrl: string,
  fileDate: string,
  displayVersion: string,
  gameVersion: string,
  thumbnailUrl: string,
  websiteUrl: string,
  directories: string[]
): AddonDescription {
  return {
    slipstreamId: `${repository}:${repositoryId}`,
    repositoryId,
    repository,
    author,
    gameFlavor,
    title,
    summary,
    fileUrl,
    fileDate,
    displayVersion,
    gameVersion,
    thumbnailUrl,
    websiteUrl,
    directories
  };
}
