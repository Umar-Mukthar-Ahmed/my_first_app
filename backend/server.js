const express= require ('express');
const app=express();
const {PORT} = require ('./config/index')
const dbConnect = require('./database/index');

dbConnect();

app.get('/',(req,res)=>{
    res.json({msg:"hello world!"});
});

app.listen(PORT,()=>{
    console.log(`the app is running on port https://localhost:${PORT}`);
});