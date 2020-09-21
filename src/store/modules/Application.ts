import { VuexModule, Module, Mutation, Action } from "vuex-class-modules";
import addonManager from "@/addon/AddonManager";
import { remote } from "electron";

@Module
export default class Application extends VuexModule {
  readonly userDataDirectory = remote.app.getPath("userData");
  readonly tempDirectory = remote.app.getPath("temp");
  /*
  @Mutation
  setVersions(versions: string[]) {
    //this.versions = versions;
  }

  @Mutation
  selectVersion(version: string) {
    //  this.selectedVersion = version;
  }*/

  @Action
  async initialize() {
    try {
      await addonManager.initialize(this.userDataDirectory, this.tempDirectory);
    } catch (error) {
      console.log(`Initialization failed: ${error}`);
    }
  }
}
