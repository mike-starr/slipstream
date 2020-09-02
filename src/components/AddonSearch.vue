<template>
  <v-container>
    <v-expansion-panels>
      <v-expansion-panel v-for="(item, i) in 50" :key="i">
        <v-expansion-panel-header>
          <v-row align="center" no-gutters>
            <v-col cols="7">Addon Title {{ i }}</v-col>

            <v-col cols="2">Source</v-col>

            <v-col cols="2"
              ><v-btn color="primary" @click.stop="">Install</v-btn></v-col
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
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
// import { CurseAddonsState } from "@/store/index";

@Component
export default class AddonSearch extends Vue {}
</script>
