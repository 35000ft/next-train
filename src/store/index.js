import {createStore} from 'vuex';
import language from "src/store/modules/language";
import preference from "src/store/modules/preference";
import railsystem from "src/store/modules/railsystem";

const store = createStore({
  modules: {
    language,
    preference,
    railsystem
  }
});

export default store;
