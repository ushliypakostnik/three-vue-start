const initialState = {
  isGameLoaded: false,

  // remove this field in real project
  emptyProjectField: false,

  // isElementLoaded: false,

  // isElementBuilt: false,
};

const state = initialState;

let stateCopy;
let result;

const getters = {
  isGameLoaded: state => state.isGameLoaded,
};

const actions = {
  preloadOrBuilt: ({ commit }, field) => {
    commit('preloadOrBuilt', field);
  },

  isAllLoadedAndBuilt: ({ commit }) => {
    commit('isAllLoadedAndBuilt');
  },
};

const mutations = {
  preloadOrBuilt: (state, field) => {
    state[field] = true;
  },

  isAllLoadedAndBuilt: (state) => {
    stateCopy = Object.assign({}, state);
    delete stateCopy.isGameLoaded;
    result = Object.values(stateCopy).every(field => field === true);

    console.log('AAAAAAAAAAAAAAAAAAAAAAA', result);

    if (result) state.isGameLoaded = true;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};