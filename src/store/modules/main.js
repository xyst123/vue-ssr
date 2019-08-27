import { request } from '../../utils';

export default {
  // state必须是一个函数
  state: () => ({
    images: [],
  }),
  actions: {
    getImages({ commit }, pageNumber) {
      return request({
        url: '/wrj/v1/show/2019/picAll',
        data: {
          page: pageNumber,
          size: 15,
          time: Date.now(),
        },
      }).then((images) => {
        commit('setImages', images.data);
      });
    },
  },
  mutations: {
    setImages(state, images) {
      state.images = images;
    },
  },
};
