<template>
  <v-sheet height="100%" class="d-flex flex-column">
    <v-sheet>
      <v-tabs v-model="tabs" color="primary">
        <v-tab
          ><v-icon left>mdi-format-list-bulleted</v-icon>Installed Addons</v-tab
        >
        <v-tab><v-icon left>mdi-magnify</v-icon>Search</v-tab>
      </v-tabs>
      <AddonSearch :gameVersion="gameVersion" v-show="tabs === 1"></AddonSearch>
      <v-divider></v-divider>
    </v-sheet>

    <v-sheet style="flex: 1 0 0; overflow-y:auto">
      <v-tabs-items v-model="tabs">
        <v-tab-item reverse-transition="false" transition="false">
          <AddonList :gameVersion="gameVersion" :addons="installedAddons" />
        </v-tab-item>
        <v-tab-item reverse-transition="false" transition="false">
          <AddonList :gameVersion="gameVersion" :addons="searchResults" />
        </v-tab-item>
      </v-tabs-items>
    </v-sheet>
  </v-sheet>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import AddonList from "./AddonList.vue";
import AddonSearch from "./AddonSearch.vue";
import { GameVersionStateMap } from "@/store/index";

@Component({
  components: { AddonList, AddonSearch }
})
export default class App extends Vue {
  tabs = null;

  @Prop({ type: String }) readonly gameVersion!: string;

  get installedAddons() {
    return Object.values(
      GameVersionStateMap.get(this.gameVersion)?.installedAddons || {}
    );
  }

  get searchResults() {
    return GameVersionStateMap.get(this.gameVersion)?.searchResults;
  }
}
</script>
