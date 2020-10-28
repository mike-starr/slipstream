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
                class="mr-4"
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
              <span class="font-weight-medium">{{ addon.title }}</span>
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
          <v-container fluid>
            <v-row justify="start">
              <v-col cols="6">
                <v-card
                  color="secondary darken-1"
                  flat
                  height="100%"
                  class="d-flex flex-column text-body-2"
                >
                  <div class="ma-4">{{ addon.summary }}</div>
                  <v-spacer></v-spacer>
                  <v-card-actions>
                    <v-btn fab outlined small color="primary lighten-1">
                      <v-icon>mdi-open-in-new</v-icon>
                    </v-btn>
                    <v-btn
                      v-if="
                        statusMap[addon.slipstreamId].state !== 'NotInstalled'
                      "
                      class="ml-3"
                      :disabled="
                        !(statusMap[addon.slipstreamId].state === 'Installed')
                      "
                      fab
                      outlined
                      small
                      color="error"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
              <v-spacer></v-spacer>
              <v-col cols="5">
                <v-list>
                  <v-list-item dense two-line>
                    <v-list-item-content>
                      <v-list-item-title class="font-weight-bold"
                        >Author</v-list-item-title
                      >
                      <v-list-item-subtitle>someone</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item dense two-line>
                    <v-list-item-content>
                      <v-list-item-title>Installed Version</v-list-item-title>
                      <v-list-item-subtitle
                        >DetailsClassic.1.13.5.214.142.zip</v-list-item-subtitle
                      >
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item dense two-line>
                    <v-list-item-content>
                      <v-list-item-title>Latest Version</v-list-item-title>
                      <v-list-item-subtitle
                        >DetailsClassic.1.14.5.214.900.zip</v-list-item-subtitle
                      >
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item dense two-line>
                    <v-list-item-content>
                      <v-list-item-title>Game Version</v-list-item-title>
                      <v-list-item-subtitle>9.0.1</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </v-container>
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

  @Watch("gameVersion")
  onGameVersionChanged() {
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
