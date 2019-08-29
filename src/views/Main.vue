<template>
  <div class="main">
    <h3 class="env" @click="log">当前环境：{{env}}</h3>
    <button @click="getImages">换一批图片</button>
    <ul class="image-list">
      <li class="image-item" v-for="image in images" :key="`${image.aid}`">
        <img :src="image.cover" alt />
      </li>
    </ul>
  </div>
</template>

<script>
import { request } from "../utils";
import mainModule from "../store/modules/main";
let page = 1;
export default {
  name: "Main",
  data() {
    return {
      env: process.env.NODE_ENV
    };
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
    log() {
      throw new Error("error");
    },
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
  .env {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 40px;
    background-color: @red0;
    transform: translate(0, 0);
  }
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
