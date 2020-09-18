import { VuexModule, Module, Mutation, Action } from "vuex-class-modules";

import addonManager from "@/addon/AddonManager";
import AddonReference from "@/addon/AddonReference";

@Module
export default class AddonSearch extends VuexModule {
  searchResults: AddonReference[] = [];

  @Mutation
  setSearchResults(searchResults: AddonReference[]) {
    this.searchResults = searchResults;
  }

  // needs to be a watch on installed addons or something
  // so we can update installation state of stuff in the search results

  @Action
  async search(searchTerm: string) {
    const results = await addonManager.search(searchTerm, "retail");
    this.setSearchResults(results);
  }
}
