<template>
  <div class="main">
    <mp-button :round="true" @click="$router.push('/sub')">跳转</mp-button>
    <mp-button :round="true" @click="getImages">换一批图片</mp-button>
    <mp-image-upload
      url="/upload"
      image="http://5b0988e595225.cdn.sohucs.com/c_zoom,w_400/images/20190920/9846b5bc21ea42818387788cc509f1a5.jpeg"
    />
    <ul class="image-list">
      <li class="image-item" v-for="image in images" :key="`${image.aid}`">
        <img :src="image.cover" alt />
      </li>
    </ul>
  </div>
</template>

<script>
import { request } from "../utils";
let page = 1;
export default {
  name: "Main",
  data() {
    return {};
  },
  // 此函数会在组件实例化之前调用，所以它无法访问this，需要将store和路由信息作为参数传递进去
  asyncData({ store, route }) {
    return store.dispatch("getImages", page);
  },
  computed: {
    images() {
      return this.$store.state.main.images;
    }
  },
  created() {
    request({
      url: "/utils/timestamp"
    });
  },
  methods: {
    getImages() {
      page += 1;
      this.$store.dispatch("getImages", page);
    }
  }
};
</script>
<style lang="less" scoped>
@import url(../style/global.less);
.main {
  .image-list {
    .image-item {
      img {
        width: 280px;
        height: 185px;
        object-fit: cover;
      }
    }
  }
}
</style>