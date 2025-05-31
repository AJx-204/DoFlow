import mongoose from "mongoose"

const ConnectDB = async () => {
    try {
        const DBConnection = await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.DB_NAME}`)
        console.log(`mongoDB connection success ; ${DBConnection.connection.host}`);
    } catch (error) {
        console.log(`mongoDB connection faild`)
        process.exit(1)
    }
}


export default ConnectDB;