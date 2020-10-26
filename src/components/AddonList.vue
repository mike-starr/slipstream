<template>
  <v-container fluid>
    <v-expansion-panels v-model="expansionPanel">
      <v-expansion-panel
        class="secondary darken-1"
        v-for="addon in addons"
        :key="addon.slipstreamId"
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
                <v-img :src="addon.thumbnailUrl" class="transparent">
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
              {{ addon.title }}
            </v-col>
            <v-col cols="3"
              ><div class="text-center">
                <v-btn
                  v-if="
                    statusMap[addon.slipstreamId].state === 'Installed' &&
                      updateAvailable(addon.slipstreamId)
                  "
                  color="primary lighten-1"
                  fab
                  outlined
                  small
                  @click.stop="updateButtonClicked(addon)"
                >
                  <v-icon>mdi-sync</v-icon>
                </v-btn>
                <v-btn
                  v-if="statusMap[addon.slipstreamId].state === 'NotInstalled'"
                  color="primary lighten-1"
                  fab
                  outlined
                  small
                  @click.stop="installButtonClicked(addon)"
                  ><v-icon>mdi-download</v-icon></v-btn
                >
                <v-progress-circular
                  v-if="statusMap[addon.slipstreamId].state === 'Installing'"
                  color="primary lighten-1"
                  height="36"
                  :value="
                    statusMap[addon.slipstreamId].progress.percentage * 100
                  "
                >
                </v-progress-circular>
                <v-icon
                  v-if="
                    statusMap[addon.slipstreamId].state === 'Installed' &&
                      !updateAvailable(addon.slipstreamId)
                  "
                  color="green darken-1"
                  >mdi-check-bold</v-icon
                >
              </div>
            </v-col>
          </v-row>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          {{ addon.summary }}
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
export default class AddonList extends Vue {
  expansionPanel: number | undefined = 0;

  @Prop({ type: String }) readonly gameVersion!: string;
  @Prop({ type: Array }) readonly addons!: string;

  get latestAddons() {
    return Object.values(
      GameVersionStateMap.get(this.gameVersion)?.latestAddons || {}
    );
  }

  get statusMap() {
    return GameVersionStateMap.get(this.gameVersion)?.addonStatus;
  }

  updateAvailable(slipstreamId: string): boolean {
    const latestAddon = GameVersionStateMap.get(this.gameVersion)?.latestAddons[
      slipstreamId
    ];

    const installedAddon = GameVersionStateMap.get(this.gameVersion)
      ?.installedAddons[slipstreamId];

    return latestAddon && installedAddon
      ? latestAddon.fileDate !== installedAddon.fileDate
      : false;
  }

  @Watch("addons")
  onAddonsChanged() {
    this.expansionPanel = undefined;
  }

  updateButtonClicked(addon: AddonDescription) {
    GameVersionStateMap.get(this.gameVersion)?.update(addon);
  }

  installButtonClicked(searchResult: AddonDescription) {
    GameVersionStateMap.get(this.gameVersion)?.install(searchResult);
  }
}
</script>
