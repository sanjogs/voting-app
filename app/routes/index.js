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
		var pollId=req.params.id;
		res.render('vote',{pageTitle:'Vote',
							   isLoggedIn: req.isAuthenticated(),
							   userName:req.isAuthenticated()?req.user.github.displayName:'',
							   poll:pollHandler.getPoll(pollId),
							   });
	})

	app.route('/poll/')
	.get(isLoggedIn,function(req,res){
		var pollId=req.params.id;
		res.render('poll',{pageTitle:'Edit Poll',
							   isLoggedIn: req.isAuthenticated(),
							   userName:req.isAuthenticated()?req.user.github.displayName:'',
							   poll:null,
							   });
	});
	app.route('/poll/:id')
	.get(isLoggedIn,function(req,res){
		var pollId=req.params.id;
		
		pollHandler.getPoll(pollId,function(err,data){
				if (err) throw  err;
				res.render('poll',{pageTitle:'Edit Poll',
							   isLoggedIn: req.isAuthenticated(),
							   userName:req.isAuthenticated()?req.user.github.displayName:'',
							   poll:data,
							   });
		});
	});
	
	app.route('/api/poll')
	   .post(isLoggedIn,function(req,res){
	console.log(req.body);
		var poll = new Poll();
		
		poll.question=req.body.question;
		poll.choices=JSON.stringify(req.body.choice);
		poll.createdby=req.user._id;
	    poll.createdbyname=req.user.github.displayName;
	    poll.votes=[];
	    poll.save(function(err,newpoll){
	    	if(err) {
	    		res.status(500).send('Oops! something went worng. Poll not saved.')
	    	}
	    
	    	res.redirect('/poll/' + newpoll._id);
	    	
	    });
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
