import { VuexModule, Module, Action } from "vuex-class-modules";
import addonManager from "@/addon/AddonManager";
import AddonReference from "@/addon/AddonReference";
import { GameState } from "@/store/index";

@Module
export default class InstalledAddons extends VuexModule {
  @Action
  async install(addon: AddonReference) {
    addonManager.install(addon, GameState.selectedVersionRoot);
  }
}
