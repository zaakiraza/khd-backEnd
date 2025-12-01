import User from "../Models/user.js";
import { successHandler, errorHandler } from "../Utlis/ResponseHandler.js";
import { sendEmail } from "../Utlis/nodeMailer.js";
import { getEmailTemplate } from "../Utlis/emailTemplateHelper.js";
import { sendWelcomeEmail } from "../Utlis/notificationService.js";
import jwt from "jsonwebtoken";
import { hash, compare } from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

const signup = async (req, res) => {
  try {
    const {
      personal_info,
      guardian_info,
      academic_progress,
      previous_madrassa,
      bank_info,
    } = req.body;

    if (!personal_info || !academic_progress || !guardian_info) {
      return errorHandler(
        res,
        400,
        "Personal info, academic progress, guardian info and bank info are required"
      );
    }
    if (!previous_madrassa) {
      previous_madrassa.name = "";
      previous_madrassa.topic = "";
    }

    const {
      first_name,
      last_name,
      father_name,
      gender,
      whatsapp_no,
      dob,
      age,
      CNIC,
      alternative_no,
      email,
      address,
      city,
      country,
      img_URL,
      doc_img,
      enrolled_year,
      marj_e_taqleed,
    } = personal_info;

    if (
      !first_name ||
      !last_name ||
      !father_name ||
      !gender ||
      !whatsapp_no ||
      !alternative_no ||
      !dob ||
      !age ||
      !CNIC ||
      !email ||
      !address ||
      !city ||
      !country ||
      !img_URL ||
      !doc_img ||
      !enrolled_year ||
      !marj_e_taqleed
    ) {
      return errorHandler(res, 400, "All personal info fields are required");
    }

    if (!email || email === null) {
      return errorHandler(res, 400, "Email is required");
    }

    const userData = await User.findOne({ "personal_info.email": email });
    if (userData) {
      return errorHandler(res, 400, "User with this email already exists");
    }

    const userCNIC = await User.findOne({ "personal_info.CNIC": CNIC });
    if (userCNIC) {
      return errorHandler(res, 400, "User with this CNIC already exists");
    }
    // if (age > 19 || age < 9) {
    //   return errorHandler(res, 400, "Age is not according to our school");
    // }

    const { academic_class, institute_name, inProgress, result } =
      academic_progress;
    if (!academic_class || !institute_name || inProgress == undefined) {
      return errorHandler(
        res,
        400,
        "All academic progress fields are required"
      );
    }

    if (
      !guardian_info.name ||
      !guardian_info.relationship ||
      !guardian_info.email ||
      !guardian_info.whatsapp_no ||
      !guardian_info.address ||
      !guardian_info.CNIC
    ) {
      return errorHandler(res, 404, "All Guardian Info fields are required");
    }

    if (personal_info.CNIC == guardian_info.CNIC) {
      return errorHandler(
        res,
        400,
        "Guardian CNIC can't be same as student CNIC"
      );
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiresAt = new Date(Date.now() + 1 * 60 * 1000);
    personal_info.otp = otp;
    personal_info.otpExpiresAt = otpExpiresAt;
    const passCNIC = CNIC.toString();
    personal_info.password = await hash(passCNIC, 12);

    let userDetails = new User({
      personal_info,
      academic_progress,
      guardian_info,
      bank_info,
      previous_madrassa,
    });
    const savedUser = await userDetails.save();

    // Get OTP email template
    const otpTemplate = await getEmailTemplate('otp', {
      name: first_name,
      otp: otp
    });

    if (otpTemplate) {
      await sendEmail({
        to: email,
        subject: otpTemplate.subject,
        html: otpTemplate.body
      });
    } else {
      // Fallback to plain text if template not found
      await sendEmail({
        to: email,
        subject: "Account verification Email",
        text: `Dear ${first_name},\n\nThank you for registering at Khuddam Learning online Classes. Your registration is successfully done. Your OTP is ${otp}`
      });
    }

    const token = jwt.sign(
      { userId: userDetails._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return successHandler(res, 201, "User registered. OTP sent to email.", {
      userId: userDetails._id,
      email: email,
      token,
    });
  } catch (error) {
    console.error(error.message);
    return errorHandler(res, 400, error.message);
  }
};

// after login
const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user;

    if (!otp) {
      return errorHandler(res, 400, "OTP is required");
    }

    const userDetail = await User.findById(userId.userId);
    if (!userDetail) {
      return errorHandler(res, 404, "User not found");
    }

    if (
      !userDetail.personal_info.otp ||
      !userDetail.personal_info.otpExpiresAt
    ) {
      return errorHandler(res, 400, "No OTP found. Please register again.");
    }

    if (userDetail.personal_info.otpExpiresAt < Date.now()) {
      return errorHandler(res, 400, "OTP has expired.");
    }

    if (otp != userDetail.personal_info.otp) {
      return errorHandler(res, 400, "Invalid OTP");
    }

    userDetail.personal_info.verified = true;
    userDetail.personal_info.otp = undefined;
    userDetail.personal_info.otpExpiresAt = undefined;
    await userDetail.save();

    // Send welcome email to newly verified student
    try {
      await sendWelcomeEmail(userDetail._id);
    } catch (welcomeEmailError) {
      console.error("Failed to send welcome email:", welcomeEmailError);
      // Don't fail verification if welcome email fails
    }

    return successHandler(res, 200, "OTP verified successfully", {
      userId: userDetail._id,
      verified: userDetail.personal_info.verified,
    });
  } catch (error) {
    return errorHandler(res, 500, "Internal server error", error.message);
  }
};

const resendOtp = async (req, res) => {
  const userId = req.user;
  const userDetail = await User.findById(userId.userId);
  if (!userDetail) {
    return errorHandler(res, 404, "User not found");
  }

  if (userDetail.personal_info.verified) {
    return errorHandler(res, 400, "User already verified");
  }

  if (userDetail.personal_info.otpExpiresAt > Date.now()) {
    return errorHandler(res, 400, "Old OTP is not expired yet");
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const otpExpiresAt = new Date(Date.now() + 1 * 60 * 1000);

  userDetail.personal_info.otp = otp;
  userDetail.personal_info.otpExpiresAt = otpExpiresAt;
  await userDetail.save();

  // Get OTP email template
  const otpTemplate = await getEmailTemplate('otp', {
    name: userDetail.personal_info.first_name,
    otp: otp
  });

  if (otpTemplate) {
    await sendEmail({
      to: userDetail.personal_info.email,
      subject: otpTemplate.subject,
      html: otpTemplate.body
    });
  } else {
    // Fallback to plain text if template not found
    await sendEmail({
      to: userDetail.personal_info.email,
      subject: "Request for resend OTP",
      text: `Dear ${userDetail.personal_info.first_name},\nYour OTP code is: ${otp}. It will expire in 1 minute.`
    });
  }
  return successHandler(res, 200, "verification code send successfully");
};

// const setPassword = async (req, res) => {
//   const { password } = req.body;
//   const userId = req.user;
//   if (!password) {
//     return errorHandler(res, 400, "Password is required");
//   }
//   const userDetail = await User.findById(userId.userId);
//   if (!userDetail) {
//     return errorHandler(res, 404, "User not found");
//   }
//   // if (userDetail.personal_info.verified) {
//   //     return errorHandler(res, 400, "First verify your account");
//   // }
//   if (userDetail.personal_info.password) {
//     return errorHandler(res, 400, "Password already set");
//   }
//   userDetail.personal_info.password = await hash(password, 12);
//   await userDetail.save();
//   return successHandler(res, 200, "Password set successfully");
// };

// before login
const forgotPasswordOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return errorHandler(res, 404, "Email is are missing");
  }

  const userDetails = await User.findOne({ "personal_info.email": email });
  if (!userDetails) {
    return errorHandler(res, 400, "Invalid Email");
  }

  if (userDetails.personal_info.verified) {
    return errorHandler(res, 400, "User already verified");
  }
  if (userDetails.personal_info.otpExpiresAt > Date.now()) {
    return errorHandler(res, 400, "Old OTP is not expired yet");
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const otpExpiresAt = new Date(Date.now() + 1 * 60 * 1000);

  userDetails.personal_info.otp = otp;
  userDetails.personal_info.otpExpiresAt = otpExpiresAt;
  userDetails.personal_info.verified = false;
  await userDetails.save();

  const data = {
    email: email,
    otpExpiresAt: otpExpiresAt,
  };

  // Get OTP email template
  const otpTemplate = await getEmailTemplate('otp', {
    name: userDetails.userName,
    otp: otp
  });

  if (otpTemplate) {
    await sendEmail({
      to: email,
      subject: otpTemplate.subject,
      html: otpTemplate.body
    });
  } else {
    // Fallback to plain text if template not found
    await sendEmail({
      to: email,
      subject: "Your Email Verification Code",
      text: `Dear ${userDetails.userName}, \n Your OTP code is: ${otp}. It will expire in 1 minute.`
    });
  }

  return successHandler(
    res,
    200,
    "Email verification code has been sent to your email",
    data
  );
};

const verifyChangePasswordOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return errorHandler(res, 404, "Feilds are missing");
  }

  const userDetails = await User.findOne({ "personal_info.email": email });
  if (!userDetails) {
    return errorHandler(res, 400, "Invalid Email");
  }

  if (otp != userDetails.personal_info.otp) {
    return errorHandler(res, 400, "Invalid OTP");
  }

  if (Date.now() >= userDetails.personal_info.otpExpiresAt) {
    return errorHandler(res, 400, "OTP expires");
  }

  userDetails.personal_info.otp = undefined;
  userDetails.personal_info.otpExpiresAt = undefined;
  userDetails.personal_info.verified = true;
  await userDetails.save();
  return successHandler(res, 200, "Verified successfully");
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return errorHandler(res, 404, "Email is missing");
  }

  const userDetail = await User.findOne({ "personal_info.email": email });
  if (!userDetail) {
    return errorHandler(res, 404, "User not found");
  }

  const newPassword = Math.floor(100000 + Math.random() * 900000).toString();
  userDetail.personal_info.password = await hash(newPassword, 12);
  await userDetail.save();

  // Get password reset email template
  const passwordTemplate = await getEmailTemplate('custom', {
    userName: userDetail.userName,
    newPassword: newPassword
  });

  if (passwordTemplate) {
    await sendEmail({
      to: userDetail.personal_info.email,
      subject: passwordTemplate.subject,
      html: passwordTemplate.body
    });
  } else {
    // Fallback to plain text if template not found
    await sendEmail({
      to: userDetail.personal_info.email,
      subject: "Forget password request",
      text: `Dear ${userDetail.userName}, \n Your new password is ${newPassword}`
    });
  }
  return successHandler(
    res,
    200,
    "Your new password has been send to your mail"
  );
};

