import mongoose from "mongoose";
import Quiz from "./Models/quiz.js";
import dotenv from "dotenv";

dotenv.config();

const migrateQuizStatus = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");

    // Update all quizzes with status "completed" to "close"
    const result = await Quiz.updateMany(
      { status: "completed" },
      { $set: { status: "close" } }
    );

    console.log(`Migration completed: ${result.modifiedCount} quizzes updated from 'completed' to 'close'`);

    // Update all quizzes with status "ongoing" to "published"
    const result2 = await Quiz.updateMany(
      { status: "ongoing" },
      { $set: { status: "published" } }
    );

    console.log(`Migration completed: ${result2.modifiedCount} quizzes updated from 'ongoing' to 'published'`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateQuizStatus();
