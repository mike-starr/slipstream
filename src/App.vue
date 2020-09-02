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
          <v-container>
            <v-row align="center">
              <v-col cols="8">
                <v-text-field
                  height="36px"
                  class="mx-4"
                  label="Search"
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="4">Filters</v-col>
            </v-row>
          </v-container>
          <v-divider></v-divider>
        </v-sheet>

        <v-sheet style="flex: 1 0 0; overflow-y:auto">
          <v-tabs-items v-model="tabs">
            <v-tab-item reverse-transition="false" transition="false">
              <InstalledAddons />
            </v-tab-item>
            <v-tab-item reverse-transition="false" transition="false"
              ><AddonSearch />
            </v-tab-item>
          </v-tabs-items>
        </v-sheet>
      </v-sheet>
    </v-main>
  </v-app>
</template>

<script lang="ts">
//import Vue from "vue";
import { Component, Vue } from "vue-property-decorator";
import InstalledAddons from "./components/InstalledAddons.vue";
import AddonSearch from "./components/AddonSearch.vue";
import AvatarImage from "./assets/logo.png";
import { GameConfigurationState } from "@/store/index";

@Component({
  components: { InstalledAddons, AddonSearch }
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
