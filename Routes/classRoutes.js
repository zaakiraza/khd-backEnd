import express from 'express';
import Class from '../Controllers/classController.js';
import { authenticateToken } from '../Middleware/authentication.js';
import { admin } from '../Middleware/admin.js';

export const classRoutes = express.Router();

classRoutes.get("/single/:id", authenticateToken, admin, Class.getClass);
classRoutes.get("/all", authenticateToken, admin, Class.getAllClasses);
classRoutes.post("/", authenticateToken, admin, Class.addClass);
classRoutes.put("/:id", authenticateToken, admin, Class.updateClass);
classRoutes.delete("/:id", authenticateToken, admin, Class.deleteClass);
classRoutes.patch("/update/inactive/:id", authenticateToken, admin, Class.inActiveClass);
classRoutes.patch("/update/active/:id", authenticateToken, admin, Class.activeClass);
