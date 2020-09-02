import {
  Module,
  VuexModule,
  Action,
  Mutation,
  MutationAction
} from "vuex-module-decorators";
import axios from "axios";
import rootStore from "@/store/index";
import { GameConfigurationState } from "@/store/index";
import fs from "fs";
import CurseRepository from "@/repositories/CurseRepository";

//const baseApiUrl = "https://addons-ecs.forgesvc.net";
const curseRepository = new CurseRepository();

/*enum CurseReleaseType {
  Release = 1,
  Beta = 2,
  Alpha = 3
}

type GameFlavor = "retail" | "classic";

type CurseAddon = {
  id: string;
  name: string;
  folders: string[];
};

type FolderIndex = {
  [folderName: string]: number[];
};

type AddonIndex = {
  [id: number]: CurseAddon;
};

type CurseAddonDatabase = {
  [gameFlavor in GameFlavor]: {
    folderIndex: FolderIndex;
    addonIndex: AddonIndex;
  };
};*/

@Module({
  name: "CurseAddons",
  namespaced: true
})
export default class CurseAddons extends VuexModule {
  /* addonDatabase: CurseAddonDatabase = {
    classic: {
      folderIndex: {},
      addonIndex: {}
    },
    retail: {
      folderIndex: {},
      addonIndex: {}
    }
  };

  discoveredAddons: CurseAddon[] = [];

  @Mutation
  setAddonDatabase(addonDatabase: CurseAddonDatabase) {
    this.addonDatabase = addonDatabase;
  }

  @Mutation
  setDiscoveredAddons(discoveredAddons: CurseAddon[]) {
    this.discoveredAddons = discoveredAddons;
  }*/

  @Action
  async initialize() {
    try {
      await curseRepository.initialize(rootStore.state.appDataDirectory);
      await curseRepository.identifyInstalledAddons(
        GameConfigurationState.installationRoot +
          "/" +
          GameConfigurationState.selectedVersion +
          "/Interface/Addons",
        GameConfigurationState.selectedVersion === "_classic_"
          ? "classic"
          : "retail"
      );
    } catch (error) {
      console.log(error);
    }
  }
}
