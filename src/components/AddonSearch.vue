<template>
  <v-container>
    <v-row align="center">
      <v-col cols="8">
        <v-text-field
          v-model="searchTerm"
          height="36px"
          class="mx-4"
          label="Search"
          dense
        ></v-text-field>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { AddonState, GameState } from "@/store/index";
import Debounce from "@/util/Debounce";

@Component
export default class AddonSearch extends Vue {
  searchTerm = "";

  get gameFlavor() {
    return GameState.selectedVersionFlavor;
  }

  @Watch("gameFlavor")
  gameFlavorChanged() {
    AddonState.setSearchResults([]);
    this.searchTerm = "";
  }

  @Debounce(500)
  @Watch("searchTerm")
  searchTermChanged() {
    if (this.searchTerm.length > 1) {
      AddonState.search(this.searchTerm);
    } else {
      AddonState.setSearchResults([]);
    }
  }
}
</script>
