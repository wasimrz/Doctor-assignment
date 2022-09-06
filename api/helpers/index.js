const Boom = require("@hapi/boom");
const jtw = require("jsonwebtoken");
const config = require("../../config/index");
const { omit, isNull, isUndefined, isEmpty } = require("lodash");
const countryCodes = require("country-codes-list");
const PhoneUtil = require("google-libphonenumber");
const pnf = require("google-libphonenumber");
const phoneUtil = PhoneUtil.PhoneNumberUtil.getInstance();
const PNF = pnf.PhoneNumberFormat;
const bcrypt = require("bcrypt");
const { isValidObjectId } = require("mongoose");

const httpResp = (status, message, code, data, metadata) => {
  const response = {
    status: status,
    message: message,
    code: code,
    statusCode: code,
    data: data,
  };
  if (isDef(metadata)) {
    response.metadata = metadata;
  }
  return response;
};

const isDef = (param) => {
  if (isNull(param) || isUndefined(param)) {
    return false;
  } else {
    return true;
  }
};

const errBuilder = (err) => {
  let final_error = err;

  if (err.isServer) {
    // log the error...
    // probably you don't want to log unauthorized access
    // or do you?
  }

  // Restructuring error data
  // If the error belongs to boom error (Check boom module: https://www.npmjs.com/package/boom)
  if (err.isBoom) {
    console.log("Boom old err");
    console.log(err);
    // err.output.statusCode = 400;
    err.output.payload.status = false;
    err.output.payload.code = err.output.statusCode;
    if (isDef(err.data)) {
      err.output.payload.data = err.data;
    }
    err.reformat();
    console.log("NEW err");
    console.log(err);
    final_error = err.output.payload;
    if (isDef(err.message) && final_error.statusCode == 500) {
      final_error.message = err.message;
    }

    // return res.status(err.output.statusCode).send(err.output.payload);
  } else {
    // If the error are other errors
    err.status = false;
    err.code = err.statusCode;
    if (!isDef(err.message) && isDef(err.type)) {
      err.message = err.type;
    }
  }

  return final_error;
};

const errHandler =
  ((error = "some err"),
  (res) => {
    const resp = httpResp(false, "There is some error occured", 500, error);
    return res.status(resp.code).send(resp);
  });

const generateJWTToken = (payload, exp) => {
  try {
    if (!isDef(payload) || isEmpty(payload)) {
      return null;
    }
    console.log({
      config,
    });
    let tokenExp = exp;

    if (!isDef(tokenExp)) {
      tokenExp = config.jwtExpiresIn;
    }
    return jtw.sign(payload, config.jwtSecret, { expiresIn: tokenExp });
  } catch (error) {
    throw Boom.boomify(error);
  }
};

// Generating the bcrypt hash
const generateBcryptHash = (pass) => {
  return bcrypt.hashSync(pass, 10);
};

// Matching the bcrypt hash
const matchBcryptHash = (pass, hash) => {
  return bcrypt.compareSync(pass, hash);
};

const successHandler = (res, data, message, metadata) => {
  message = message || "Operation successful";
  let resp;
  if (isDef(metadata)) {
    resp = httpResp(true, message, 200, data, metadata);
  } else {
    resp = httpResp(true, message, 200, data);
  }

  return res.status(resp.code).send(resp);
};

const isLiteralObject = (a) => {
  return !!a && a.constructor === Object;
};

// Converts all MongoIDs in the object to the plain string
const leanObject = (object) => {
  if (Array.isArray(object)) {
    let array = object;
    array = array.map((obj) => {
      return leanObject(obj);
    });
    return array;
  }
  for (const key in object) {
    if (Object.hasOwnProperty.call(object, key)) {
      if (isDef(object[key])) {
        if (isValidObjectId(object[key]) && !isLiteralObject(object[key])) {
          object[key] = object[key].toString();
        }
        if (typeof object[key] == "object" && isLiteralObject(object[key])) {
          object[key] = leanObject(object[key]);
        }
      } else {
        object = omit(object, [key]);
      }
    }
  }
  return object;
};

const addDaysToDate = (date, days) => {
  return new Date(new Date(date).getTime() + days * 24 * 60 * 60 * 1000);
};

