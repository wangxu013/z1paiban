//*验证session的中间件,验证通过可进行路由,否则跳转到登录页面"/users/login"

module.exports = (req, res, next) => {
  // 判断路径是否为开发路径
  if (req.path === "/" || req.path === "/users/login" || req.path === "/users/register" || req.path.match(/^\/acc/) || req.path.match(/^\/work-schedule/)) {
    return next();
  }

  // 验证用户是否登录
  if (!(req.session.user && req.session.user._id)) {
    res.redirect("/users/login");
    return;
  }

  next();
};