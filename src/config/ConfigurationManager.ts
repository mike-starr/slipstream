import fs from "fs";
import path from "path";

interface Configuration {
  version: string;
  rootGameDirectory: string;
}

const configurationVersion = "1.0";
const configurationFilename = "config.json";

class ConfigurationManager {
  private configurationDirectory = "";
  private configuration: Configuration = {
    version: configurationVersion,
    rootGameDirectory: ""
  };

  get rootGameDirectory() {
    return this.configuration.rootGameDirectory;
  }

  set rootGameDirectory(value: string) {
    if (value === this.configuration.rootGameDirectory) {
      return;
    }

    this.configuration.rootGameDirectory = value;
    this.writeConfiguration();
  }

  async initialize(configurationDirectory: string) {
    this.configurationDirectory = configurationDirectory;

    const configurationFile = path.join(
      this.configurationDirectory,
      configurationFilename
    );

    try {
      const fileBuffer = await fs.promises.readFile(configurationFile);

      // TODO: validate this, check version.
      this.configuration = JSON.parse(fileBuffer.toString());
    } catch (error) {
      console.log(
        `Configuration file does not exist or is inaccessible. Starting from an empty configuration. ${error}`
      );
      return;
    }
  }

  async writeConfiguration() {
    await fs.promises.writeFile(
      path.join(this.configurationDirectory, configurationFilename),
      JSON.stringify(this.configuration)
    );
  }
}

export default new ConfigurationManager();
