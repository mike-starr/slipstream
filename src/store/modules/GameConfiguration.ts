import { VuexModule, Module, Mutation, Action } from "vuex-class-modules";
import path from "path";

@Module
export default class GameConfiguration extends VuexModule {
  installationRoot = "/Users/mstarr/Documents/wow_root";
  versions: string[] = [];
  selectedVersion = "";

  get selectedVersionRoot() {
    return path.join(
      this.installationRoot,
      this.selectedVersion,
      "Interface",
      "Addons"
    );
  }

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
