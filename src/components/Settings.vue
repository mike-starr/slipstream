<template>
  <v-container>
    <v-row align="center">
      <v-col rows="12" justify="center">
        <v-dialog
          v-model="dialog"
          fullscreen
          hide-overlay
          transition="fade-transition"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn color="primary" v-bind="attrs" v-on="on">
              Settings
            </v-btn>
          </template>
          <v-card>
            <v-toolbar color="background">
              <v-toolbar-title>Settings</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-toolbar-items>
                <v-btn icon @click="dialog = false">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </v-toolbar-items>
            </v-toolbar>
            <v-list subheader>
              <!--<v-subheader>User Controls</v-subheader>-->
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>World of Warcraft Path</v-list-item-title>
                  <v-btn @click="browseButtonClicked()">Browse</v-btn>
                  <input
                    v-show="false"
                    ref="wowDirectoryInput"
                    type="file"
                    webkitdirectory
                  />
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <v-divider></v-divider>
            <!--<v-list three-line subheader>
              <v-subheader>General</v-subheader>
              <v-list-item>
                <v-list-item-action>
                  <v-checkbox v-model="notifications"></v-checkbox>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>Notifications</v-list-item-title>
                  <v-list-item-subtitle
                    >Notify me about updates to apps or games that I
                    downloaded</v-list-item-subtitle
                  >
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-action>
                  <v-checkbox v-model="sound"></v-checkbox>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>Sound</v-list-item-title>
                  <v-list-item-subtitle
                    >Auto-update apps at any time. Data charges may
                    apply</v-list-item-subtitle
                  >
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-action>
                  <v-checkbox v-model="widgets"></v-checkbox>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>Auto-add widgets</v-list-item-title>
                  <v-list-item-subtitle
                    >Automatically add home screen widgets</v-list-item-subtitle
                  >
                </v-list-item-content>
              </v-list-item>
            </v-list> -->
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { ipcRenderer } from "electron";
import { ApplicationState } from "@/store/index";

const directorySelectReplyChannel = "wow-root-directory";

@Component
export default class AddonSearch extends Vue {
  dialog = false;

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
  }
}
</script>