// After Login
const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user;
  if (!oldPassword || !newPassword) {
    return errorHandler(res, 400, "All fields are required");
  }

  const userDetail = await User.findById(userId.userId);
  if (!userDetail) {
    return errorHandler(res, 400, "Invalid user");
  }

  if (oldPassword == newPassword) {
    return errorHandler(res, 400, "new password can't same as new Password");
  }

  const isPasswordMatch = await compare(
    oldPassword,
    userDetail.personal_info.password
  );
  if (!isPasswordMatch) {
    return errorHandler(res, 400, "Invalid old password");
  }

  userDetail.personal_info.password = await hash(newPassword, 12);
  await userDetail.save();

  return successHandler(res, 200, "password successfully changed");
};

const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  const userDetail = await User.findOne({ "personal_info.email": email });
  if (!userDetail) {
    return errorHandler(res, 400, "Access Denied");
  }

  const isPasswordMatch = await compare(
    password,
    userDetail.personal_info.password
  );
  if (!isPasswordMatch) {
    return errorHandler(res, 400, "Invalid email or password");
  }

  if (!userDetail.personal_info.isAdmin) {
    return errorHandler(res, 400, "not allowed");
  }

  const token = jwt.sign({ userId: userDetail._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_admin_EXPIRES_IN,
  });
  return successHandler(res, 200, "login sccessfully", token);
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return errorHandler(res, 400, "Email and password are required");
  }
  const userDetail = await User.findOne({ "personal_info.email": email });

  if (!userDetail) {
    return errorHandler(res, 400, "Invalid email or password");
  }

  const isPasswordMatch = await compare(
    password,
    userDetail.personal_info.password
  );
  if (!isPasswordMatch) {
    return errorHandler(res, 400, "Invalid email or password");
  }

  const token = jwt.sign({ userId: userDetail._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return successHandler(res, 201, "User login successfully.", token);
};

export default {
  signup,
  verifyOtp,
  resendOtp,
  // setPassword,
  forgotPasswordOtp,
  verifyChangePasswordOtp,
  forgotPassword,
  changePassword,
  adminLogin,
  loginUser,
};
