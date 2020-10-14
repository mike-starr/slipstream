<template>
  <v-container fluid>
    <v-expansion-panels v-model="expansionPanel">
      <v-expansion-panel
        v-for="searchResult in searchResults"
        :key="searchResult.slipstreamId"
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

            <v-col cols="4">{{ searchResult.title }} </v-col>
            <v-col cols="2">{{
              statusMap[searchResult.slipstreamId].progress
                ? statusMap[searchResult.slipstreamId].progress.operation +
                  " " +
                  statusMap[searchResult.slipstreamId].progress.percentage *
                    100 +
                  "%"
                : statusMap[searchResult.slipstreamId].state
            }}</v-col>
            <v-col cols="4"
              ><v-btn
                v-if="
                  statusMap[searchResult.slipstreamId].state === 'NotInstalled'
                "
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
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { AddonStateMap } from "@/store/index";
import AddonDescription from "@/addon/AddonDescription";

@Component
export default class AddonSearchResults extends Vue {
  expansionPanel: number | undefined = 0;

  @Prop({ type: String }) readonly gameVersion!: string;

  get searchResults() {
    return AddonStateMap.get(this.gameVersion)?.searchResults;
  }

  get statusMap() {
    return AddonStateMap.get(this.gameVersion)?.addonStatus;
  }

  @Watch("searchResults")
  onSearchResultsChanged() {
    this.expansionPanel = undefined;
  }

  installButtonClicked(searchResult: AddonDescription) {
    AddonStateMap.get(this.gameVersion)?.install(searchResult);
  }
}
</script>
