var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  //自动跳转到work-schedule页面
  res.redirect("/work-schedule");
});

module.exports = router;