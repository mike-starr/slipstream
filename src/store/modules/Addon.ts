import Vue from "vue";
import { VuexModule, Module, Action, Mutation } from "vuex-class-modules";
import addonManager from "@/addon/AddonManager";
import { makeAddonStatus, default as AddonStatus } from "@/addon/AddonStatus";
import { GameState } from "@/store/index";
import AddonDescription from "@/addon/AddonDescription";

@Module
export default class Addon extends VuexModule {
  installedAddons: AddonDescription[] = [];
  searchResults: AddonDescription[] = [];
  addonStatus: {
    [key: string]: AddonStatus;
  } = {};
  latestAddonVersions: {
    [key: string]: AddonDescription;
  } = {};
  gameVersion = "";

  @Mutation
  setVersion(version: string) {
    this.gameVersion = version;
  }

  @Mutation
  setSearchResults(searchResults: AddonDescription[]) {
    this.searchResults = searchResults;
  }

  @Mutation
  addInstalledAddon(addon: AddonDescription) {
    this.installedAddons.push(addon);
  }

  @Mutation
  setInstalledAddons(addons: AddonDescription[]) {
    this.installedAddons = addons;
  }

  @Mutation
  updateAddonStatus(params: { addon: AddonDescription; status: AddonStatus }) {
    Vue.set(this.addonStatus, params.addon.slipstreamId, params.status);
  }

  @Mutation
  updateAddonUpdateAvailability(params: {
    addon: AddonDescription;
    latestVersion: AddonDescription;
  }) {
    Vue.set(
      this.latestAddonVersions,
      params.addon.slipstreamId,
      params.latestVersion
    );
  }

  @Action
  async initialize(version: string) {
    const installedAddons = await addonManager.findInstalledAddons(
      GameState.addonDirectoryForVersion(version)
    );

    for (const addon of installedAddons) {
      this.updateAddonStatus({ addon, status: makeAddonStatus("UpToDate") });
    }

    this.setInstalledAddons(installedAddons);
  }

  @Action
  async checkForUpdates() {
    for (const addon of this.installedAddons) {
      console.log(`addon: ${JSON.stringify(addon)}`);
    }

    const latestAddons = await addonManager.latestVersionForAddons(
      this.installedAddons
    );

    for (const installedAddon of this.installedAddons) {
      const latestAddon = latestAddons.find(
        (addon) => addon.slipstreamId === installedAddon.slipstreamId
      );

      if (latestAddon && latestAddon.fileDate !== installedAddon.fileDate) {
        this.updateAddonUpdateAvailability({
          addon: installedAddon,
          latestVersion: latestAddon
        });
      }
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
        this.updateAddonStatus({
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
      this.updateAddonStatus({
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
              .01
          ) {
            this.updateAddonStatus({
              addon,
              status: makeAddonStatus("Installing", percentage, operation)
            });
          }
        }
      );

      this.updateAddonStatus({ addon, status: makeAddonStatus("UpToDate") });
      this.addInstalledAddon(addon);
    } catch (error) {
      this.updateAddonStatus({
        addon,
        status: makeAddonStatus("Error")
      });
      console.log(error);
    }
  }
}
