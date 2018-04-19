//Dependencies
var express = require('express');
var router = express.Router();

var passport = require('passport');

var UserModel = require('../models/user');
var User = require('../models/user');

var AccomodationModel = require('../models/accomodation');

//renders the view for index/homepage
router.get('/', function(req, res){
	res.render('index');
});



//renders signup page - Also allows message to flash if user email already exists.
router.get('/signup', function (req, res){
	msgError = req.flash('msgError')
	res.render('signup', {message: msgError });
});

//when user tries to sign up, if successful they get redirected to profile page, if not they stay on the signup page.
router.post('/signup', passport.authenticate('local.signup', {
	successRedirect: '/profile',
	failureRedirect: '/signup',
	failureFlash: true
}));

//renders login page, flash messages if user email or password doesn't match.
router.get('/login', function (req, res){
	login_error = req.flash('loginError')
	password_error = req.flash('passwordError')
	res.render('login', {loginError: login_error, passwordError: password_error});
});

//If user account exists, username and passwords match they redirect to profile page, if not stay on login.
router.post('/login', passport.authenticate('local.login', {
	successRedirect: '/profile',
	failureRedirect: '/login',
	failureFlash: true
}));

//renders profile page, checks to see if the user is logged in function, sends the user object to the view.
router.get('/profile', isLoggedIn, function (req, res){
	console.log(req.user);
	AccomodationModel.find({}, function(err, data){
		res.render('profile', {accomodation: data, user: req.user});
		//console.log(data);
	});
});

router.get('/userlist', isLoggedIn, isUserAuthorised, function(req, res){
	UserModel.find({}, function(err, data){
		res.render('userlist', {users: data, user: req.user});
		console.log(data);
	});

})

//logs user out, redirects to homepage., sessions is cleared
router.get('/logout', function (req, res){
	req.logout();
	res.redirect('/');
});

//redirects url to signup page
router.get('/newuser', function (req, res){
	res.redirect('/signup');
});

//redirects url to login page
router.get('/exisitingUser', function (req, res){
	res.redirect('/login');
});

// router.post('/addToFavourites', function (req, res, next){
// 	var propertyID = req.body.propertyID;
// 	var propertyAddrL1 = req.body.propertyAddrL1;

// 	var favourites = {
// 		propertyID : propertyID,
// 		propertyAddrL1 : propertyAddrL1,
// 	}

// 	UserModel.updateOne(
// 		{
// 			"_id": _id 
// 		}, 
// 		{

// 			$push: {'favourites': favourites,},

// 		},
// 		function(err, result){
// 		console.log('Added to favourites');
// 		res.redirect('/profile');

// 		if(err) {
// 			console.error(err);
// 		}
// 	});
// });


module.exports = router;

//Function to see if user is logged in using the isAuthenticated method, if they aren't they get redirected to login page.
function isLoggedIn(req, res, next){
	if (req.isAuthenticated()) {
		return next();
	}

	res.redirect('/login');
};

function isUserAuthorised(req, res, next){
	if (req.user.role == "admin") {
		return next();
	}
	res.redirect('/profile');
};