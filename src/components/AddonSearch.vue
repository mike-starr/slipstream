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
import { AddonSearchState } from "@/store/index";
import Debounce from "@/util/Debounce";

@Component
export default class AddonSearch extends Vue {
  searchTerm = "";

  @Debounce(500)
  @Watch("searchTerm")
  searchTermChanged() {
    if (this.searchTerm.length > 1) {
      AddonSearchState.search(this.searchTerm);
    }
  }
}
</script>
