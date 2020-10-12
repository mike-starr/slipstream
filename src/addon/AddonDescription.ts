import { GameFlavor } from "./GameFlavor";

export default interface AddonDescription {
  readonly slipstreamId: string; // An ID that uniquely identifies this addon within slipstream.
  readonly id: number; // The addon's ID as defined by its repository (i.e. curse).
  readonly repository: string;
  readonly gameFlavor: GameFlavor;
  readonly title: string;
  readonly summary: string;
  readonly fileUrl: string;
  readonly fileDate: string;
  readonly thumbnailUrl: string;
  readonly directories: string[];
}

export function makeAddonDescription(
  id: number,
  repository: string,
  gameFlavor: GameFlavor,
  title: string,
  summary: string,
  fileUrl: string,
  fileDate: string,
  thumbnailUrl: string,
  directories: string[]
): AddonDescription {
  return {
    id,
    repository,
    gameFlavor,
    title,
    summary,
    fileUrl,
    fileDate,
    thumbnailUrl,
    directories,
    slipstreamId: `${repository}:${id}`
  };
}
