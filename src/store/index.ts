import Vue from "vue";
import Vuex from "vuex";
import CurseAddons from "@/store/modules/CurseAddons";
import GameConfiguration from "@/store/modules/GameConfiguration";
import { getModule } from "vuex-module-decorators";

import { remote } from "electron";

Vue.use(Vuex);

const rootStore = new Vuex.Store({
  state: {
    appDataDirectory: remote.app.getPath("userData")
  },
  modules: {
    CurseAddons,
    GameConfiguration
  },
  strict: true
});

export default rootStore;
export const GameConfigurationState = getModule(GameConfiguration, rootStore);
export const CurseAddonsState = getModule(CurseAddons, rootStore);
