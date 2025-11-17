import EmailMatter from "../Models/emailMatter.js";
import { successHandler, errorHandler } from "../Utlis/ResponseHandler.js";

// Create Email Matter
const createEmailMatter = async (req, res) => {
  try {
    const { name, subject, body, type, variables } = req.body;

    // Check if email matter with same name already exists
    const existingMatter = await EmailMatter.findOne({ name });
    if (existingMatter) {
      return errorHandler(res, 400, "Email matter with this name already exists");
    }

    const emailMatter = new EmailMatter({
      name,
      subject,
      body,
      type,
      variables: variables || [],
      created_by: req.user.id,
    });

    await emailMatter.save();
    successHandler(res, 201, "Email matter created successfully", emailMatter);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Get All Email Matters with filters
const getAllEmailMatters = async (req, res) => {
  try {
    const { type, isActive } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const emailMatters = await EmailMatter.find(filter)
      .populate("created_by", "name email")
      .sort({ createdAt: -1 });

    successHandler(res, 200, "Email matters fetched successfully", emailMatters, emailMatters.length);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Get Email Matter by ID
const getEmailMatterById = async (req, res) => {
  try {
    const { id } = req.params;

    const emailMatter = await EmailMatter.findById(id).populate("created_by", "name email");
    if (!emailMatter) {
      return errorHandler(res, 404, "Email matter not found");
    }

    successHandler(res, 200, "Email matter fetched successfully", emailMatter);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Update Email Matter
const updateEmailMatter = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subject, body, type, variables } = req.body;

    const emailMatter = await EmailMatter.findById(id);
    if (!emailMatter) {
      return errorHandler(res, 404, "Email matter not found");
    }

    // Check if new name conflicts with existing matter
    if (name && name !== emailMatter.name) {
      const existingMatter = await EmailMatter.findOne({ name });
      if (existingMatter) {
        return errorHandler(res, 400, "Email matter with this name already exists");
      }
    }

    // Update fields
    if (name) emailMatter.name = name;
    if (subject) emailMatter.subject = subject;
    if (body) emailMatter.body = body;
    if (type) emailMatter.type = type;
    if (variables) emailMatter.variables = variables;

    await emailMatter.save();
    successHandler(res, 200, "Email matter updated successfully", emailMatter);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Delete Email Matter
const deleteEmailMatter = async (req, res) => {
  try {
    const { id } = req.params;

    const emailMatter = await EmailMatter.findByIdAndDelete(id);
    if (!emailMatter) {
      return errorHandler(res, 404, "Email matter not found");
    }

    successHandler(res, 200, "Email matter deleted successfully", null);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Toggle Active Status
const toggleActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const emailMatter = await EmailMatter.findById(id);
    if (!emailMatter) {
      return errorHandler(res, 404, "Email matter not found");
    }

    emailMatter.isActive = !emailMatter.isActive;
    await emailMatter.save();

    successHandler(res, 200, `Email matter ${emailMatter.isActive ? "activated" : "deactivated"} successfully`, emailMatter);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

// Get Email Matters by Type
const getEmailMattersByType = async (req, res) => {
  try {
    const { type } = req.params;

    const emailMatters = await EmailMatter.find({ type, isActive: true })
      .sort({ createdAt: -1 });

    successHandler(res, 200, "Email matters fetched successfully", emailMatters, emailMatters.length);
  } catch (error) {
    errorHandler(res, 500, error.message);
  }
};

export {
  createEmailMatter,
  getAllEmailMatters,
  getEmailMatterById,
  updateEmailMatter,
  deleteEmailMatter,
  toggleActiveStatus,
  getEmailMattersByType,
};
