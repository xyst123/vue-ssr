const fs = require('fs');
// 服务端缓存
// const LRU = require('lru-cache');
const https = require('https');
const http = require('http');
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
// 设置浏览器tab小图标
const favicon = require('serve-favicon');
const compression = require('compression');
const microCache = require('route-cache');
const proxy = require('http-proxy-middleware');
const { createBundleRenderer } = require('vue-server-renderer');
const serverInfo = `express/${require('express/package.json').version} `
  + `vue-server-renderer/${require('vue-server-renderer/package.json').version}`;
require('./helpers/logger');
const { resolve, getConfig, iterateObject } = require('../utils');

const env = process.env.NODE_ENV || 'dev';
const serverConfig = getConfig().server || {};
const app = express();

// 暴露资源
const serve = (sourcePath, cache) => express.static(resolve(sourcePath), {
  maxAge: cache && serverConfig.enableStaticCache ? 1000 * 60 * 60 * 24 * 30 : 0,
});
// 添加安全相关HTTP头部
app.use(helmet());
app.use(compression({ threshold: 0 }));
app.use(favicon('./server/static/images/favicon.png'));
app.use('/dist', serve('dist', true));
app.use('/static', serve('server/static', true));
app.use('/manifest.json', serve('manifest.json', true));
app.use('/serviceWorker.js', serve('server/static/js/serviceWorker.js'));

// 使用代理接口
if (!serverConfig.enableMock) {
  iterateObject(serverConfig.proxy || {}, (options, path) => {
    app.use(path, proxy(options));
  });
}

// 使用自定义接口
app.use(bodyParser.json());
app.use('/utils', require('./routes/utils'));
app.use('/push', require('./routes/push'));
app.use('/sync', require('./routes/sync'));

function createRenderer(bundle, options) {
  return createBundleRenderer(bundle, Object.assign(options, {
    // 组件缓存
    // cache: new LRU({
    //   max: 1000,
    //   maxAge: 1000 * 60 * 15,
    // }),
    basedir: resolve('dist'),
    runInNewContext: false,
  }));
}

// 渲染页面
let renderer;
let readyPromise;
const templatePath = resolve('./server/views/index.template.html');
if (env === 'dev') {
  readyPromise = require('./helpers/setup-dev-server')({
    app,
    templatePath,
    callback: (bundle, options) => {
      renderer = createRenderer(bundle, options);
    },
    serverConfig,
  });
} else {
  const template = fs.readFileSync(templatePath, 'utf-8');
  const bundle = require('../dist/vue-ssr-server-bundle.json');
  const clientManifest = require('../dist/vue-ssr-client-manifest.json');
  renderer = createRenderer(bundle, {
    template,
    clientManifest,
  });
}

function render(req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Server', serverInfo);

  const handleError = (err) => {
    if (err.url) {
      res.redirect(err.url);
    } else if (err.code === 404) {
      res.status(404).send('404 | Page Not Found');
    } else {
      // Render Error Page or Redirect
      res.status(500).send('500 | Internal Server Error');
      logger.error(`error during render : ${req.url}`);
      logger.error(err.stack);
    }
  };

  const context = {
    title: 'vue-ssr',
    aCode: 'aCode',
    bCode: 'bCode',
    url: req.url,
  };
  renderer.renderToString(context, (err, html) => {
    if (err) {
      return handleError(err);
    }
    res.send(html);
  });
}

// 页面缓存1秒，针对每个用户渲染不同内容的页面不应当使用缓存
app.use(microCache.cacheSeconds(1, (req) => {
  const { params } = req;
  return !params || !params.noCache;
}));

app.get('*', env === 'dev' ? (req, res) => {
  readyPromise.then(() => render(req, res));
} : render);

const { port, protocol } = serverConfig;
if (protocol === 'https') {
  const httpsOptions = {
    key: fs.readFileSync(resolve('server.key')),
    cert: fs.readFileSync(resolve('server.crt')),
  };
  const httpsServer = https.createServer(httpsOptions, app);

  httpsServer.listen(port, () => {
    console.log(`server started at localhost:${port}`);
  });
} else {
  const httpServer = http.createServer(app);

  httpServer.listen(port, () => {
    console.log(`server started at localhost:${port}`);
  });
}
