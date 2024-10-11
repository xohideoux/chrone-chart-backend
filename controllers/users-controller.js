const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { where } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const MailService = require('../handlers/mail-service');
const ApiError = require('../handlers/api-error');
const { User, UserRole } = require('../models/');
const { USER_CODE } = require('../constants/');


const generateJwt = (id, email, role) => {
  return jwt.sign(
    { id, email, role },
    process.env.JWT_KEY,
    { expiresIn: '24h' }
  );
}

class UserController {
  async getAll(req, res, next) {

    try {
      // Fetch users with specified attributes
      const users = await User.findAll({
        attributes: ['id', 'email'],
      });
      return res.json(users);

    } catch (error) {
      console.log(error);
      return next(ApiError.internal("Error receiving users"));
    }
  }

  async register(req, res, next) {

    let { email, password, role = USER_CODE } = req.body;
    if (!email || !password) {
      return next(ApiError.badRequest('Email and password are required'));
    }

    // Check if email is already registered
    const candidate = await User.findOne({ where: { email } });
    if (candidate) {
      return next(ApiError.badRequest('Email already registered'));
    }

    // Hash the password and create an activation token
    const hashPassword = await bcrypt.hash(password, 6);
    const activationToken = uuidv4();
    await User.create({ email, password: hashPassword, role, activationToken, isActivated: false });

    // Create activation link
    const activationLink = `${process.env.API_URL}/api/users/activate/${activationToken}`;

    // Send activation email
    await MailService.sendActivationMail(email, activationLink);
    return res.json({ message: 'Registration successful! Please check your email to activate your account.' });

  }

  async activate(req, res, next) {
    const { token } = req.params; // Extract token from request parameters

    // Find user by activation token
    const user = await User.findOne({ where: { activationToken: token } });
    if (!user) {
      return next(ApiError.badRequest('Invalid activation token'));
    }

     // Activate user
    user.activationToken = null;
    user.isActivated = true;
    await user.save();

    return res.json({ message: 'Account activated successfully!' });
  }

  async login(req, res, next) {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(ApiError.badRequest('Email and password are required'));
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return next(ApiError.forbidden('Email not found'));
    }
    if (!user.isActivated) {
      return next(ApiError.forbidden('Account not activated. Please check your email for activation instructions.'));
    }

    // Compare password
    let comparePassword = bcrypt.compareSync(password, user.password);
    if (!comparePassword) {
      return next(ApiError.forbidden('Incorrect password'));
    }

    // Return JWT token
    const token = generateJwt(user.id, user.email, user.role);

    return res.json({ token });
  }

  async checkAuth(req, res, next) {
    const user = await User.findByPk(req.user.id);

    // Check if account is activated
    if (!user.isActivated) {
      return next(ApiError.forbidden('Account not activated. Please check your email for activation instructions.'));
    }

    // Return JWT token
    const token = generateJwt(req.user.id, req.user.email, req.user.role);
    return res.json({ token })
  }

  async createRole(req, res, next) {
    const title = req.body.label;

    if (!title) {
      return next(ApiError.badRequest('Title is required'));
    }

    try {
      const role = await UserRole.create(req.body);

      return res.json({ role });
    } catch (err) {
      return next(ApiError.internal('Error creating role'));
    }
  }
}

module.exports = new UserController();