const express = require("express");
const expressEjsLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");
const app = express();

//Passport config
require("./config/passport")(passport);

//DB config
const db = require("./config/keys").MongoURI;

//Connect to Mongo
//this will return a promise
mongoose
	.connect(db, { useNewUrlParser: true })
	.then(() => console.log("MongoDB connected...."))
	.catch((err) => {
		console.log(err);
	});

//template engine always require a middleware
app.use(expressEjsLayouts);
app.set("view engine", "ejs");

//Body parser
app.use(express.urlencoded({ extended: false }));

//express session middleware
app.use(
	session({
		secret: "secret",
		resave: true,
		saveUninitialized: true,
	})
);
//Passport authentication
app.use(passport.initialize());
app.use(passport.session());

//connect flash middleware
app.use(flash());
//Global variables, custom middleware
app.use(function (req, res, next) {
	res.locals.success_msg = req.flash("success_msg");
	res.locals.error_msg = req.flash("error_msg");
	res.locals.error = req.flash("error");
	next();
});

//Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));

//Initialize port and start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server running on port: ${PORT}`);
});
