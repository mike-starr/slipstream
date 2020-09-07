import Vue from "vue";
import Vuex from "vuex";
import AddonSearch from "@/store/modules/AddonSearch";
//import CurseAddons from "@/store/modules/CurseAddons";
import GameConfiguration from "@/store/modules/GameConfiguration";

import { remote } from "electron";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    appDataDirectory: remote.app.getPath("userData")
  },
  modules: {},
  strict: true
});

export default store;
export const GameConfigurationState = new GameConfiguration({
  store,
  name: "GameConfiguration"
});
/*export const CurseAddonsState = new CurseAddons({
  store,
  name: "CurseAddons"
});*/
export const AddonSearchState = new AddonSearch({ store, name: "AddonSearch" });
