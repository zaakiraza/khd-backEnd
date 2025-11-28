import Newsletter from "../Models/newsletter.js";
import { successHandler, errorHandler } from "../Utlis/ResponseHandler.js";
import { sendEmail } from "../Utlis/nodeMailer.js";
import crypto from "crypto";

// Subscribe to Newsletter
const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorHandler(res, 400, "Email is required");
    }

    // Check if email already exists
    const existingSubscriber = await Newsletter.findOne({ email });

    if (existingSubscriber) {
      if (existingSubscriber.isActive && existingSubscriber.isVerified) {
        return errorHandler(res, 400, "Email is already subscribed to our newsletter");
      }
      
      if (existingSubscriber.isActive && !existingSubscriber.isVerified) {
        // Resend verification email
        const verificationToken = existingSubscriber.generateVerificationToken();
        await existingSubscriber.save();
        
        // Send verification email
        await sendVerificationEmail(email, verificationToken);
        
        return successHandler(res, 200, "Verification email has been resent to your email address");
      }

      if (!existingSubscriber.isActive) {
        // Reactivate subscription
        await existingSubscriber.resubscribe();
        const verificationToken = existingSubscriber.generateVerificationToken();
        await existingSubscriber.save();
        
        // Send verification email
        await sendVerificationEmail(email, verificationToken);
        
        return successHandler(res, 200, "Welcome back! Please check your email to verify your subscription");
      }
    }

    // Create new subscriber
    const subscriber = new Newsletter({
      email,
      source: "website",
      metadata: {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
        referrer: req.get("Referer"),
      },
    });

    // Generate verification token
    const verificationToken = subscriber.generateVerificationToken();
    await subscriber.save();

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    successHandler(res, 201, "Thank you for subscribing! Please check your email to verify your subscription");
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    errorHandler(res, 500, "Failed to subscribe to newsletter. Please try again later.");
  }
};

// Verify Newsletter Subscription
const verifySubscription = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return errorHandler(res, 400, "Verification token is required");
    }

    const subscriber = await Newsletter.findOne({ verificationToken: token });

    if (!subscriber) {
      return errorHandler(res, 404, "Invalid or expired verification token");
    }

    await subscriber.verify();

    successHandler(res, 200, "Email successfully verified! You are now subscribed to our newsletter", {
      email: subscriber.email,
      subscribedAt: subscriber.subscribedAt,
    });
  } catch (error) {
    console.error("Newsletter verification error:", error);
    errorHandler(res, 500, "Failed to verify subscription. Please try again later.");
  }
};

// Unsubscribe from Newsletter
const unsubscribeNewsletter = async (req, res) => {
  try {
    const { email, token } = req.query;

    if (!email && !token) {
      return errorHandler(res, 400, "Email or unsubscribe token is required");
    }

    let subscriber;

    if (token) {
      subscriber = await Newsletter.findOne({ verificationToken: token });
    } else {
      subscriber = await Newsletter.findOne({ email });
    }

    if (!subscriber) {
      return errorHandler(res, 404, "Subscription not found");
    }

    if (!subscriber.isActive) {
      return errorHandler(res, 400, "Email is already unsubscribed");
    }

    await subscriber.unsubscribe();

    successHandler(res, 200, "Successfully unsubscribed from newsletter", {
      email: subscriber.email,
      unsubscribedAt: subscriber.unsubscribedAt,
    });
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error);
    errorHandler(res, 500, "Failed to unsubscribe. Please try again later.");
  }
};

// Get All Newsletter Subscribers (Admin only)
const getAllSubscribers = async (req, res) => {
  try {
    const { status, isVerified, page = 1, limit = 50, search } = req.query;

    const filter = {};
    
    if (status === "active") filter.isActive = true;
    if (status === "inactive") filter.isActive = false;
    if (isVerified !== undefined) filter.isVerified = isVerified === "true";
    
    if (search) {
      filter.email = { $regex: search, $options: "i" };
    }

    const skip = (page - 1) * limit;

    const subscribers = await Newsletter.find(filter)
      .sort({ subscribedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Newsletter.countDocuments(filter);

    const stats = {
      total: await Newsletter.countDocuments(),
      active: await Newsletter.countDocuments({ isActive: true, isVerified: true }),
      pending: await Newsletter.countDocuments({ isActive: true, isVerified: false }),
      unsubscribed: await Newsletter.countDocuments({ isActive: false }),
    };

    successHandler(res, 200, "Newsletter subscribers fetched successfully", {
      subscribers,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit),
      },
      stats,
    });
  } catch (error) {
    console.error("Get subscribers error:", error);
    errorHandler(res, 500, "Failed to fetch subscribers");
  }
};

