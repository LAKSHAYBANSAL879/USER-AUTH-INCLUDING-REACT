require('dotenv').config();
const express=require('express')
const cookieParser=require('cookie-parser')
const cors=require('cors')
const app=express();
const userroutes=require('./router/authroute.js')
const connectDb=require('./config/db.js')
connectDb();
app.use(express.json());
app.use(cookieParser());
app.use(cors({origin:[process.env.CLIENT_URL],credentials:true}))
// app.use(express.urlencoded({ extended: true }));
app.use('/',userroutes)
module.exports=app;