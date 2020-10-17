import Vue from "vue";
import { VuexModule, Module, Action, Mutation } from "vuex-class-modules";
import addonManager from "@/addon/AddonManager";
import { makeAddonStatus, default as AddonStatus } from "@/addon/AddonStatus";
import { GameState } from "@/store/index";
import AddonDescription from "@/addon/AddonDescription";

type AddonDescriptionMap = {
  [key: string]: AddonDescription;
};

@Module
export default class Addon extends VuexModule {
  gameVersion = "";
  installedAddons: AddonDescriptionMap = {};
  latestAddons: AddonDescriptionMap = {};
  searchResults: AddonDescription[] = [];
  addonStatus: {
    [key: string]: AddonStatus;
  } = {};

  @Mutation
  setVersion(version: string) {
    this.gameVersion = version;
  }

  @Mutation
  setSearchResults(searchResults: AddonDescription[]) {
    this.searchResults = searchResults;
  }

  @Mutation
  setInstalledAddon(addon: AddonDescription) {
    Vue.set(this.installedAddons, addon.slipstreamId, addon);
  }

  @Mutation
  clear() {
    this.installedAddons = {};
    this.searchResults = [];
    this.addonStatus = {};
  }

  @Mutation
  setAddonStatus(params: { addon: AddonDescription; status: AddonStatus }) {
    Vue.set(this.addonStatus, params.addon.slipstreamId, params.status);
  }

  @Mutation
  setLatestAddon(addon: AddonDescription) {
    Vue.set(this.latestAddons, addon.slipstreamId, addon);
  }

  @Action
  async refresh() {
    this.clear();

    const installedAddons = await addonManager.findInstalledAddons(
      GameState.addonDirectoryForVersion(this.gameVersion)
    );

    for (const addon of installedAddons) {
      this.setAddonStatus({ addon, status: makeAddonStatus("Installed") });
      this.setInstalledAddon(addon);
    }

    await this.checkForUpdates();
  }

  @Action
  async checkForUpdates() {
    const latestAddons = await addonManager.latestVersionForAddons(
      Object.values(this.installedAddons)
    );

    for (const latestAddon of latestAddons) {
      this.setLatestAddon(latestAddon);
    }
  }

  @Action
  async search(searchTerm: string) {
    const searchResults = await addonManager.search(
      searchTerm,
      this.gameVersion
    );

    for (const result of searchResults) {
      if (!this.addonStatus[result.slipstreamId]) {
        this.setAddonStatus({
          addon: result,
          status: makeAddonStatus("NotInstalled")
        });
      }
    }

    this.setSearchResults(searchResults);
  }

  @Action
  async install(addon: AddonDescription) {
    try {
      this.setAddonStatus({
        addon,
        status: makeAddonStatus("Installing", 0, "Initializing")
      });

      await addonManager.install(
        addon,
        GameState.addonDirectoryForVersion(this.gameVersion),
        (operation, percentage) => {
          if (
            percentage >= 100 ||
            percentage -
              (this.addonStatus[addon.slipstreamId]?.progress?.percentage ||
                0) >
              0.01
          ) {
            this.setAddonStatus({
              addon,
              status: makeAddonStatus("Installing", percentage, operation)
            });
          }
        }
      );

      this.setAddonStatus({ addon, status: makeAddonStatus("Installed") });
      this.setInstalledAddon(addon);
    } catch (error) {
      this.setAddonStatus({
        addon,
        status: makeAddonStatus("Error")
      });
      console.log(error);
    }
  }

  @Action
  update(addon: AddonDescription) {
    const latestVersion = this.latestAddons[addon.slipstreamId];

    if (!latestVersion) {
      console.warn(
        `No updgrade found for addon: ${addon.title} id: ${addon.slipstreamId}`
      );
      return;
    }

    this.install(latestVersion);
  }
}
