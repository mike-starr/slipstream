import { VuexModule, Module, Action, Mutation } from "vuex-class-modules";
import addonManager from "@/addon/AddonManager";
import AddonReference from "@/addon/AddonReference";
import { GameState } from "@/store/index";
import { makeAddonStatus, default as AddonStatus } from "@/addon/AddonStatus";

interface InstalledAddonMap {
  [key: string]: AddonReference[];
}

@Module
export default class Addon extends VuexModule {
  // needs to be iniitalized from file on load
  // and updated when an install finishes
  installedAddons: InstalledAddonMap = {};

  // search results needs to be a map by install directory.
  searchResults: AddonReference[] = [];

  @Mutation
  setSearchResults(searchResults: AddonReference[]) {
    this.searchResults = searchResults;
  }

  @Mutation
  updateAddonStatus(params: { addon: AddonReference; status: AddonStatus }) {
    params.addon.status = params.status;
  }

  @Action
  async search(searchTerm: string) {
    const results = await addonManager.search(
      searchTerm,
      GameState.selectedVersionFlavor
    );

    // make sure when we set the results for a particular version that
    // it's the one we initiated the search with - this function might want to take
    // a version parameter or save it off before running the search.
    this.setSearchResults(results);
  }

  @Action
  async install(addon: AddonReference) {
    try {
      this.updateAddonStatus({
        addon,
        status: makeAddonStatus("Installing", 0, "Initializing")
      });
      await addonManager.install(
        addon,
        GameState.selectedVersionRoot,
        (operation, percentage) => {
          this.updateAddonStatus({
            addon,
            status: makeAddonStatus("Installing", percentage, operation)
          });
        }
      );
      this.updateAddonStatus({ addon, status: makeAddonStatus("Installed") });
    } catch (error) {
      this.updateAddonStatus({
        addon,
        status: makeAddonStatus("Error")
      });
      console.log(error);
    }
  }
}
