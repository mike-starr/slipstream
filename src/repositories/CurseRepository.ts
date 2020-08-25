export default class CurseRepository {
  private static baseApiUrl = "https://addons-ecs.forgesvc.net";
  //private static baseApiUrl = "https://addons-ecs.forgesvc.net";

  async initializeDatabase(appDataDirectory: string) {
    return new Promise((resolve) => resolve());
  }
}
