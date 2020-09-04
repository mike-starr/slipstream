<template>
  <v-app>
    <v-navigation-drawer app color="background" permanent width="260">
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
    </v-navigation-drawer>

    <v-main>
      <v-sheet height="100%" class="d-flex flex-column">
        <v-sheet>
          <v-tabs v-model="tabs">
            <v-tab>Installed Addons</v-tab>
            <v-tab>Search</v-tab>
          </v-tabs>
          <AddonSearch v-if="tabs === 1"></AddonSearch>
          <v-divider></v-divider>
        </v-sheet>

        <v-sheet style="flex: 1 0 0; overflow-y:auto">
          <v-tabs-items v-model="tabs">
            <v-tab-item reverse-transition="false" transition="false">
              <InstalledAddons />
            </v-tab-item>
            <v-tab-item reverse-transition="false" transition="false"
              ><AddonSearchResults />
            </v-tab-item>
          </v-tabs-items>
        </v-sheet>
      </v-sheet>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import InstalledAddons from "./components/InstalledAddons.vue";
import AddonSearch from "./components/AddonSearch.vue";
import AddonSearchResults from "./components/AddonSearchResults.vue";
import AvatarImage from "./assets/logo.png";
import { GameConfigurationState } from "@/store/index";

@Component({
  components: { InstalledAddons, AddonSearch, AddonSearchResults }
})
export default class App extends Vue {
  tabs = null;

  get versions() {
    return GameConfigurationState.versions;
  }

  onListChange(value: string) {
    console.log("changed " + value);
    GameConfigurationState.selectVersion(value);
  }

  created() {
    GameConfigurationState.updateVersions();
  }
}
</script>
