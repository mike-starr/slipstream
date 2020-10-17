import { VuexModule, Module, Mutation, Action } from "vuex-class-modules";
import addonManager from "@/addon/AddonManager";
import { ipcRenderer } from "electron";

@Module
export default class Application extends VuexModule {
  userDataDirectory = "";
  tempDirectory = "";

  @Mutation
  setUserDataDirectory(path: string) {
    this.userDataDirectory = path;
  }

  @Mutation
  setTempDirectory(path: string) {
    this.tempDirectory = path;
  }

  @Action
  async initialize() {
    try {
      const directories = ipcRenderer.sendSync("get-application-directories");
      this.setUserDataDirectory(directories.dataDirectory);
      this.setTempDirectory(directories.tempDirectory);

      await addonManager.initialize(this.userDataDirectory, this.tempDirectory);
    } catch (error) {
      console.error(`Initialization failed: ${error}`);
    }
  }
}
