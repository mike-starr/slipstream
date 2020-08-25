import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators";
import CurseRepository from "@/repositories/CurseRepository";
import rootStore from "@/store/index";

@Module({
  name: "CurseAddons",
  namespaced: true
})
export default class CurseAddons extends VuexModule {

  private curseRepository = new CurseRepository();



    @Action
    async initialize() {
      this.curseRepository.initializeDatabase(rootStore.state.appDataDirectory);
    }
}
