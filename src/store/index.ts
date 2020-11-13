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

export const GameVersionStateMap: { [key: string]: GameVersion } = {};

export function updateAddonStates(versions: string[]) {
  for (const key of Object.keys(GameVersionStateMap)) {
    store.unregisterModule(key);
    delete GameVersionStateMap[key];
  }

  for (const version of versions) {
    const addonState = new GameVersion({
      store,
      name: version
    });

    addonState.setVersion(version);
    GameVersionStateMap[version] = addonState;
  }
}
