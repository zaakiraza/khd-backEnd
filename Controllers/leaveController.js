import Leave from "../Models/leave.js";
import User from "../Models/user.js";

// Apply for Leave
export const applyLeave = async (req, res) => {
    try {
        const { leave_type, start_date, end_date, reason } = req.body;

        const user = await User.findById(req.user.userId);

        const newLeave = new Leave({
            user_id: req.user.userId,
            user_name: user.name,
            leave_type,
            start_date,
            end_date,
            reason,
        });

        await newLeave.save();
        res.status(201).json({ message: "Leave application submitted successfully", data: newLeave });
    } catch (error) {
        res.status(500).json({ message: "Error applying for leave", error: error.message });
    }
};

// Get All Leaves (Admin)
export const getAllLeaves = async (req, res) => {
    try {
        const { status, leave_type } = req.query;
        const query = { isActive: true };

        if (status) query.status = status;
        if (leave_type) query.leave_type = leave_type;

        const leaves = await Leave.find(query)
            .populate("user_id", "name email role")
            .sort({ createdAt: -1 });

        res.status(200).json({ data: leaves });
    } catch (error) {
        res.status(500).json({ message: "Error fetching leaves", error: error.message });
    }
};

// Get My Leaves (User)
export const getMyLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ user_id: req.user.userId, isActive: true }).sort({ createdAt: -1 });
        res.status(200).json({ data: leaves });
    } catch (error) {
        res.status(500).json({ message: "Error fetching your leaves", error: error.message });
    }
};

// Update Leave Status (Approve/Reject)
export const updateLeaveStatus = async (req, res) => {
    try {
        const { status, admin_comments } = req.body;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const leave = await Leave.findByIdAndUpdate(
            req.params.id,
            {
                status,
                admin_comments,
                approved_by: req.user.userId,
            },
            { new: true }
        );

        if (!leave) {
            return res.status(404).json({ message: "Leave request not found" });
        }

        res.status(200).json({ message: `Leave request ${status}`, data: leave });
    } catch (error) {
        res.status(500).json({ message: "Error updating leave status", error: error.message });
    }
};

// Delete Leave Request
export const deleteLeave = async (req, res) => {
    try {
        const leave = await Leave.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!leave) {
            return res.status(404).json({ message: "Leave request not found" });
        }

        res.status(200).json({ message: "Leave request deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting leave request", error: error.message });
    }
};
