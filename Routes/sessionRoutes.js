import express from 'express';
import session from '../Controllers/sessionController.js';
import { authenticateToken } from '../Middleware/authentication.js';
import { admin } from '../Middleware/admin.js';

export const sessionRoutes = express.Router();

sessionRoutes.get("/single/:id", authenticateToken, admin, session.getSession);
sessionRoutes.get("/all", authenticateToken, admin, session.getAllSession);
sessionRoutes.post("/", authenticateToken, admin, session.addSession);
sessionRoutes.put("/:id", authenticateToken, admin, session.UpdateSession);
sessionRoutes.delete("/:id", authenticateToken, admin, session.deleteSession);
sessionRoutes.patch("/update/inactive/:id", authenticateToken, admin, session.inActiveSession);
sessionRoutes.patch("/update/active/:id", authenticateToken, admin, session.activeSession);