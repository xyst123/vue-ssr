import axios from 'axios';

export function iterateObject(object, handler) {
  const keys = Object.keys(object);
  keys.forEach((key) => {
    const value = object[key];
    handler(value, key, object);
  });
}

export function base64ToUint8Array(base64) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const realBase64 = (base64 + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const raw = window.atob(realBase64);
  const rawLength = raw.length;
  const array = new Uint8Array(new ArrayBuffer(rawLength));
  for (let i = 0; i < rawLength; i += 1) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
}

export function getDataFromCache(url) {
  if (process.env.VUE_ENV === 'client' && 'caches' in window) {
    return window.caches.match(url).then((cache) => {
      if (!cache) {
        return;
      }
      return cache.json();
    });
  }
  return Promise.resolve();
}

export function request({
  method = 'GET', url = '', params = {}, data = {}, customConfig = {},
}) {
  const realParams = {};
  if (method === 'GET') {
    Object.assign(realParams, params, data);
  } else {
    Object.assign(realParams, params);
  }
  const options = Object.assign({
    method,
    url: process.env.VUE_ENV === 'server' && url.startsWith('/') ? `http://127.0.0.1:${process.env.PORT}${url}` : url,
    data,
    params: realParams,
  }, customConfig);
  return new Promise((resolve) => {
    axios(options).then((res) => {
      resolve(res.data);
    }).catch((error) => {
      resolve(error);
    });
  });
}

export function requestProxy({
  method = 'GET', url = '', params = {}, data = {}, customConfig = {},
}, callback) {
  let cacheData;

  const realParams = {};
  if (method === 'GET') {
    Object.assign(realParams, params, data);
  } else {
    Object.assign(realParams, params);
  }
  const realParamsArray = [];
  iterateObject(realParams, (value, key) => {
    realParamsArray.push(`${key}=${value}`);
  });
  const realUrl = url + (realParamsArray.length > 0 ? '?' : '') + realParamsArray.join('&');

  return getDataFromCache(realUrl).then((cache) => {
    if (cache) {
      console.log('使用缓存数据');
      callback(cache);
    }
    cacheData = cache || {};
    return request({
      method, url, params, data, customConfig,
    });
  }).then((res) => {
    if (res.code === 200 && JSON.stringify(res) !== JSON.stringify(cacheData)) {
      console.log('使用接口返回数据');
      callback(res);
    }
  });
}

export function getStatuses() {
  return ['developer'];
}
