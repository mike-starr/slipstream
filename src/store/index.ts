import Vue from "vue";
import Vuex from "vuex";

import Application from "@/store/modules/Application";
import Game from "@/store/modules/Game";
import Addon from "@/store/modules/Addon";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {},
  modules: {},
  strict: true
});

export default store;

export const ApplicationState = new Application({
  store,
  name: "Application"
});
export const GameState = new Game({
  store,
  name: "Game"
});
export const AddonState = new Addon({
  store,
  name: "Addon"
});
