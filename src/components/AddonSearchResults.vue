<template>
  <v-container fluid>
    <v-expansion-panels v-model="expansionPanel">
      <v-expansion-panel
        v-for="searchResult in searchResults"
        :key="searchResult.id"
      >
        <v-expansion-panel-header>
          <v-row align="center" justify="space-between" no-gutters>
            <v-col cols="2">
              <v-img
                :src="searchResult.thumbnailUrl"
                class="grey lighten-2"
                width="48"
                height="48"
                aspect-ratio="1"
              >
                <template v-slot:placeholder>
                  <v-row
                    class="fill-height ma-0"
                    align="center"
                    justify="center"
                  >
                    <v-progress-circular
                      indeterminate
                      color="primary"
                    ></v-progress-circular>
                  </v-row>
                </template>
              </v-img>
            </v-col>

            <v-col cols="6">{{ searchResult.title }} </v-col>
            <!--<v-col cols="8">
              <v-card color="background">
                <div class="d-flex flex-no-wrap justify-space-between">
                  <div>
                    <v-card-title
                      class="headline"
                      v-text="searchResult.title"
                    ></v-card-title>
                    <v-avatar class="ma-3" size="50" tile>
                      <v-img :src="searchResult.thumbnailUrl"></v-img>
                    </v-avatar>


                  </div>
                </div>
              </v-card>
            </v-col>-->
            <v-col cols="4"
              ><v-btn
                color="primary"
                @click.stop="installButtonClicked(searchResult)"
                >Install</v-btn
              ></v-col
            >
          </v-row>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          {{ searchResult.summary }}
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { AddonSearchState, InstalledAddonsState } from "@/store/index";
import AddonReference from "@/addon/AddonReference";

@Component
export default class AddonSearchResults extends Vue {
  expansionPanel: number | undefined = 0;

  get searchResults() {
    return AddonSearchState.searchResults;
  }

  @Watch("searchResults")
  onSearchResultsChanged() {
    this.expansionPanel = undefined;
  }

  installButtonClicked(searchResult: AddonReference) {
    InstalledAddonsState.install(searchResult);
  }
}
</script>
