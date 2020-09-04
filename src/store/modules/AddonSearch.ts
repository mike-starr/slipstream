import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators";
import curseRepository from "@/repositories/CurseRepository";



@Module({
  name: "AddonSearch",
  namespaced: true
})
export default class AddonSearch extends VuexModule {
  searchResults: string[] = [];

  @Mutation
  setSearchResults(searchResults: string[]) {
    this.searchResults = searchResults;
  }


  @Action
  search(searchTerm: string) {
    curseRepository.searchAddons(searchTerm).then((addons) => {
      console.log("results from " + searchTerm + " results: " + addons);
    });
    console.log("done: " + searchTerm);
  }
}
