const express=require('express');
const authRouter=express.Router();
const cookieParser=require('cookie-parser')
const jwtAuth = require('../middleware/jwtAuth.js');
// authRouter.post('/sign');


const {signup,signin,getuser,userLogout, forgotPassword,resetPassword} = require("../controller/authcontroller.js");

authRouter.post('/signup',signup);
authRouter.post('/signin',signin);
authRouter.get('/getuser',jwtAuth,getuser)
authRouter.get('/logout',jwtAuth,userLogout)
authRouter.post('/forgotpassword', forgotPassword);
authRouter.post('/resetpassword/:token', resetPassword);

module.exports=authRouter;