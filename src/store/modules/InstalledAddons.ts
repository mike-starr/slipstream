import { VuexModule, Module, Mutation, Action } from "vuex-class-modules";

@Module
export default class InstalledAddons extends VuexModule {
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

  @Action
  async updateVersions() {
    this.setVersions(["_retail_", "_classic_"]);
  }
}
