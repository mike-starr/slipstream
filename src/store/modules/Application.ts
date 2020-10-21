import { ipcRenderer } from "electron";
import { VuexModule, Module, Mutation, Action } from "vuex-class-modules";
import { updateAddonStates } from "@/store/index";
import addonManager from "@/addon/AddonManager";
import configurationManager from "@/config/ConfigurationManager";
import fs from "fs";
import path from "path";

type GameDirectories = {
  rootDirectory: string;
  versions: string[];
};

async function verifyGameVersionDirectory(directory: string) {
  try {
    await fs.promises.access(
      path.join(directory, "Interface", "Addons"),
      fs.constants.W_OK | fs.constants.R_OK
    );

    return true;
  } catch (error) {
    return false;
  }
}

const versionOrder: { [key: string]: number } = {
  _retail_: 0,
  _classic_: 1,
  _beta_: 2,
  _ptr_: 3
};

@Module
export default class Application extends VuexModule {
  userDataDirectory = "";
  tempDirectory = "";
  gameDirectories: GameDirectories = {
    rootDirectory: "",
    versions: []
  };
  selectedVersion = "";

  addonDirectoryForVersion(version: string) {
    return path.join(
      this.gameDirectories.rootDirectory,
      version,
      "Interface",
      "Addons"
    );
  }

  @Mutation
  setGameDirectories(directories: GameDirectories) {
    this.gameDirectories = directories;
  }

  @Mutation
  selectVersion(version: string) {
    this.selectedVersion = version;
  }

  @Action
  async updateRootGameDirectory(directory: string) {
    if (this.gameDirectories.rootDirectory === directory) {
      return;
    }

    let allSubDirectories: fs.Dirent[] = [];

    try {
      allSubDirectories = await fs.promises.readdir(directory, {
        withFileTypes: true
      });
    } catch (error) {
      console.warn(`Unable to read supplied root directory: ${directory}`);
    }

    const gameVersions = allSubDirectories
      .filter(
        (entry) =>
          entry.isDirectory &&
          entry.name.startsWith("_") &&
          entry.name.endsWith("_")
      )
      .map((entry) => entry.name);

    const verifiedGameVersions = [];

    for (const gameVersion of gameVersions) {
      if (await verifyGameVersionDirectory(path.join(directory, gameVersion))) {
        verifiedGameVersions.push(gameVersion);
      }
    }

    verifiedGameVersions.sort((a, b) => {
      if (versionOrder[b] === undefined) {
        return -1;
      } else if (versionOrder[a] === undefined) {
        return 1;
      } else {
        return versionOrder[a] - versionOrder[b];
      }
    });

    updateAddonStates(verifiedGameVersions);

    this.setGameDirectories({
      rootDirectory: directory,
      versions: verifiedGameVersions
    });

    configurationManager.rootGameDirectory = directory;
  }

  @Mutation
  setUserDataDirectory(directory: string) {
    this.userDataDirectory = directory;
  }

  @Mutation
  setTempDirectory(directory: string) {
    this.tempDirectory = directory;
  }

  @Action
  async initialize() {
    try {
      const directories = ipcRenderer.sendSync("get-application-directories");
      this.setUserDataDirectory(directories.dataDirectory);
      this.setTempDirectory(directories.tempDirectory);

      await addonManager.initialize(this.tempDirectory);
      await configurationManager.initialize(this.userDataDirectory);
      await this.updateRootGameDirectory(
        configurationManager.rootGameDirectory
      );
    } catch (error) {
      console.error(`Initialization failed: ${error}`);
    }
  }
}
