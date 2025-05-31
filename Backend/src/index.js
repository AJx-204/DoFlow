import app from "./app.js";
import dotenv from 'dotenv'
import ConnectDB from "./database/ConnectDB.js";
 
dotenv.config({
    path:'./.env'
});

const PORT = process.env.PORT || 5000;

ConnectDB()
.then(
    ()=>{
        app.listen(PORT, ()=>{
            console.log(`Server is running at port ${PORT}`)
        })
    }
)
.catch(
    (error)=>{
        console.log('mongoDB connection error', error)
    }
)