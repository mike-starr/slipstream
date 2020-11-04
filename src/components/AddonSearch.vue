<template>
  <v-container fluid>
    <v-row align="center" justify="start">
      <v-col cols="8">
        <v-text-field
          v-model="searchTerm"
          height="36px"
          class="ml-2"
          label="Search"
          :loading="searchInProgress"
          dense
        ></v-text-field>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { GameVersionStateMap } from "@/store/index";
import Debounce from "@/util/Debounce";

@Component
export default class AddonSearch extends Vue {
  searchTerm = "";

  @Prop({ type: String }) readonly gameVersion!: string;

  get searchInProgress() {
    return GameVersionStateMap[this.gameVersion]?.searchInProgress;
  }

  @Watch("gameVersion")
  gameVersionChanged() {
    this.searchTerm = "";
  }

  @Debounce(500)
  @Watch("searchTerm")
  searchTermChanged() {
    if (this.searchTerm.length > 1) {
      GameVersionStateMap[this.gameVersion]?.search(this.searchTerm);
    }
  }
}
</script>
