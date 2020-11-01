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

      <v-divider class="mb-3" />

      <v-container fluid>
        <v-row no-gutters align="start" justify="center">
          <v-col>
            <div class="text-center">
              <v-btn
                color="primary"
                fab
                outlined
                :disabled="updateCheckInProgress()"
                @click.stop="checkForUpdatesButtonClicked()"
              >
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>
      <v-container fluid>
        <v-row no-gutters align="start" justify="center">
          <v-col>
            <div class="text-center">
              <v-badge
                bordered
                overlap
                left
                :offset-x="16"
                :offset-y="16"
                :content="outOfDateAddonCount()"
                :value="outOfDateAddonCount() > 0"
                color="error"
                ><v-btn
                  color="primary"
                  fab
                  outlined
                  :disabled="
                    updateAllInProgress() || outOfDateAddonCount() === 0
                  "
                  @click.stop="updateAllButtonClicked()"
                >
                  <v-icon>mdi-download-multiple</v-icon>
                </v-btn>
              </v-badge>
            </div>
          </v-col>
        </v-row>
      </v-container>
      <Settings />
    </v-navigation-drawer>

    <v-main>
      <div style="height: 100%">
        <AddonView :gameVersion="selectedVersion" />
      </div>
    </v-main>
  </v-app>
</template>

<style scoped>
.v-badge {
  font-weight: 900;
}
</style>

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";
import AddonView from "./components/AddonView.vue";
import AddonSearch from "./components/AddonSearch.vue";
import Settings from "./components/Settings.vue";

import { GameVersionStateMap, ApplicationState } from "@/store/index";

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

  outOfDateAddonCount() {
    let count = 0;

    for (const addonState of GameVersionStateMap.values()) {
      count += addonState.outOfDateAddonCount;
    }

    return count;
  }

  updateCheckInProgress() {
    for (const addonState of GameVersionStateMap.values()) {
      if (addonState.updateCheckInProgress) {
        return true;
      }
    }

    return false;
  }

  updateAllInProgress() {
    for (const addonState of GameVersionStateMap.values()) {
      if (addonState.updateAllInProgress) {
        return true;
      }
    }

    return false;
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

  checkForUpdatesButtonClicked() {
    for (const addonState of GameVersionStateMap.values()) {
      addonState.checkForUpdates();
    }
  }

  updateAllButtonClicked() {
    for (const addonState of GameVersionStateMap.values()) {
      addonState.updateAll();
    }
  }

  created() {
    ApplicationState.initialize();
  }
}
</script>
