var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var session = require('express-session');
var MongoStore = require('connect-mongo');

var indexRouter = require('./routes/web/index');
var usersRouter = require('./routes/web/users');
var adminRouter = require('./routes/web/admin');
var employeeRouter = require('./routes/web/employee');
var work_scheduleRouter = require('./routes/web/work-schedule');
var employeeAPIRouter = require('./routes/api/employeeAPI');
var authAPIRouter = require('./routes/api/authAPI');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//启动跨域中间件
app.use(cors());
//启用会话中间件
app.use(session({
    // name: 'sakura',
    secret: 'secret',
    resave: true,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7
    },
    store: MongoStore.create({
      mongoUrl: 'mongodb://127.0.0.1:27017/sakura',
      ttl: 7 * 24 * 60 * 60  // = 7 days. Default
    })
}));
//启用验证session的中间件,验证通过可进行路由,否则跳转到登录页面"/users/login"
app.use(require('./middlewares/verifySession'));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/employee', employeeRouter);
app.use('/work-schedule', work_scheduleRouter);
app.use('/', employeeAPIRouter);
app.use('/', authAPIRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
