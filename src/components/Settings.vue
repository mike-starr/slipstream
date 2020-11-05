<template>
  <v-dialog
    v-model="dialog"
    fullscreen
    hide-overlay
    transition="fade-transition"
  >
    <template v-slot:activator="{ on: menu, attrs }">
      <v-container fluid>
        <v-row no-gutters align="start" justify="center">
          <v-col>
            <div class="text-center">
              <v-tooltip right transition="fade-transition">
                <template v-slot:activator="{ on: tooltip }">
                  <v-btn
                    color="primary"
                    fab
                    outlined
                    v-bind="attrs"
                    v-on="{ ...tooltip, ...menu }"
                  >
                    <v-icon>mdi-cog</v-icon>
                  </v-btn>
                </template>
                <span>Settings</span>
              </v-tooltip>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </template>
    <v-card>
      <v-toolbar color="secondary darken-1">
        <v-toolbar-title>Settings</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn icon @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-container fluid>
        <v-row no-gutters justify="start">
          <v-col cols="11"
            ><div class="text-subtitle-1 ml-1">
              World of Warcraft Directory
            </div></v-col
          >
        </v-row>
        <v-row no-gutters justify="start">
          <v-col cols="11">
            <v-text-field
              readonly
              solo
              background-color="secondary darken-1"
              label="World of Warcraft Directory"
              type="text"
              color="white"
              :value="rootDirectory()"
            >
              <template v-slot:append>
                <v-icon color="primary" @click="browseButtonClicked()"
                  >mdi-folder-edit</v-icon
                >
              </template>
            </v-text-field>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { ipcRenderer } from "electron";
import { ApplicationState } from "@/store/index";

const directorySelectReplyChannel = "wow-root-directory";

@Component
export default class AddonSearch extends Vue {
  dialog = false;

  rootDirectory() {
    return ApplicationState.gameDirectories.rootDirectory;
  }

  browseButtonClicked() {
    ipcRenderer.send(
      "open-directory-select-dialog",
      directorySelectReplyChannel
    );
  }

  created() {
    ipcRenderer.on(directorySelectReplyChannel, (event, directoryName) => {
      ApplicationState.updateRootGameDirectory(directoryName);
    });

    this.$root.$on("open-settings-dialog", () => {
      this.dialog = true;
    });
  }
}
</script>
