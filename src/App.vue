<template>
  <v-app>
    <v-navigation-drawer app permanent width="100">
      <v-tabs
        v-model="tabs"
        vertical
        color="white"
        @change="onListChange"
        icons-and-text
      >
        <v-tab v-for="version in versions" :key="version">
          {{ friendlyNameForVersion(version) }}
          <v-icon>mdi-sword-cross</v-icon>
        </v-tab>
      </v-tabs>

      <v-divider />
      <Settings />

      <!-- <v-container>
        <v-row justify="center">
          <v-card width="120" rounded="xl" color="transparent">
            <v-row justify="center">
              <v-card width="64" rounded="circle" color="white" flat>
                <v-img contain :src="logo"></v-img></v-card
            ></v-row>

            <v-row justify="center"> Retail</v-row>
          </v-card>
        </v-row></v-container
      > -->
    </v-navigation-drawer>

    <v-main>
      <div
        style="height: 100%"
        v-for="version in versions"
        :key="version"
        v-show="version === selectedVersion"
      >
        <AddonView :gameVersion="version" />
      </div>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";
import InstalledAddons from "./components/InstalledAddons.vue";
import AddonView from "./components/AddonView.vue";
import AddonSearch from "./components/AddonSearch.vue";
import AddonSearchResults from "./components/AddonSearchResults.vue";
import Settings from "./components/Settings.vue";

import { GameVersionStateMap, ApplicationState } from "@/store/index";
import logo from "@/assets/logo.png";

const friendlyVersionNames: { [key: string]: string } = {
  _retail_: "Retail",
  _classic_: "Classic",
  _beta_: "Beta",
  _ptr_: "PTR"
};

@Component({
  components: {
    AddonView,
    InstalledAddons,
    AddonSearch,
    AddonSearchResults,
    Settings
  }
})
export default class App extends Vue {
  tabs = null;

  get versions() {
    return ApplicationState.gameDirectories.versions;
  }

  get selectedVersion() {
    return ApplicationState.selectedVersion;
  }

  // get real icons for game versions
  get logo() {
    return logo;
  }
  @Watch("versions")
  versionsChanged() {
    for (const addonState of GameVersionStateMap.values()) {
      addonState.refresh();
    }
  }

  friendlyNameForVersion(version: string) {
    return friendlyVersionNames[version]
      ? friendlyVersionNames[version]
      : version;
  }

  isSelectedVersion(version: string) {
    console.log(`test ${version} current ${this.selectedVersion}`);
    return version === this.selectedVersion;
  }

  onListChange(value: number) {
    ApplicationState.selectVersion(this.versions[value]);
  }

  created() {
    this.$vuetify.theme.dark = true;
    ApplicationState.initialize();
  }
}
</script>
