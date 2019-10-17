const express = require('express');
const webPush = require('web-push');
const subscriptionController = require('../controllers/subscription');

const router = express.Router();

const vapidKeys = {
  publicKey: 'BOEQSjdhorIf8M0XFNlwohK3sTzO9iJwvbYU-fuXRF0tvRpPPMGO6d_gJC_pUQwBT7wD8rKutpNTFHOHN3VqJ0A',
  privateKey: 'TVe_nJlciDOn130gFyFYP8UiGxxWd3QdH6C5axXpSgM',
};
webPush.setVapidDetails('mailto:alienzhou16@163.com', vapidKeys.publicKey,
  vapidKeys.privateKey);

function pushMessage(subscription, data = '') {
  webPush.sendNotification(subscription, data).then((res) => {
    logger.info('推送数据：', res);
  }).catch((error) => {
    if (error.statusCode === 401 || error.statusCode === 404) {
      return subscriptionController.remove(subscription);
    }
    logger.error(error);
  });
}

router.post('/emit', async (req, res) => {
  const { id, payload } = req.body;
  try {
    const list = id ? await subscriptionController.getOne({ id }) : await subscriptionController.getAll();
    list.forEach((item) => {
      const { subscription } = item;
      pushMessage(subscription, payload);
    });

    res.json({
      code: list.length > 0 ? 0 : -1,
      message: list,
    });
  } catch (error) {
    logger.error(error);
    res.json({
      code: -1,
      message: error,
    });
  }
});

router.post('/set', async (req, res) => {
  try {
    const data = await subscriptionController.set(req.body);
    res.json({
      code: 0,
      message: data,
    });
  } catch (error) {
    logger.error(error);
    res.json({
      code: -1,
      message: error,
    });
  }
});

module.exports = router;
