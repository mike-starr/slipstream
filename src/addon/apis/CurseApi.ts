import got from "got";

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

export function search(
  searchFilter: string,
  index: number,
  pageSize: number
): any {
  return got
    .get(
      `${baseApiUrl}/addon/search?gameId=1&index=${index}&pageSize=${pageSize}&searchFilter=${searchFilter}`
    )
    .json();
}

export function addonDescriptions(ids: number[]) {
  return got
    .post(`${baseApiUrl}/addon`, {
      json: ids
    })
    .json();
}
