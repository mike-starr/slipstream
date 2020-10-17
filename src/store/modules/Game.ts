import { VuexModule, Module, Mutation, Action } from "vuex-class-modules";
import { updateAddonStates } from "@/store/index";
import path from "path";

type GameDirectories = {
  installationRoot: string;
  versions: string[];
};

@Module
export default class Game extends VuexModule {
  gameDirectories: GameDirectories = {
    installationRoot: "",
    versions: []
  };
  selectedVersion = "";

  addonDirectoryForVersion(version: string) {
    return path.join(
      this.gameDirectories.installationRoot,
      version,
      "Interface",
      "Addons"
    );
  }

  @Mutation
  setGameDirectories(directories: GameDirectories) {
    this.gameDirectories = directories;
  }

  @Mutation
  selectVersion(version: string) {
    this.selectedVersion = version;
  }

  @Action
  updateInstallationRoot(path: string) {
    if (this.gameDirectories.installationRoot === path) {
      return;
    }

    const versions = ["_retail_", "_classic_", "_beta_"];

    updateAddonStates(versions);

    this.setGameDirectories({
      installationRoot: path,
      versions: versions
    });
  }
}
