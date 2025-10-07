import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connectDB = async () => {
    try {
        const mon = await mongoose.connect(process.env.MONGOURI);
        // const mon = await mongoose.connect(process.env.MONGOURILOCAL);
        console.log("DataBase connected");
    } catch (error) {
        console.log("Error: ",error.message);
    }
};
