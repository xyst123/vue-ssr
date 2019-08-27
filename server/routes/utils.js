const express = require('express');

const router = express.Router();

router.get('/timestamp', (req, res) => {
  res.json({
    code: 0,
    data: {
      timestamp: Date.now(),
    },
    message: 'success',
  });
});

module.exports = router;
