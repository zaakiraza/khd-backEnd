import mongoose from "mongoose";
import User from "./Models/user.js";
import Class from "./Models/class.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGOURI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Sync student counts for all classes
const syncClassStudentCounts = async () => {
  try {
    console.log("Starting class student count synchronization...");

    // Get all active classes
    const classes = await Class.find({ isActive: true });
    console.log(`Found ${classes.length} active classes`);

    for (const classDoc of classes) {
      // Count students who have this class in their active class_history
      const studentCount = await User.countDocuments({
        "personal_info.verified": true,
        "personal_info.status": "active",
        "personal_info.application_status": "accepted",
        "class_history": {
          $elemMatch: {
            class_name: classDoc._id,
            status: { $in: ["inprogress", "active"] }
          }
        }
      });

      console.log(`Class ${classDoc.class_name}: ${studentCount} enrolled students`);

      // Update the class document
      await Class.findByIdAndUpdate(classDoc._id, {
        students_enrolled: studentCount
      });
    }

    console.log("Class student count synchronization completed successfully!");
  } catch (error) {
    console.error("Error syncing class student counts:", error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await syncClassStudentCounts();
  await mongoose.disconnect();
  console.log("Database connection closed");
};

// Run the script
main().catch(console.error);