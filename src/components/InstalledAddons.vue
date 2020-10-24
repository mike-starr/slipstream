<template>
  <v-container fluid>
    <v-expansion-panels v-model="expansionPanel">
      <v-expansion-panel
        class="secondary darken-1"
        v-for="installedAddon in installedAddons"
        :key="installedAddon.slipstreamId"
      >
        <v-expansion-panel-header>
          <v-row align="center" justify="start" no-gutters>
            <v-col cols="9">
              <v-avatar
                style="border: 1px solid white;"
                class="mr-2"
                width="48"
                height="48"
                left
                rounded="circle"
              >
                <v-img :src="installedAddon.thumbnailUrl" class="transparent">
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
              </v-avatar>
              {{ installedAddon.title }}
            </v-col>
            <!--<v-col cols="2">{{
              statusMap[installedAddon.slipstreamId].progress
                ? statusMap[installedAddon.slipstreamId].progress.operation +
                  " " +
                  statusMap[installedAddon.slipstreamId].progress.percentage *
                    100 +
                  "%"
                : statusMap[installedAddon.slipstreamId].state
            }}</v-col> -->
            <!-- figure out when to display update button -->
            <v-col cols="3"
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
import { GameVersionStateMap } from "@/store/index";
import AddonDescription from "@/addon/AddonDescription";

@Component
export default class InstalledAddons extends Vue {
  expansionPanel: number | undefined = 0;

  @Prop({ type: String }) readonly gameVersion!: string;

  get installedAddons() {
    return Object.values(
      GameVersionStateMap.get(this.gameVersion)?.installedAddons || {}
    );
  }

  get latestAddons() {
    return Object.values(
      GameVersionStateMap.get(this.gameVersion)?.latestAddons || {}
    );
  }

  get statusMap() {
    return GameVersionStateMap.get(this.gameVersion)?.addonStatus;
  }

  updateAvailable(addon: AddonDescription): boolean {
    const latestAddon = GameVersionStateMap.get(this.gameVersion)?.latestAddons[
      addon.slipstreamId
    ];

    return latestAddon ? latestAddon.fileDate !== addon.fileDate : false;
  }

  @Watch("installedAddons")
  onInstalledAddonsChanged() {
    this.expansionPanel = undefined;
  }

  updateButtonClicked(addon: AddonDescription) {
    GameVersionStateMap.get(this.gameVersion)?.update(addon);
  }

  created() {
    //AddonStateMap.get(this.gameVersion)?.refresh();
  }
}
</script>
