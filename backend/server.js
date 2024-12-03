const express= require ('express');
const {PORT} = require ('./config/index');
const dbConnect = require('./database/index');
const router = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');
const app=express();


app.use(express.json());
app.use(router);
dbConnect();

app.use(errorHandler);

app.listen(PORT,()=>{
    console.log(`the app is running on port http://localhost:${PORT}`);
});