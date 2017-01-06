'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
var PollHandler = require(path + '/app/controllers/pollHandler.js');
var Poll = require('../models/poll.js');

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/login');
		}
	}

	var clickHandler = new ClickHandler();
	var pollHandler = new PollHandler();
	
	app.set('view engine','ejs');
	app.set('views','./app/views/');
	
	app.route('/')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/index.html');
		});
		
	app.route('/home')
		.get(function (req, res) {
			
		pollHandler.getPolls(function(err,polls)
			{
				if (err) throw  err;
				
				res.render('home',{
							   pageTitle:'Home',
							   isLoggedIn: req.isAuthenticated(),
							   userName:req.isAuthenticated()?req.user.github.displayName:'',
							   polls:polls,
							   });	
			});
		});

	app.route('/vote/:id')
	.get(function(req,res){
		var voteId=req.params.id;
		res.render('vote',{pageTitle:'Vote',
							   isLoggedIn: req.isAuthenticated(),
							   userName:req.isAuthenticated()?req.user.github.displayName:'',
							   poll:pollHandler.getPoll(voteId),
							   });
	})

	app.route('/poll/:id')
	.get(isLoggedIn,function(req,res){
		var voteId=req.params.id;
		res.render('poll',{pageTitle:'Edit Poll',
							   isLoggedIn: req.isAuthenticated(),
							   userName:req.isAuthenticated()?req.user.github.displayName:'',
							   poll:pollHandler.getPoll(voteId),
							   });
	});
	
	app.route('/api/poll')
	   .post(isLoggedIn,function(req,res){
		
		var poll = new Poll();
		
		poll.question=req.body.question;
		poll.choices=req.body.choices;
		poll.createdby=req.user._id;
	
	    poll.save();
	});
				
	app.route('/login')
		.get(function (req, res) {
			res.sendFile(path + '/public/login.html');
		});

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/login');
		});

	app.route('/profile')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/profile.html');
		});

	app.route('/api/:id')
		.get(isLoggedIn, function (req, res) {
			res.json(req.user.github);
		});

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/login'
		}));

	app.route('/api/:id/clicks')
		.get(isLoggedIn, clickHandler.getClicks)
		.post(isLoggedIn, clickHandler.addClick)
		.delete(isLoggedIn, clickHandler.resetClicks);
};
