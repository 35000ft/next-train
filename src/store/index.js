import {createStore} from 'vuex';
import language from "src/store/modules/language";
import preference from "src/store/modules/preference";
import railsystem from "src/store/modules/railsystem";
import realtime from "src/store/modules/realtime";
import application from "src/store/modules/application";

const store = createStore({
    modules: {
        language,
        preference,
        railsystem,
        realtime,
        application
    }
});

export default store;
