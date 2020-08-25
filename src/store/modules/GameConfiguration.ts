import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators";

@Module({
  name: "GameConfiguration",
  namespaced: true
})
export default class GameConfiguration extends VuexModule {
  installationRoot = "/Users/mstarr/Documents/wow_root";
  versions: string[] = [];
  selectedVersion = "";

  @Mutation
  setVersions(versions: string[]) {
    this.versions = versions;
  }

  @Mutation
  selectVersion(version: string) {
    this.selectedVersion = version;
  }

  @Action({ commit: "setVersions" })
  async updateVersions() {
    return new Promise((resolve) => {
      resolve(["_retail_", "_classic_"]);
    });
  }
}
