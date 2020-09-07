const baseApiUrl = "https://addons-ecs.forgesvc.net/api/v2";

export enum ReleaseType {
  Release = 1,
  Beta = 2,
  Alpha = 3
}

export enum GameVersionFlavor {
  Classic = "wow_classic",
  Retail = "wow_retail"
}

export function createSearchRequest(
  index: number,
  pageSize: number,
  searchFilter: string
) {
  return `${baseApiUrl}/addon/search?gameId=1&index=${index}&pageSize=${pageSize}&searchFilter=${searchFilter}`;
}
