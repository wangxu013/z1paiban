const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    logout,
    // forgotPassword,
    resetPassword,
    // getUserDetails,
    // updatePassword,
    // updateProfile,
    // getAllUser,
    // getSingleUser,
    // updateUserRole,
    // deleteUser
} = require("../../controllers/userController");

//---------------------------------------------------------------------


router.route("/acc/register").post(registerUser);

router.route("/acc/login").post(loginUser);

router.route("/acc/restPassword").post(resetPassword);

router.route("/logout").get(logout);

module.exports = router;

