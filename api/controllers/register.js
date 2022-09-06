const {
  errBuilder,
  isDef,
  isvalidEmail,
  successHandler,
  errHandler,
  generateBcryptHash,
  callingCodeToAlpha2,
  generateJWTToken,
  leanObject,
  passwordTestHandler,
} = require("../helpers");
const bcrypt = require("bcrypt");
const Boom = require("@hapi/boom");
const { getFormattedMobile } = require("../helpers");
const { isEmpty, trim, capitalize } = require("lodash");
const { User } = require("../models");
const { isValidObjectId } = require("mongoose");

exports.createUsers = async (req, res, next) => {
  try {
    let user = req.body.userDetails;

    if (!isDef(user) || isEmpty(user)) {
      throw Boom.badRequest("Users data required");
    }

    if (!isDef(user.name) || isEmpty(trim(user.name))) {
      throw Boom.badRequest("Name required");
    }

    if (!isDef(user.city) || isEmpty(trim(user.city))) {
      throw Boom.badRequest("City required");
    }

    if (!isDef(user.age)) {
      throw Boom.badRequest("Age required");
    }
    if (!isDef(user.qualification) || isEmpty(trim(user.qualification))) {
      throw Boom.badRequest("Qualification required");
    }
    if (!isDef(user?.email) || isEmpty(trim(user?.email))) {
      throw Boom.badRequest("Email is required");
    } else if (!isEmpty(user.email) && !isvalidEmail(user.email)) {
      throw Boom.badRequest("Email is wrong");
    }

    if (!isDef(user.mobile)) {
      throw Boom.badRequest("Mobile required");
    }

    if (!isDef(user.countryCode)) {
      throw Boom.badRequest("Country code required");
    }
    let regionCode = callingCodeToAlpha2(user.countryCode);

    if (!isDef(regionCode)) {
      throw Boom.badRequest("Country code wrong");
    }

    let formattedMobile = getFormattedMobile(user.mobile, regionCode);

    if (!isDef(formattedMobile) || !formattedMobile.valid) {
      throw Boom.badRequest("Mobile number and country code does not match");
    }

    //Check email already present or not
    let isEmailPresent = await User.findOne({
      email: trim(user.email),
    }).lean();

    if (isDef(isEmailPresent) || !isEmpty(isEmailPresent)) {
      throw Boom.badRequest("Email is already taken");
    }

    let isMobilePresent = await User.findOne({
      mobile: formattedMobile.mobile,
    }).lean();

    if (isDef(isMobilePresent) || !isEmpty(isMobilePresent)) {
      throw Boom.badRequest("Mobile is already taken");
    }

    let userObject = {
      email: trim(user.email),
      name: capitalize(user.name),
      mobile: trim(user.mobile),
      qualification: user.qualification,
      age: user.age,
      countryCode: user.countryCode,
      city: user.city,
    };

    let savedUser = await new User(userObject).save();

    return successHandler(res, savedUser, "User added successfully");
  } catch (error) {
    const resp = errBuilder(Boom.boomify(error));
    return next(resp);
  }
};

exports.createAdmin = async (req, res, next) => {
  try {
    let user = req.body.userDetails;

    if (!isDef(user) || isEmpty(user)) {
      throw Boom.badRequest("Users data required");
    }

    if (!isDef(user.name) || isEmpty(trim(user.name))) {
      throw Boom.badRequest("Name required");
    }
    if (!isDef(user?.email) || isEmpty(trim(user?.email))) {
      throw Boom.badRequest("Email is required");
    } else if (!isEmpty(user.email) && !isvalidEmail(user.email)) {
      throw Boom.badRequest("Email is wrong");
    }

    if (!isDef(user.mobile)) {
      throw Boom.badRequest("Mobile required");
    }

    if (!isDef(user.countryCode)) {
      throw Boom.badRequest("Country code required");
    }

    if (!isDef(user.password) || isEmpty(user.password)) {
      throw Boom.badRequest("Password is required");
    }

    if (!isDef(user.confirmPassword) || isEmpty(user.confirmPassword)) {
      throw Boom.badRequest("Confirm password is required");
    }
    let regionCode = callingCodeToAlpha2(user.countryCode);

    if (!isDef(regionCode)) {
      throw Boom.badRequest("Country code wrong");
    }

    let formattedMobile = getFormattedMobile(user.mobile, regionCode);

    if (!isDef(formattedMobile) || !formattedMobile.valid) {
      throw Boom.badRequest("Mobile number and country code does not match");
    }

    //Check email already present or not
    let isEmailPresent = await User.findOne({
      email: trim(user.email),
    }).lean();

    if (isDef(isEmailPresent) || !isEmpty(isEmailPresent)) {
      throw Boom.badRequest("Email is already taken");
    }

    let isMobilePresent = await User.findOne({
      mobile: formattedMobile.mobile,
    }).lean();

    if (isDef(isMobilePresent) || !isEmpty(isMobilePresent)) {
      throw Boom.badRequest("Mobile is already taken");
    }

    if (isDef(user.password) && isDef(user.confirmPassword)) {
      password = user.password.replace(/ /g, "");
      confirmPassword = user.confirmPassword.replace(/ /g, "");

      if (isDef(user.confirmPassword) && !isEmpty(user.confirmPassword)) {
        if (password != confirmPassword) {
          throw Boom.badRequest("Password and confirm password do not match");
        }
      }
      await passwordTestHandler(user.password);
    } else {
      throw Boom.badRequest("Enter correct passwords");
    }

    const hashedPassword = generateBcryptHash(user.password, 12);
    if (!hashedPassword) {
      throw Boom.badRequest("something went wrong");
    }

    let userObject = {
      email: trim(user.email),
      name: capitalize(user.name),
      mobile: trim(user.mobile),
      countryCode: user.countryCode,
      password: hashedPassword,
      admin: true,
      allowedToLogin: true,
    };

    let savedAdmin = await new User(userObject).save();

    return successHandler(
      res,
      { admin: savedAdmin },
      "Admin created successfully"
    );
  } catch (error) {
    const resp = errBuilder(Boom.boomify(error));
    return next(resp);
  }
};
