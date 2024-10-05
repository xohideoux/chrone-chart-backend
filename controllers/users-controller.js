const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { where } = require('sequelize');
const ApiError = require('../handlers/api-error');
const { User } = require('../models/');
const { USER_CODE } = require('../constants/');


const generateJwt = (id, email, role) => {
  return jwt.sign(
    { id, email, role },
    process.env.JWT_KEY,
    { expiresIn: '24h' }
  );
}

class UserController {
  async register(req, res, next) {
    let { email, password, role = USER_CODE } = req.body;
    if (!email || !password) {
      return next(ApiError.badRequest('Email and password are required'));
    }

    const candidate = await User.findOne({ where: { email } });
    if (candidate) {
      return next(ApiError.badRequest('Email already registered'));
    }

    const hashPassword = await bcrypt.hash(password, 6);
    const user = await User.create({ email, password: hashPassword, role });
    const token = generateJwt(user.id, user.email, user.role);

    return res.json({ token });
  }

  async login(req, res, next) {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(ApiError.badRequest('Email and password are required'));
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return next(ApiError.forbidden('Email not found'));
    }

    let comparePassword = bcrypt.compareSync(password, user.password);
    if (!comparePassword) {
      return next(ApiError.forbidden('Incorrect password'));
    }

    const token = generateJwt(user.id, user.email, user.role);

    return res.json({ token });
  }

  async checkAuth(req, res, next) {
    const token = generateJwt(req.user.id, req.user.email, req.user.role);

    return res.json({ token })
  }

  async getAll(req, res) {

  }

  async getOne(req, res) {

  }
}

module.exports = new UserController();