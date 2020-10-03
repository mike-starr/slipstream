<template>
  <v-sheet height="100%" class="d-flex flex-column">
    <v-sheet>
      <v-tabs v-model="tabs">
        <v-tab>Installed Addons</v-tab>
        <v-tab>Search</v-tab>
      </v-tabs>
      <AddonSearch :gameVersion="gameVersion" v-show="tabs === 1"></AddonSearch>
      <v-divider></v-divider>
    </v-sheet>

    <v-sheet style="flex: 1 0 0; overflow-y:auto">
      <v-tabs-items v-model="tabs">
        <v-tab-item reverse-transition="false" transition="false">
          <InstalledAddons :gameVersion="gameVersion" />
        </v-tab-item>
        <v-tab-item reverse-transition="false" transition="false"
          ><AddonSearchResults :gameVersion="gameVersion" />
        </v-tab-item>
      </v-tabs-items>
    </v-sheet>
  </v-sheet>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import InstalledAddons from "./InstalledAddons.vue";
import AddonSearch from "./AddonSearch.vue";
import AddonSearchResults from "./AddonSearchResults.vue";

@Component({
  components: { InstalledAddons, AddonSearch, AddonSearchResults }
})
export default class App extends Vue {
  tabs = null;

  @Prop({ type: String }) readonly gameVersion!: string;
}
</script>
