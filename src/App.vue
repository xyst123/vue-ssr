<template>
  <div id="app">
    <h3 class="env" @click="log">当前环境：{{env}}</h3>
    <h3 class="status">当前状态：{{status}}</h3>
    <mp-button :round="true" id="record-sync">同步</mp-button>
    <transition name="fade" mode="out-in">
      <router-view />
    </transition>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      env: process.env.NODE_ENV,
      status:
        process.env.VUE_ENV === "client"
          ? window.navigator.onLine
            ? "on-line"
            : "off-line"
          : "on-line"
    };
  },
  created() {
    if (process.env.VUE_ENV === "client") {
      window.addEventListener("online", this.setOnLine);
      window.addEventListener("offline", this.setOffLine);
    }
  },
  destroyed() {
    window.removeEventListener("online", this.setOnLine);
    window.removeEventListener("offline", this.setOffLine);
  },
  methods: {
    setOnLine() {
      this.status = "on-line";
    },
    setOffLine() {
      this.status = "off-line";
    },
    log() {
      throw new Error("error");
    }
  }
};
</script>
<style lang="less">
@import url(./style/reset.less);
</style>
<style lang="less" scoped>
@import url(./style/global.less);
.env {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 40px;
  background-color: @red0;
  transform: translate(0, 0);
}
.status {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 40px;
  background-color: @blue0;
  transform: translate(0, 0);
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}
</style>
