const express = require("express");
const router = express.Router();

const registerCtrl = require("../controllers/register");

router.post("/users", registerCtrl.createUsers);
router.post("/admins", registerCtrl.createAdmin);

module.exports = router;
