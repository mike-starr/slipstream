import { VuexModule, Module, Action, Mutation } from "vuex-class-modules";
import addonManager from "@/addon/AddonManager";
import { makeAddonStatus, default as AddonStatus } from "@/addon/AddonStatus";
import { GameState } from "@/store/index";
import AddonReference from "@/addon/AddonReference";
import AddonDescription from "@/addon/AddonDescription";

function referenceEqualForStatus(
  first: AddonReference,
  second: AddonReference
) {
  return (
    first.description.id === second.description.id &&
    first.description.repository === second.description.repository
  );
}

@Module
export default class Addon extends VuexModule {
  installedAddons: AddonReference[] = [];
  searchResults: AddonReference[] = [];
  gameVersion = "";

  @Mutation
  setVersion(version: string) {
    this.gameVersion = version;
  }

  @Mutation
  setSearchResults(searchResults: AddonReference[]) {
    this.searchResults = searchResults;
  }

  @Mutation
  addInstalledAddon(addon: AddonReference) {
    this.installedAddons.push(addon);
  }

  @Mutation
  setInstalledAddons(addons: AddonReference[]) {
    this.installedAddons = addons;
  }

  // this is really slow for high frequency download progress updates.
  // we lose status updates when the search result is cleared.
  @Mutation
  updateAddonStatus(params: { addon: AddonReference; status: AddonStatus }) {
    this.searchResults
      .filter((result) => referenceEqualForStatus(result, params.addon))
      .forEach((result) => {
        result.status = params.status;
      });

    // go through installed addons and update their status too.
  }

  @Mutation
  updateAddonUpdateAvailability(params: {
    addon: AddonReference;
    latestVersion: AddonDescription;
  }) {
    params.addon.latestVersion = params.latestVersion;
    params.addon.status.state = "OutOfDate";
  }

  @Action
  async initialize(version: string) {
    const installedAddons = await addonManager.findInstalledAddons(
      GameState.addonDirectoryForVersion(version)
    );
    this.setInstalledAddons(
      installedAddons.map((description) => {
        return {
          description,
          status: makeAddonStatus("UpToDate")
        };
      })
    );
  }

  @Action
  async checkForUpdates() {
    for (const addon of this.installedAddons.map((a) => a.description)) {
      console.log(`addon: ${JSON.stringify(addon)}`);
    }

    const latestAddons = await addonManager.latestVersionForAddons(
      this.installedAddons.map((addon) => addon.description)
    );

    for (const installedAddon of this.installedAddons) {
      const latestAddon = latestAddons.find(
        (addon) =>
          addon.id === installedAddon.description.id &&
          addon.repository === installedAddon.description.repository
      );

      if (
        latestAddon &&
        latestAddon.fileDate !== installedAddon.description.fileDate
      ) {
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

    this.setSearchResults(
      searchResults.map((description) => {
        const reference = {
          description,
          status: makeAddonStatus("NotInstalled")
        };
        const status = this.installedAddons.find((installedAddon) =>
          referenceEqualForStatus(installedAddon, reference)
        )?.status;

        if (status) {
          reference.status = status;
        }

        return reference;
      })
    );
  }

  @Action
  async install(addon: AddonReference) {
    try {
      this.updateAddonStatus({
        addon,
        status: makeAddonStatus("Installing", 0, "Initializing")
      });

      await addonManager.install(
        addon.description,
        GameState.addonDirectoryForVersion(this.gameVersion),
        (operation, percentage) => {
          this.updateAddonStatus({
            addon,
            status: makeAddonStatus("Installing", percentage, operation)
          });
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
