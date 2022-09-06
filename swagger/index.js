// import swaggerDoc from "swagger-jsdoc";
const swaggerDoc = require("swagger-jsdoc");
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Assignment",
      description: "Assignment end points",
      version: "1.0.0",
    },
    servers: [
      {
        name: "local",
        description: "Local server",
        url: "http://localhost:3010/api",
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-access-token",
        },
      },
    },
  },

  apis: ["./swagger/*.yaml"],
};
const specs = swaggerDoc(options);
module.exports = specs;
