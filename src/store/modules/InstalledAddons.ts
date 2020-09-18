import { VuexModule, Module, Mutation, Action } from "vuex-class-modules";
import addonManager from '@/addon/AddonManager';
import AddonReference from '@/addon/AddonReference';
import { GameConfigurationState } from "@/store/index";

@Module
export default class InstalledAddons extends VuexModule {


  @Action
  async install(addon: AddonReference) {
    addonManager.install(addon, GameConfigurationState.selectedVersionRoot);
  }
}
