const express = require('express');

const router = express.Router();

router.get('/record', (req, res) => {
  res.json({
    code: 0,
    message: 'success',
  });
});

module.exports = router;
