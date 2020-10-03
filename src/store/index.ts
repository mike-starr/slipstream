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

export const AddonStateMap = new Map<string, Addon>();

export function updateAddonStates(versions: string[]) {
  for (const version of versions) {
    if (!AddonStateMap.has(version)) {
      const addonState = new Addon({
        store,
        name: version
      });

      addonState.setVersion(version);
      AddonStateMap.set(version, addonState);
    }
  }
}
