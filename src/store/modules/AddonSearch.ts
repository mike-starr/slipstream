import { VuexModule, Module, Mutation, Action } from "vuex-class-modules";
//import {AddonSearchResult, default as curseRepository} from "@/repositories/CurseRepository";

import addonManager from "@/addon/AddonManager";
import AddonSearchResult from "@/addon/AddonSearchResult";

@Module
export default class AddonSearch extends VuexModule {
  searchResults: AddonSearchResult[] = [];

  @Mutation
  setSearchResults(searchResults: AddonSearchResult[]) {
    this.searchResults = searchResults;
  }

  @Action
  async search(searchTerm: string) {
    const results = await addonManager.search(searchTerm, "retail");
    this.setSearchResults(results);
  }
}