// Update Subscriber Preferences (Admin only)
const updateSubscriberPreferences = async (req, res) => {
  try {
    const { id } = req.params;
    const { preferences } = req.body;

    const subscriber = await Newsletter.findById(id);

    if (!subscriber) {
      return errorHandler(res, 404, "Subscriber not found");
    }

    if (preferences) {
      subscriber.preferences = { ...subscriber.preferences, ...preferences };
    }

    await subscriber.save();

    successHandler(res, 200, "Subscriber preferences updated successfully", subscriber);
  } catch (error) {
    console.error("Update preferences error:", error);
    errorHandler(res, 500, "Failed to update preferences");
  }
};

// Delete Subscriber (Admin only)
const deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;

    const subscriber = await Newsletter.findByIdAndDelete(id);

    if (!subscriber) {
      return errorHandler(res, 404, "Subscriber not found");
    }

    successHandler(res, 200, "Subscriber deleted successfully");
  } catch (error) {
    console.error("Delete subscriber error:", error);
    errorHandler(res, 500, "Failed to delete subscriber");
  }
};

// Get Newsletter Statistics (Admin only)
const getNewsletterStats = async (req, res) => {
  try {
    const stats = {
      total: await Newsletter.countDocuments(),
      active: await Newsletter.countDocuments({ isActive: true, isVerified: true }),
      pending: await Newsletter.countDocuments({ isActive: true, isVerified: false }),
      unsubscribed: await Newsletter.countDocuments({ isActive: false }),
    };

    // Growth stats for last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    stats.recentSubscriptions = await Newsletter.countDocuments({
      subscribedAt: { $gte: thirtyDaysAgo },
      isVerified: true,
    });

    // Weekly breakdown
    const weeklyStats = await Newsletter.aggregate([
      {
        $match: {
          subscribedAt: { $gte: thirtyDaysAgo },
          isVerified: true,
        },
      },
      {
        $group: {
          _id: {
            week: { $week: "$subscribedAt" },
            year: { $year: "$subscribedAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.week": -1 } },
    ]);

    stats.weeklyGrowth = weeklyStats;

    successHandler(res, 200, "Newsletter statistics fetched successfully", stats);
  } catch (error) {
    console.error("Get stats error:", error);
    errorHandler(res, 500, "Failed to fetch statistics");
  }
};

// Helper function to send verification email
const sendVerificationEmail = async (email, token) => {
  try {
    const verificationLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/newsletter/verify/${token}`;
    
    const emailContent = {
      to: email,
      subject: "Verify Your Newsletter Subscription - Khuddam Learning",
      html: `
        <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #293c5d 0%, #4a5f8f 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Khuddam Learning!</h1>
          </div>
          
          <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #293c5d; margin-bottom: 20px;">Verify Your Email Address</h2>
            
            <p style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 25px;">
              Thank you for subscribing to our newsletter! Please click the button below to verify your email address and start receiving updates about:
            </p>
            
            <ul style="color: #666; line-height: 1.8; margin-bottom: 30px;">
              <li>📚 New course announcements</li>
              <li>📅 Class schedules and updates</li>
              <li>🎉 Educational events and activities</li>
              <li>🏆 Student achievements and results</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="background: linear-gradient(135deg, #293c5d 0%, #4a5f8f 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        font-size: 16px; 
                        display: inline-block;
                        box-shadow: 0 4px 15px rgba(41, 60, 93, 0.3);">
                Verify My Email
              </a>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 30px;">
              <p style="color: #666; font-size: 14px; margin: 0; text-align: center;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${verificationLink}" style="color: #293c5d; word-break: break-all;">${verificationLink}</a>
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                If you didn't subscribe to this newsletter, you can safely ignore this email.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    await sendEmail(emailContent);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};

export {
  subscribeNewsletter,
  verifySubscription,
  unsubscribeNewsletter,
  getAllSubscribers,
  updateSubscriberPreferences,
  deleteSubscriber,
  getNewsletterStats,
};