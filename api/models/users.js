const { Schema, model } = require("mongoose");
const { capitalize, forEach } = require("lodash");
const { isDef } = require("../helpers");
const autoIncrement = require("mongoose-auto-increment");

/////////////////////////////
// USERS SCHEMA
/////////////////////////////

const userSchema = new Schema(
  {
    name: { type: String, trim: true, required: true },
    age: { type: Number },
    city: { type: String, trim: true },
    qualification: { type: String, trim: true },
    email: {
      type: String,
      index: true,
      required: true,
    },
    mobile: {
      type: Number,
      index: true,
      required: true,
    },
    countryCode: {
      type: Number,
    },
    password: { type: String },
    admin: { type: Boolean, default: false },
    allowedToLogin: { type: Boolean },
  },
  { timestamps: true }
);

userSchema.index({ mobile: 1 }, { unique: true, sparse: true });
userSchema.index({ email: 1 }, { unique: true, sparse: true });

const User = model("User", userSchema);
module.exports = { User };
