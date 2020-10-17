<template>
  <v-app>
    <v-navigation-drawer app color="background" permanent width="200">
      <v-list nav rounded>
        <v-subheader>VERSIONS</v-subheader>
        <v-list-item-group mandatory @change="onListChange">
          <v-list-item
            v-for="(version, i) in versions"
            :key="i"
            :value="version"
          >
            <!-- <v-list-item-avatar>
              <v-img :src="item.avatar"></v-img>
            </v-list-item-avatar> -->
            <v-list-item-content>
              <v-list-item-title v-html="version"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
      <v-divider />
      <Settings />
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

import { AddonStateMap, GameState, ApplicationState } from "@/store/index";

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
    return GameState.gameDirectories.versions;
  }

  get selectedVersion() {
    return GameState.selectedVersion;
  }

  @Watch("versions")
  versionsChanged() {
    for (const addonState of AddonStateMap.values()) {
      addonState.refresh();
    }
  }

  isSelectedVersion(version: string) {
    return version === this.selectedVersion;
  }

  onListChange(value: string) {
    GameState.selectVersion(value);
  }

  created() {
    ApplicationState.initialize().then(() => {
      GameState.updateInstallationRoot("/Users/mstarr/Documents/wow_root"); // get path from app config
    });
  }
}
</script>
