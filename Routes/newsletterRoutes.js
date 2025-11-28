import express from "express";
import {
  subscribeNewsletter,
  verifySubscription,
  unsubscribeNewsletter,
  getAllSubscribers,
  updateSubscriberPreferences,
  deleteSubscriber,
  getNewsletterStats,
} from "../Controllers/newsletterController.js";
import { authenticateToken } from "../Middleware/authentication.js";
import { admin } from "../Middleware/admin.js";

const newsletterRoutes = express.Router();

// Public routes - no authentication required
newsletterRoutes.post("/subscribe", subscribeNewsletter);
newsletterRoutes.get("/verify/:token", verifySubscription);
newsletterRoutes.get("/unsubscribe", unsubscribeNewsletter);

// Admin routes - authentication and admin role required
newsletterRoutes.get("/subscribers", authenticateToken, admin, getAllSubscribers);
newsletterRoutes.get("/stats", authenticateToken, admin, getNewsletterStats);
newsletterRoutes.put("/subscribers/:id/preferences", authenticateToken, admin, updateSubscriberPreferences);
newsletterRoutes.delete("/subscribers/:id", authenticateToken, admin, deleteSubscriber);

export { newsletterRoutes };