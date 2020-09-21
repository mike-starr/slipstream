import Vue from "vue";
import Vuex from "vuex";

import AddonSearch from "@/store/modules/AddonSearch";
import Application from "@/store/modules/Application";
import Game from "@/store/modules/Game";
import InstalledAddons from "@/store/modules/InstalledAddons";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {},
  modules: {},
  strict: true
});

export default store;

export const ApplicationState = new Application({
  store,
  name: "ApplicationState"
});
export const GameState = new Game({
  store,
  name: "Game"
});
export const AddonSearchState = new AddonSearch({ store, name: "AddonSearch" });
export const InstalledAddonsState = new InstalledAddons({
  store,
  name: "InstalledAddons"
});
