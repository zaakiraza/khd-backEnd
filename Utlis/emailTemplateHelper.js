import EmailMatter from "../Models/emailMatter.js";

/**
 * Get email template by type and replace variables
 * @param {string} type - Template type (otp, welcome, custom, etc.)
 * @param {Object} variables - Variables to replace in the template
 * @returns {Object} - { subject, body } or null if template not found
 */
export const getEmailTemplate = async (type, variables = {}) => {
  try {
    const template = await EmailMatter.findOne({ type, isActive: true });
    
    if (!template) {
      console.log(`Email template with type '${type}' not found`);
      return null;
    }

    let { subject, body } = template;

    // Replace variables in both subject and body
    Object.keys(variables).forEach(key => {
      const value = variables[key];
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, value);
      body = body.replace(regex, value);
    });

    return {
      subject,
      body,
      templateName: template.name
    };
  } catch (error) {
    console.error('Error fetching email template:', error);
    return null;
  }
};

/**
 * Get email template by name and replace variables
 * @param {string} name - Template name
 * @param {Object} variables - Variables to replace in the template
 * @returns {Object} - { subject, body } or null if template not found
 */
export const getEmailTemplateByName = async (name, variables = {}) => {
  try {
    const template = await EmailMatter.findOne({ name, isActive: true });
    
    if (!template) {
      console.log(`Email template with name '${name}' not found`);
      return null;
    }

    let { subject, body } = template;

    // Replace variables in both subject and body
    Object.keys(variables).forEach(key => {
      const value = variables[key];
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, value);
      body = body.replace(regex, value);
    });

    return {
      subject,
      body,
      templateName: template.name,
      type: template.type
    };
  } catch (error) {
    console.error('Error fetching email template:', error);
    return null;
  }
};

/**
 * List all active email templates
 * @returns {Array} - List of templates
 */
export const getAllActiveTemplates = async () => {
  try {
    const templates = await EmailMatter.find({ isActive: true }).select('name type subject variables');
    return templates;
  } catch (error) {
    console.error('Error fetching templates:', error);
    return [];
  }
};

export default {
  getEmailTemplate,
  getEmailTemplateByName,
  getAllActiveTemplates
};