import Session from "../Models/session.js";
import { successHandler, errorHandler } from "../Utlis/ResponseHandler.js";

const getSession = async (req, res) => {
    try {
        const sessionId = req.params.id;
        const sessionData = await Session.findOne({ _id: sessionId }).select('-__v -createdAt -updatedAt');
        if (!sessionData) {
            return errorHandler(res, 404, "Session not found");
        }
        return successHandler(res, 200, "Session retrieved successfully", sessionData, 1);
    } catch (error) {
        return errorHandler(res, 500, "Error retrieving session", error.message);
    }
}

const getAllSession = async (req, res) => {
    try {
        const sessions = await Session.find().select('-__v -createdAt -updatedAt');
        if (sessions.length === 0) {
            return errorHandler(res, 404, "No sessions found");
        }
        return successHandler(res, 200, "Sessions retrieved successfully", sessions, sessions.length);
    } catch (error) {
        return errorHandler(res, 500, "Error retrieving sessions", error.message);
    }
}

const addSession = async (req, res) => {
    try {
        const { session_name } = req.body;
        if (!session_name) {
            return errorHandler(res, 400, "Session name is required");
        }
        const isSessionExists = await Session.findOne({ session_name });
        if (isSessionExists) {
            return errorHandler(res, 400, "Session with this name already exists");
        }
        const newSession = new Session({ session_name });
        await newSession.save();
        return successHandler(res, 201, "Session added successfully");
    } catch (error) {
        return errorHandler(res, 500, "Error adding session", error.message);
    }
}

const UpdateSession = async (req, res) => {
    try {
        const sessionId = req.params.id;
        const { session_name } = req.body;
        if (!session_name) {
            return errorHandler(res, 400, "Session name is required");
        }
        const updatedSession = await Session.findByIdAndUpdate(sessionId, { session_name }, { new: true });
        if (!updatedSession) {
            return errorHandler(res, 404, "Session not found");
        }
        return successHandler(res, 200, "Session updated successfully", updatedSession, 1);
    } catch (error) {
        return errorHandler(res, 500, "Error updating session", error.message);
    }
}

const deleteSession = async (req, res) => {
    try {
        const sessionId = req.params.id;
        const deletedSession = await Session.findByIdAndDelete(sessionId);
        if (!deletedSession) {
            return errorHandler(res, 404, "Session not found");
        }
        return successHandler(res, 200, "Session deleted successfully", deletedSession, 1);
    } catch (error) {
        return errorHandler(res, 500, "Error deleting session", error.message);
    }
}

const inActiveSession = async (req, res) => {
    try {
        const sessionId = req.params.id;
        const sessionData = await Session.findById(sessionId);
        if (!sessionData) {
            return errorHandler(res, 404, "Session not found");
        }
        if (!sessionData.isActive) {
            return errorHandler(res, 400, "Session is already inactive");
        }
        sessionData.isActive = false;
        await sessionData.save();
        return successHandler(res, 200, "Session deactivated successfully", sessionData, 1);
    } catch (error) {
        return errorHandler(res, 500, "Error deactivating session", error.message);
    }
}

const activeSession = async (req, res) => {
    try {
        const sessionId = req.params.id;
        const sessionData = await Session.findById(sessionId);
        if (!sessionData) {
            return errorHandler(res, 404, "Session not found");
        }
        if (sessionData.isActive) {
            return errorHandler(res, 400, "Session is already active");
        }
        sessionData.isActive = true;
        await sessionData.save();
        return successHandler(res, 200, "Session activated successfully", sessionData, 1);
    } catch (error) {
        return errorHandler(res, 500, "Error activating session", error.message);
    }
}

export default {
    getSession,
    getAllSession,
    addSession,
    UpdateSession,
    deleteSession,
    inActiveSession,
    activeSession
}