<template>
  <v-app>
    <!-- <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
          transition="scale-transition"
          width="40"
        />

        <v-img
          alt="Vuetify Name"
          class="shrink mt-1 hidden-sm-and-down"
          contain
          min-width="100"
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-name-dark.png"
          width="100"
        />
      </div>

      <v-spacer></v-spacer>

      <v-btn
        href="https://github.com/vuetifyjs/vuetify/releases/latest"
        target="_blank"
        text
      >
        <span class="mr-2">Latest Release</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>-->

    <v-navigation-drawer app color="background" permanent width="260">
      <v-list nav rounded>
        <v-subheader>VERSIONS</v-subheader>
        <v-list-item-group mandatory @change="onListChange">
          <v-list-item
            v-for="(version, i) in versions"
            :key="i"
            :value="version"
          >
            <!-- <v-list-item-avatar>
              <v-img :src="item.avatar"></v-img>
            </v-list-item-avatar> -->
            <v-list-item-content>
              <v-list-item-title v-html="version"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <InstalledAddons />
    </v-main>
  </v-app>
</template>

<script lang="ts">
//import Vue from "vue";
import { Component, Vue } from "vue-property-decorator";
import InstalledAddons from "./components/InstalledAddons.vue";
import AvatarImage from "./assets/logo.png";
import { GameConfigurationState } from "@/store/index";

@Component({
  components: { InstalledAddons }
})
export default class App extends Vue {
  private something = true;

  get versions() {
    return GameConfigurationState.versions;
  }

  onListChange(value: string) {
    console.log("changed " + value);
    GameConfigurationState.selectVersion(value);
  }

  created() {
    GameConfigurationState.updateVersions();
  }
}

/*Vue.extend({
  name: "App",

  components: {
    InstalledAddons
  },
  computed: {
    versions: function() {
      return this.$store.state.versions;
    }
  },
  methods: {
    onListChange: function(value: string) {
      console.log("changed " + value);
      this.$store.commit("selectVersion", value);
    }
  },
  created: function() {
    this.$store.dispatch("updateVersions");
  }
});*/
</script>
