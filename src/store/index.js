import {createStore} from 'vuex';
import language from "src/store/modules/language";

const store = createStore({
  modules: {
    language
  }
});

export default store;
