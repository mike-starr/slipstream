<template>
  <v-app>
    <v-navigation-drawer app permanent color="#1D1D1D" width="100">
      <v-tabs
        v-model="tab"
        @change="onListChange"
        vertical
        color="white"
        icons-and-text
      >
        <v-tab v-for="(version, i) in versions" :key="i">
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
      <div style="height: 100%">
        <AddonView :gameVersion="selectedVersion" />
      </div>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";
import AddonView from "./components/AddonView.vue";
import AddonSearch from "./components/AddonSearch.vue";
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
    AddonSearch,
    Settings
  }
})
export default class App extends Vue {
  tab = null;

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
    this.tab = null;

    for (const addonState of GameVersionStateMap.values()) {
      addonState.refresh();
    }
  }

  friendlyNameForVersion(version: string) {
    return friendlyVersionNames[version]
      ? friendlyVersionNames[version]
      : version;
  }

  onListChange(value: number) {
    ApplicationState.selectVersion(this.versions[value]);
  }

  created() {
    ApplicationState.initialize();
  }
}
</script>
