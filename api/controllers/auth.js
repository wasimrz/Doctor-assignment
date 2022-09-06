const {
  errBuilder,
  isDef,
  isvalidEmail,
  successHandler,
  getFormattedMobile,
  generateJWTToken,
  callingCodeToAlpha2,
  generateBcryptHash,
  matchBcryptHash,
} = require("../helpers");
const Boom = require("@hapi/boom");
const { isEmpty, capitalize, trim } = require("lodash");
const jwt = require("jsonwebtoken");
const config = require("../../config/index");
const bcrypt = require("bcrypt");
const { isValidObjectId } = require("mongoose");
const { User } = require("../models");
const secret = config.jwtSecret;
const expiresIn = config.jwtExpiresIn;

exports.adminLogin = async (req, res, next) => {
  try {
    const userData = req.body.userDetails;

    if (!isDef(userData) || isEmpty(userData)) {
      throw Boom.badRequest("User data required");
    }

    if (isDef(userData.email) && isEmpty(userData.email)) {
      throw Boom.badRequest("Email is required");
    } else if (!isEmpty(userData.email) && !isvalidEmail(userData.email)) {
      throw Boom.badRequest("Email is wrong");
    }

    if (!isDef(userData.password)) {
      throw Boom.badRequest("password is required");
    }

    let userQuery = {
      email: trim(userData.email),
      allowedToLogin: true,
      admin: true,
    };

    //CHECK USER PRESENT OR NOT
    let user = await User.findOne(userQuery).lean();

    if (!isDef(user)) {
      let message = "User not found";
      throw Boom.badRequest(message);
    }

    if (!user?.password) {
      throw Boom.badRequest("Please register as admin");
    }

    const isValidPassword = matchBcryptHash(userData.password, user.password);

    if (!isValidPassword) {
      throw Boom.badRequest("Password is incorrect");
    }
    let payload = {
      _id: user?._id,
      tokenType: "login",
      role: "admin",
    };

    let token = generateJWTToken(payload, "365d");
    delete user["password"];
    return successHandler(
      res,
      { user: user, token },
      "User logged in successfully"
    );
  } catch (error) {
    const resp = errBuilder(Boom.boomify(error));
    return next(resp);
  }
};