const isvalidEmail = (email) => {
  try {
    let tester =
      /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

    if (!email) return false;

    let emailParts = email.split("@");

    if (emailParts.length !== 2) return false;

    let account = emailParts[0];
    let address = emailParts[1];

    if (account.length > 64) return false;
    else if (address.length > 255) return false;

    let domainParts = address.split(".");
    if (
      domainParts.some(function (part) {
        return part.length > 63;
      })
    )
      return false;

    if (!tester.test(email)) return false;

    return true;
  } catch (error) {
    return false;
    console.log({ error });
    // throw Boom.boomify(error)
  }
};

const callingCodeToAlpha2 = (countryCallingCode) => {
  countryCallingCode = parseInt(countryCallingCode);
  if (!countryCallingCode || isNaN(countryCallingCode)) {
    return;
  }
  let country = countryCodes.findOne(
    "countryCallingCode",
    countryCallingCode.toString()
  );
  return country ? country.countryCode : null;
};
const n = phoneUtil.parseAndKeepRawInput("202-456-1414", "US");

// countryCode e.g. IN, AE
// Returns e.g. 91, 971 etc.
const alpha2ToCallingCode = (countryCode) => {
  console.log({
    countryCode,
  });
  let country = countryCodes.findOne("countryCode", countryCode);
  return country ? country.countryCallingCode : null;
};

const getFormattedMobile = (mobileRaw, regionCode) => {
  try {
    if (!mobileRaw) {
      // throw Boom.notFound("Mobile number is required!");
      let formattedMobileObj = {
        mobileRaw,
        valid: false,
      };
      return formattedMobileObj;
    }
    if (!regionCode) {
      // throw Boom.notFound("Country Region Code is required!");
      let formattedMobileObj = {
        mobileRaw,
        valid: false,
      };
      return formattedMobileObj;
    }

    // if regionCode is 91 then Converting 91 to 'IN'
    if (isDef(regionCode) && !isNaN(parseInt(regionCode))) {
      regionCode = callingCodeToAlpha2(regionCode);
    }
    let formattedMobileObj = {
      mobileRaw,
      valid: false,
    };

    let mobileNumber = phoneUtil.parseAndKeepRawInput(
      mobileRaw.toString(),
      regionCode
    );
    if (mobileNumber) {
      let isMobileNumberValidForRegion = phoneUtil.isValidNumberForRegion(
        mobileNumber,
        regionCode
      );
      console.log({
        isMobileNumberValidForRegion,
      });
      if (isMobileNumberValidForRegion) {
        formattedMobileObj.countryCode = mobileNumber.getCountryCode();
        formattedMobileObj.regionCode =
          phoneUtil.getRegionCodeForNumber(mobileNumber);
        formattedMobileObj.mobile = mobileNumber.getNationalNumber();
        formattedMobileObj.pnf = phoneUtil.format(mobileNumber, PNF.E164);
        console.log({
          formattedMobileObj,
        });

        formattedMobileObj = { ...formattedMobileObj, valid: true };
      }
    }
    return formattedMobileObj;
  } catch (error) {
    console.log("error");
    console.log(error);
  }
};

const passwordTestHandler = async (password) => {
  let digit = new RegExp("(?=.*[0-9])");
  let lowerCase = new RegExp("(?=.*[a-z])");
  let upperCase = new RegExp("(?=.*[A-Z])");
  let specialChracter = new RegExp("(?=.*[!@#$%^&*])");
  let passwordLength = 6;

  if (!isDef(password) || isEmpty(password)) {
    throw Boom.badRequest("Password required");
  }

  if (!digit.test(password)) {
    throw Boom.badRequest("Password must contain one number");
  } else if (!lowerCase.test(password)) {
    throw Boom.badRequest("Password must contain one lower case letter");
  } else if (!upperCase.test(password)) {
    throw Boom.badRequest("Password must contain one upper case letter");
    // } else if (!specialChracter.test(password)) {
    //   throw Boom.badRequest("Password must contain one special character");
    // } else if (password.length < 6) {
  } else if (password.length < 6) {
    throw Boom.badRequest("Password must be six character long");
  } else {
    return true;
  }
};

module.exports = {
  httpResp,
  isDef,
  errBuilder,
  errHandler,
  successHandler,
  leanObject,
  addDaysToDate,
  isvalidEmail,
  getFormattedMobile,
  alpha2ToCallingCode,
  callingCodeToAlpha2,
  generateBcryptHash,
  generateJWTToken,
  passwordTestHandler,
  matchBcryptHash,
};
