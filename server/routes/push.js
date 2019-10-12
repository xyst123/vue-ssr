const express = require('express');
const webPush = require('web-push');
const DataStore = require('nedb');

const router = express.Router();
const db = new DataStore();
const vapidKeys = {
  publicKey: 'BOEQSjdhorIf8M0XFNlwohK3sTzO9iJwvbYU-fuXRF0tvRpPPMGO6d_gJC_pUQwBT7wD8rKutpNTFHOHN3VqJ0A',
  privateKey: 'TVe_nJlciDOn130gFyFYP8UiGxxWd3QdH6C5axXpSgM'
};
webPush.setVapidDetails('mailto:alienzhou16@163.com', vapidKeys.publicKey,
  vapidKeys.privateKey)

function getSubscription(query) {
  return new Promise((resolve, reject) => {
    db.find(query, (error, list) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(list);
    });
  });
}
function getSubscriptions() {
  return new Promise((resolve, reject) => {
    db.find({}, (error, list) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(list);
    });
  });
}
function removeSubscription(subscription) {
  return new Promise((resolve, reject) => {
    db.remove(subscription, { multi: true }, (error, number) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(number);
    });
  });
}
function pushMessage(subscription, data = "") {
  webPush.sendNotification(subscription, data).then(data => {
    logger.info('推送数据：', data);
    return;
  }).catch(error => {
    if (error.statusCode === 401 || error.statusCode === 404) {
      return removeSubscription(subscription);
    }
    logger.error(error);
  })
}
router.post('/emit', async (req, res) => {
  const { id, payload } = req.body;
  try {
    const list = id ? await getSubscription({ id }) : await getSubscriptions();
    list.forEach(item => {
      const { subscription } = item;
      pushMessage(subscription, payload);
    })

    res.json({
      code: list.length > 0 ? 0 : -1,
      message: list,
    });
  } catch (error) {
    logger.error(error);
    res.json({
      code: -1,
      message: error,
    })
  }
});

function set(req) {
  const { id, subscription } = req.body;
  return new Promise((resolve, reject) => {
    db.findOne({ 'subscription.endpoint': subscription.endpoint }, (error, result) => {
      if (error) {
        reject(error)
      } else if (result) {
        result.id = id;
        db.update({ subscription }, result, {}, error => {
          if (error) reject(error);
          resolve(req.body);
        });
      } else {
        db.insert(req.body, (error) => {
          if (error) reject(error);
          resolve(req.body);
        });
      }
    })
  })
}
router.post('/set', async (req, res) => {
  try {
    const data = await set(req);
    res.json({
      code: 0,
      message: data,
    })
  } catch (error) {
    logger.error(error);
    res.json({
      code: -1,
      message: error,
    })
  }
});

module.exports = router;
