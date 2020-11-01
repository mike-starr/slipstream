import Vue from "vue";
import { VuexModule, Module, Action, Mutation } from "vuex-class-modules";
import addonManager from "@/addon/AddonManager";
import { makeAddonStatus, default as AddonStatus } from "@/addon/AddonStatus";
import { ApplicationState } from "@/store/index";
import AddonDescription from "@/addon/AddonDescription";

type AddonDescriptionMap = {
  [key: string]: AddonDescription;
};

@Module
export default class GameVersion extends VuexModule {
  gameVersion = "";
  updateCheckInProgress = false;
  updateAllInProgress = false;
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
  setUpdateCheckInProgress(value: boolean) {
    this.updateCheckInProgress = value;
  }

  @Mutation
  setUpdateAllInProgress(value: boolean) {
    this.updateAllInProgress = value;
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
  removeInstalledAddon(addon: AddonDescription) {
    Vue.delete(this.installedAddons, addon.slipstreamId);
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
      ApplicationState.addonDirectoryForVersion(this.gameVersion)
    );

    for (const addon of installedAddons) {
      this.setAddonStatus({ addon, status: makeAddonStatus("Installed") });
      this.setInstalledAddon(addon);
    }

    await this.checkForUpdates();
  }

  @Action
  async checkForUpdates() {
    this.setUpdateCheckInProgress(true);

    const latestAddons = await addonManager.latestVersionForAddons(
      Object.values(this.installedAddons)
    );

    for (const latestAddon of latestAddons) {
      this.setLatestAddon(latestAddon);
    }

    this.setUpdateCheckInProgress(false);
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

      // Update the latest set whenever search results are returned.
      this.setLatestAddon(result);
    }

    this.setSearchResults(searchResults);
  }

  @Action
  async install(addon: AddonDescription) {
    if (
      this.addonStatus[addon.slipstreamId].state !== "Installed" &&
      this.addonStatus[addon.slipstreamId].state !== "NotInstalled"
    ) {
      console.warn(
        `Attempted to install an addon (${addon.title}) while another operation was in progress.`
      );
      return;
    }

    try {
      this.setAddonStatus({
        addon,
        status: makeAddonStatus("Installing", 0, "Initializing")
      });

      await addonManager.install(
        addon,
        ApplicationState.addonDirectoryForVersion(this.gameVersion),
        (operation, percentage) => {
          if (
            operation !==
              this.addonStatus[addon.slipstreamId]?.progress?.operation ||
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

  @Action
  updateAll() {
    this.setUpdateAllInProgress(true);

    const promises = [];

    for (const installedAddon of Object.values(this.installedAddons)) {
      const latestVersion = this.latestAddons[installedAddon.slipstreamId];

      if (latestVersion && latestVersion.fileDate !== installedAddon.fileDate) {
        promises.push(this.install(latestVersion));
      }
    }

    Promise.allSettled(promises).then(() => this.setUpdateAllInProgress(false));
  }

  @Action
  async delete(addon: AddonDescription) {
    this.removeInstalledAddon(addon);
    this.setAddonStatus({ addon, status: makeAddonStatus("NotInstalled") });

    try {
      await addonManager.delete(
        addon,
        ApplicationState.addonDirectoryForVersion(this.gameVersion)
      );
    } catch (error) {
      // TODO: pop something up to warn that directories may not have been removed.
      console.warn(
        `Failed to remove directories for addon: ${addon.title} error: ${error}`
      );
    }
  }
}
