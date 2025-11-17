import express from "express";
import * as emailMatter from "../Controllers/emailMatterController.js";
import { authenticateToken } from "../Middleware/authentication.js";
import { admin } from "../Middleware/admin.js";

const emailMatterRoutes = express.Router();

// Create Email Matter
emailMatterRoutes.post("/", authenticateToken, admin, emailMatter.createEmailMatter);

// Get All Email Matters
emailMatterRoutes.get("/", authenticateToken, admin, emailMatter.getAllEmailMatters);

// Get Email Matter by ID
emailMatterRoutes.get("/:id", authenticateToken, admin, emailMatter.getEmailMatterById);

// Get Email Matters by Type
emailMatterRoutes.get("/type/:type", authenticateToken, admin, emailMatter.getEmailMattersByType);

// Update Email Matter
emailMatterRoutes.put("/:id", authenticateToken, admin, emailMatter.updateEmailMatter);

// Delete Email Matter
emailMatterRoutes.delete("/:id", authenticateToken, admin, emailMatter.deleteEmailMatter);

// Toggle Active Status
emailMatterRoutes.patch("/:id/toggle-active", authenticateToken, admin, emailMatter.toggleActiveStatus);

export default emailMatterRoutes;
