const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const config = require("./index");
const autoIncrement = require("mongoose-auto-increment");
const mongoUri = process.env.MONGO_URI ?? config.mongoUri;

const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "assignment-dev",
};
module.exports = () => {
  mongoose
    .connect(mongoUri, mongoOptions)
    .then((resp) => {
      console.log(
        "Conncted to Database: " + mongoUri + "/" + mongoOptions.dbName
      );
    })
    .catch((err) => {
      console.log("error", err);
    });

  mongoose.connection.on(
    "error",
    console.error.bind(console, "connection error:")
  );

  autoIncrement.initialize(mongoose.connection);
};
