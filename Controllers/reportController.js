import User from "../Models/user.js";
import Class from "../Models/class.js";
import Attendance from "../Models/attendance.js";
import Result from "../Models/result.js";
import ExamSchedule from "../Models/examSchedule.js";
import LessonPlan from "../Models/lessonPlan.js";

// Class Reports
export const getClassReports = async (req, res) => {
    try {
        const classes = await Class.find({ isActive: true });
        const reports = [];

        for (const cls of classes) {
            const studentCount = await User.countDocuments({ class_id: cls._id, role: "student", isActive: true });

            // Calculate average attendance
            const attendanceRecords = await Attendance.find({ class_id: cls._id });
            let totalAttendancePercentage = 0;
            if (attendanceRecords.length > 0) {
                const totalPresent = attendanceRecords.reduce((sum, record) => sum + record.total_present, 0);
                const totalPossible = attendanceRecords.reduce((sum, record) => sum + record.total_students, 0);
                totalAttendancePercentage = totalPossible > 0 ? (totalPresent / totalPossible) * 100 : 0;
            }

            reports.push({
                class_id: cls._id,
                class_name: cls.class_name,
                total_students: studentCount,
                average_attendance: totalAttendancePercentage.toFixed(2),
                // Add more metrics as needed
            });
        }

        res.status(200).json({ data: reports });
    } catch (error) {
        res.status(500).json({ message: "Error generating class reports", error: error.message });
    }
};

// Student Reports
export const getStudentReports = async (req, res) => {
    try {
        const { class_id } = req.query;
        const query = { role: "student", isActive: true };
        if (class_id) query.class_id = class_id;

        const students = await User.find(query).select("name email class_name roll_no");
        const reports = [];

        for (const student of students) {
            // Attendance
            // This is expensive, in production use aggregation
            const attendance = await Attendance.find({ "attendance_records.student_id": student._id });
            let presentCount = 0;
            let totalDays = attendance.length;

            attendance.forEach(record => {
                const studentRecord = record.attendance_records.find(r => r.student_id.toString() === student._id.toString());
                if (studentRecord && studentRecord.status === 'present') {
                    presentCount++;
                }
            });

            const attendancePercentage = totalDays > 0 ? (presentCount / totalDays) * 100 : 0;

            // Results
            const results = await Result.find({ student_id: student._id });
            const totalMarks = results.reduce((sum, r) => sum + r.marks_obtained, 0);
            const maxMarks = results.reduce((sum, r) => sum + r.total_marks, 0);
            const averagePercentage = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0;

            reports.push({
                student_id: student._id,
                name: student.name,
                class_name: student.class_name,
                roll_no: student.roll_no,
                attendance_percentage: attendancePercentage.toFixed(2),
                average_result: averagePercentage.toFixed(2),
            });
        }

        res.status(200).json({ data: reports });
    } catch (error) {
        res.status(500).json({ message: "Error generating student reports", error: error.message });
    }
};

// Exam Reports
export const getExamReports = async (req, res) => {
    try {
        const exams = await ExamSchedule.find({ status: "completed" }).populate("class_id", "class_name");
        const reports = [];

        for (const exam of exams) {
            const results = await Result.find({ exam_id: exam._id });

            if (results.length === 0) continue;

            const totalStudents = results.length;
            const passedStudents = results.filter(r => r.marks_obtained >= exam.passing_marks).length;
            const passPercentage = (passedStudents / totalStudents) * 100;

            const avgMarks = results.reduce((sum, r) => sum + r.marks_obtained, 0) / totalStudents;

            const topScorer = results.sort((a, b) => b.marks_obtained - a.marks_obtained)[0];

            reports.push({
                exam_id: exam._id,
                exam_name: exam.exam_name,
                class_name: exam.class_id?.class_name,
                subject: exam.subject,
                total_students: totalStudents,
                pass_percentage: passPercentage.toFixed(2),
                average_marks: avgMarks.toFixed(2),
                top_scorer: topScorer ? topScorer.student_name : "N/A",
            });
        }

        res.status(200).json({ data: reports });
    } catch (error) {
        res.status(500).json({ message: "Error generating exam reports", error: error.message });
    }
};

// Teacher Reports
export const getTeacherReports = async (req, res) => {
    try {
        const teachers = await User.find({ role: "teacher", isActive: true });
        const reports = [];

        for (const teacher of teachers) {
            // Classes assigned (assuming logic exists, currently just counting lesson plans as proxy for activity)
            const lessonPlans = await LessonPlan.countDocuments({ created_by: teacher._id });

            reports.push({
                teacher_id: teacher._id,
                name: teacher.name,
                email: teacher.email,
                lesson_plans_created: lessonPlans,
            });
        }

        res.status(200).json({ data: reports });
    } catch (error) {
        res.status(500).json({ message: "Error generating teacher reports", error: error.message });
    }
};
