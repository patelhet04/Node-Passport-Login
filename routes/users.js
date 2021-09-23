// all /users file will go here other in index.js
const express = require("express");
const userRouter = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
//User model
const User = require("../models/User");

//Login
userRouter.get("/login", (req, res) => {
	res.render("login");
});

//Register
userRouter.get("/register", (req, res) => {
	res.render("register");
});

// Register Handle
userRouter.post("/register", (req, res) => {
	const { name, email, password, confirm_password } = req.body;
	let errors = [];
	//check required fields
	if (!name || !email || !password || !confirm_password) {
		errors.push({ msg: "Please fill in all fields" });
	}
	//check password match
	if (password !== confirm_password) {
		errors.push({ msg: "Passwords do not match" });
	}
	//check password length
	if (password.length < 6) {
		errors.push({ msg: "Password too short" });
	}
	//check password length and characters
	const strongRegex = new RegExp(
		"^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
	);
	if (!password.match(strongRegex)) {
		errors.push({
			msg: "Weak Password. Please include mixture of lowercase, uppercase and special characters",
		});
	}
	if (errors.length > 0) {
		res.render("register", {
			errors,
			name,
			email,
			password,
			confirm_password,
		});
	} else {
		//validation passed
		// now use model to add the user to database
		//first check is the user already exists
		User.findOne({ email: email }).then((user) => {
			if (user) {
				errors.push({ msg: "Email already registered" });
				res.render("register", {
					errors,
					name,
					email,
					password,
					confirm_password,
				});
			} else {
				const newUser = new User({
					name,
					email,
					password,
				});
				//Hash password
				bcrypt.genSalt(10, (err, salt) => {
					bcrypt.hash(newUser.password, salt, (err, hash) => {
						if (err) throw err;
						newUser.password = hash;
						newUser
							.save()
							.then((user) => {
								req.flash(
									"success_msg",
									"Registered Successfully. Please login to continue"
								);
								res.redirect("/users/login");
							})
							.catch((err) => console.log(err));
					});
				});
			}
		});
	}
});

//Login Handle
userRouter.post("/login", (req, res, next) => {
	passport.authenticate("local", {
		successRedirect: "/dashboard",
		failureRedirect: "/users/login",
		failureFlash: true,
	})(req, res, next);
});

//logout handle
userRouter.get("/logout", (req, res) => {
	req.logout();
	req.flash("success_msg", "You are logged out");
	res.redirect("/users/login");
});
module.exports = userRouter;
