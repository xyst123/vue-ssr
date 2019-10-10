import { requestProxy } from '../../utils';

export default {
  // state必须是一个函数
  state: () => ({
    images: [],
  }),
  actions: {
    getImages({ commit }, pageNumber) {
      return requestProxy({
        url: '/wrj/v1/show/2019/picAll',
        data: {
          page: pageNumber,
          size: 15,
        },
      }, (data) => {
        commit('setImages', data.data);
      });
    },
  },
  mutations: {
    setImages(state, images) {
      state.images = images;
    },
  },
};
