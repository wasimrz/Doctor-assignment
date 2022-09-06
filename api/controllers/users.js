const {
  errBuilder,
  isDef,
  isvalidEmail,
  successHandler,
  errHandler,
} = require("../helpers");
const Boom = require("@hapi/boom");
const { isEmpty, trim, capitalize } = require("lodash");
const { User } = require("../models");

exports.getUsers = async (req, res, next) => {
  try {
    let savedUsers = await User.find({}).lean();

    return successHandler(res, savedUsers, "User fetched successfully");
  } catch (error) {
    const resp = errBuilder(Boom.boomify(error));
    return next(resp);
  }
};
