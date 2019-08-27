import axios from 'axios';

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

export function iterateObject(object, handler) {
  const keys = Object.keys(object);
  keys.forEach((key) => {
    const value = object[key];
    handler(value, key, object);
  });
}
