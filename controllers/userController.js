//todo export : loginUser, registerUser, resetPassword, logout module

//*import User model
const User = require("../mongodb/mg_model_module").User;

//^ loginUser对话函数
async function loginUser(req, res) {

    let { email, password } = req.body;
    try {
        //如果没有找到email,返回用户不存在,请在注册页面注册用户
        if (!(await User.findOne({ email }))) {
            return res.render('info', {
                status: 4,
                msg: "login failed, email is not exist",
                link: "/users/register",
                linkName: "register your account,注册新的用户"
            });
        }
        //如果找到email,但是密码不匹配,返回密码错误,请在登录页面重新登录
        let doc = await User.findOne({ email, password });
        if (!doc) {
            return res.render('info', {
                status: 4008,
                msg: "login failed, wrong username or password",
                link: "/users/login",
                linkName: "login again"
            });
        }
        req.session.user = doc;
        return res.render('info', {
            status: 0,
            msg: "login success",
            link: "/admin",
            linkName: "跳转排班管理页面 admin page"
        });
    } catch (error) {
        return res.render('info', {
            status: 56,
            msg: "login failed, database error",
            link: "/users/login",
            linkName: "login again"
        });

    }


}//$ loginUser对话函数

//^ registerUser对话函数
async function registerUser(req, res) {
    //?获取数据
    console.log(req.body);
    let { username, password, email, role, token } = req.body;

    //?检查token
    if (token !== "yzl14159265358979323846") {
        return res.render("info", {
            status: 3,
            msg: "register failed, wrong token",
            link: "/users/register",
            linkName: "do it again 再来注册一回"
        });
    }

    //?检查用户名和邮箱是否已经存在,如果存在,返回用户名或邮箱已经存在,请重新注册
    let doc = await User.find({ $or: [{ username }, { email }] });
    if (doc.length !== 0) {
        return res.render("info", {
            status: 4,
            msg: "register failed, username or email already exists",
            link: "/users/register",
            linkName: "do it again 再来注册一回"
        });
    }

    //?如果用户名和邮箱不存在,保存用户信息,返回注册成功,跳转到登录页面
    try {
        let data = await new User({ username, password, email, role }).save();

        req.session.user = data;
        return res.render("info", {
            status: 0,
            msg: "register success",
            link: "/admin",
            linkName: "跳转排班管理页面 admin page"
        });

//?如果存储数据错误
    } catch {
        (err) => {
            return res.render("info", {
                status: 56,
                msg: `register failed, database error;\n` + err,
                link: "/users/register",
                linkName: "do it again 再来注册一回"
            });
        };
    };

}//$ registerUser对话函数

//^ resetPassword对话函数
async function resetPassword(req, res) {
    let { email, password, token} = req.body;
    console.log(req.body);
    //?检查token
    if (token !== "yzl14159265358979323846") {
        return res.render("info", {
            status: 3,
            msg: "register failed, wrong token",
            link: "/users/login",
            linkName: "do it again 再重设一回"
        });
    }

    //?检查email是否存在,如果不存在,返回用户不存在
    let doc = await User.findOne({ email }).exec();
    if (!doc) {
        return res.render('info',{
            status: 4,
            msg: "reset password failed, wrong email (email不存在)"
        });
    }
    doc.password = password;
    doc.save();
    return res.render("info",{
        status: 0,
        msg: "reset password success",
        link: "/admin",
        linkName:"跳转班表管理页面"
    });
}//$ resetPassword对话函数

//^ logout对话函数
async function logout(req, res) {
    req.session.destroy();
    return res.json({
        status: 0,
        msg: "logout success"
    });
}//$ logout对话函数

//------------------------------------------------------------------

//*export loginUser, registerUser, resetPassword, logout 
module.exports = {
    loginUser,
    registerUser,
    resetPassword,
    logout
};