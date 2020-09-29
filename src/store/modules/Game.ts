import { VuexModule, Module, Mutation, Action } from "vuex-class-modules";
import path from "path";
import { GameFlavor } from "@/addon/GameFlavor";

@Module
export default class Game extends VuexModule {
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

  get selectedVersionFlavor(): GameFlavor {
    return this.selectedVersion === "_classic_" ? "classic" : "retail";
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
    this.setVersions(["_retail_", "_classic_", "_beta_"]);
  }
}
