const express = require('express');
const router = express.Router();


//------------------------------------------------------------------------------

//^ 1. response users/login page
router.get('/login', function(req, res, next) {
  res.render('login');
});//$ 1. response users/login page

//^ 2. response users/register page
router.get('/register', function(req, res, next) {
  res.render('register');
});//$ 2. response users/register page

















//-------------------------------------------------------------------------------
module.exports = router;
