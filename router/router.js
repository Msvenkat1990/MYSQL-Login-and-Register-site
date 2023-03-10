const express = require("express");
const router = express.Router();
const userController = require("../controller/user");

router.get(["/","/login"], (req, res) => {
  res.render("login");
});

router.get("/register", (req, res) => {
  res.render("register");
});
router.get("/profile",userController.isLoggedIn, (req, res) => {
  if (req.user) {
    res.render("profile", { user: req.user });
  } else {
    res.redirect("/login");
  }
});
router.get("/home", userController.isLoggedIn, (req, res) => {
  if (req.user) {
    res.render("home", { user: req.user });
  } else {
    res.redirect("/login");
  }
});
module.exports = router;
