const { pick } = require("lodash");
const moment = require("moment");
// import { Request, Response, NextFunction } from "express";

/////////////////////////////
// API FUNCTIONS
/////////////////////////////
const cors = function (req, res, next) {
  const request = pick(req, ["url", "method", "body", "headers"]);
  req.timestamp = moment().format("MMMM Do YYYY, h:mm:ss a");
  console.log("Incoming Request Object");
  console.log(request);

  //ADD DOMAIN OR IP HERE
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "https://localhost:8000",
    "http://localhost:4200",
    "http://localhost:3006",
    "http://localhost:5100",
    "http://localhost:3010",
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.indexOf(origin) > -1) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header(
    "Access-Control-Allow-Methods",
    "POST, GET, PUT, PATCH, DELETE, OPTIONS"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, x-access-token, apikey, x-refresh-token"
  );
  next();
};
module.exports = cors;
