import wepy from '@wepy/core';
import Vuex from '@wepy/x';
import { 
  carSourceDetail,
  reqMasterBrands,
} from '@/common/httpRequest';

wepy.use(Vuex)

export default new Vuex.Store({
  state: {
    userInfo: null,
    get_carSourceDetail: {},
    get_reqMasterBrands: {}
  },
  mutations: {
    carSourceDetail (state, options) {
        carSourceDetail.fetch(options).then(respone => {
            state.get_carSourceDetail = respone
        })
    },
    reqMasterBrands (state, options) {
        reqMasterBrands.fetch(options).then(respone => {
            state.get_reqMasterBrands = respone
        })
    },
  },
  actions: {
    carSourceDetail({commit}, options) {
        commit('carSourceDetail', options);
	},
    reqMasterBrands({commit}, options) {
        commit('reqMasterBrands', options);
	},
	
  }
});
