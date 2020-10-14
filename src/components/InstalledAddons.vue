<!-- <template>
  <v-container>
    <v-expansion-panels>
      <v-expansion-panel v-for="(item, i) in 50" :key="i">
        <v-expansion-panel-header>
          <v-row align="center" no-gutters>
            <v-col cols="7">Addon Title {{ i }}</v-col>

            <v-col cols="2">Source</v-col>

            <v-col cols="2"
              ><v-btn color="primary" @click.stop="">Update</v-btn></v-col
            >
            <v-spacer></v-spacer>
          </v-row>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template> -->

<template>
  <v-container fluid>
    <v-expansion-panels v-model="expansionPanel">
      <v-expansion-panel
        v-for="installedAddon in installedAddons"
        :key="installedAddon.slipstreamId"
      >
        <v-expansion-panel-header>
          <v-row align="center" justify="space-between" no-gutters>
            <v-col cols="2">
              <v-img
                :src="installedAddon.thumbnailUrl"
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

            <v-col cols="4">{{ installedAddon.title }} </v-col>
            <v-col cols="2">{{
              statusMap[installedAddon.slipstreamId].progress
                ? statusMap[installedAddon.slipstreamId].progress.operation +
                  " " +
                  statusMap[installedAddon.slipstreamId].progress.percentage *
                    100 +
                  "%"
                : statusMap[installedAddon.slipstreamId].state
            }}</v-col>
            <!-- figure out when to display update button -->
            <v-col cols="4"
              ><v-btn
                v-if="updateAvailable(installedAddon)"
                color="primary"
                @click.stop="updateButtonClicked(installedAddon)"
                >Update</v-btn
              ></v-col
            >
          </v-row>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          {{ installedAddon.summary }}
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
export default class InstalledAddons extends Vue {
  expansionPanel: number | undefined = 0;

  @Prop({ type: String }) readonly gameVersion!: string;

  get installedAddons() {
    return Object.values(
      AddonStateMap.get(this.gameVersion)?.installedAddons || {}
    );
  }

  get latestAddons() {
    return Object.values(
      AddonStateMap.get(this.gameVersion)?.latestAddons || {}
    );
  }

  get statusMap() {
    return AddonStateMap.get(this.gameVersion)?.addonStatus;
  }

  updateAvailable(addon: AddonDescription): boolean {
    const latestAddon = AddonStateMap.get(this.gameVersion)?.latestAddons[
      addon.slipstreamId
    ];

    return latestAddon ? latestAddon.fileDate !== addon.fileDate : false;
  }

  @Watch("installedAddons")
  onInstalledAddonsChanged() {
    this.expansionPanel = undefined;
  }

  updateButtonClicked(addon: AddonDescription) {
    AddonStateMap.get(this.gameVersion)?.update(addon);
  }

  created() {
    AddonStateMap.get(this.gameVersion)
      ?.initialize(this.gameVersion)
      .then(() => {
        AddonStateMap.get(this.gameVersion)?.checkForUpdates();
      });
  }
}
</script>
