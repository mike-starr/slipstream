import Vue from "vue";
import Vuex from "vuex";

import Application from "@/store/modules/Application";
import GameVersion from "@/store/modules/GameVersion";

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

export const GameVersionStateMap = new Map<string, GameVersion>();

export function updateAddonStates(versions: string[]) {
  for (const version of versions) {
    if (!GameVersionStateMap.has(version)) {
      const addonState = new GameVersion({
        store,
        name: version
      });

      addonState.setVersion(version);
      GameVersionStateMap.set(version, addonState);
    }
  }
}
