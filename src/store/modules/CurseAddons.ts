/*import { VuexModule, Module, Action } from "vuex-class-modules";
import axios from "axios";
import rootStore from "@/store/index";
import { GameConfigurationState } from "@/store/index";
import fs from "fs";
import curseRepository from "@/repositories/CurseRepository";

@Module
export default class CurseAddons extends VuexModule {
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
*/