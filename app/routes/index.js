'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
var PollHandler = require(path + '/app/controllers/pollHandler.js');
var Poll = require('../models/poll.js');

module.exports = function(app, passport) {

	function isLoggedIn(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		}
		else {
			res.redirect('/login');
		}
	}

	var clickHandler = new ClickHandler();
	var pollHandler = new PollHandler();

	app.set('view engine', 'ejs');
	app.set('views', './app/views/');

	app.route('/')
		.get(isLoggedIn, function(req, res) {
			res.sendFile(path + '/public/index.html');
		});

	app.route('/home')
		.get(function(req, res) {

			pollHandler.getPolls(function(err, polls) {
				if (err) throw err;

				res.render('home', {
					pageTitle: 'Home',
					isLoggedIn: req.isAuthenticated(),
					userName: req.isAuthenticated() ? req.user.github.displayName : '',
					polls: polls,
				});
			});
		});

	app.route('/vote')
		.get(function(req, res) {
			var pollId = req.query.id;
	
			pollHandler.getPoll(pollId, function(err, poll) {
				if (err) throw err;
			
					var hasvoted = false;
					if(poll.voterIP.indexOf(req.headers['x-forwarded-for'])>-1)
					{
					 hasvoted=true;
					}
	
				res.render('vote', {
					pageTitle: 'Vote',
					isLoggedIn: req.isAuthenticated(),
					userName: req.isAuthenticated() ? req.user.github.displayName : '',
					poll: poll,
					hasvoted:hasvoted
				});
			});
		})
		.post(function(req, res) {
			//check if user already voted
			Poll.findOne({
				_id: req.query.id,
				voterIP: req.headers['x-forwarded-for']
			}).exec(function(err, doc) {
				if (err) throw err;
				if (doc) {
					res.status(400).send('You already voted once.');
				}
			});

			Poll.findOneAndUpdate({
					_id: req.query.id,
					'choices._id': req.body.choice
				}, {
					$inc: {
						'choices.$.votecount': 1
					},
					$push: {
						'voterIP': req.headers['x-forwarded-for']
					}
				},
				function(err, doc) {
					if (err) throw err;

					//reditect to same page . eventually this will show chart
					res.redirect('/vote?id=' + req.query.id);
				});
		});


	app.route('/poll')
		.get(isLoggedIn, function(req, res) {
			var pollId = req.query.id;
			if (pollId) {
				//edit existing
				pollHandler.getPoll(pollId, function(err, data) {
					if (err) throw err;

					res.render('poll', {
						pageTitle: 'Edit Poll',
						isLoggedIn: req.isAuthenticated(),
						userName: req.isAuthenticated() ? req.user.github.displayName : '',
						poll: data,
					});
				});

			}
			else {
				//create new
				res.render('poll', {
					pageTitle: 'Create Poll',
					isLoggedIn: req.isAuthenticated(),
					userName: req.isAuthenticated() ? req.user.github.displayName : '',
					poll: null,
				});
			}
		})
		.post(isLoggedIn, function(req, res) {

			var pollId = req.query.id;
			if (pollId) {
				//update existing
				Poll.findOneAndUpdate({
						_id: pollId
					}, {
						question: req.body.question,
						choices: req.body.choice
					}, {
						new: true,
						upsert: true
					},
					function(err, doc) {
						if (err) {
							res.status(500).send('Oops! something went worng when updating. Poll not saved.');
						}

						res.redirect('/poll?id=' + doc._id);

					});
			}
			else {
				//create new
				var poll = new Poll();


				var choices = req.body.choice.map(function(c) {

					if (c.trim()) {
						return {
							choice: c.trim(),
							votecount: 0,
							createdby: req.user._id
						};
					}
					else {
						return null;
					}
				});
				choices = choices.filter(function(c) {
					return c != null;
				});

				poll.question = req.body.question;
				poll.choices = choices;
				poll.createdby = req.user._id;
				poll.createdbyname = req.user.github.displayName;
				poll.votes = [];
				poll.save(function(err, doc) {
					if (err) {
						res.status(500).end('Oops! something went worng. Poll not saved.');
					}

					res.redirect('/poll?id=' + doc._id);

				});
			}
		});

	app.route('/login')
		.get(function(req, res) {
			res.sendFile(path + '/public/login.html');
		});

	app.route('/logout')
		.get(function(req, res) {
			req.logout();
			res.redirect('/login');
		});

	app.route('/profile')
		.get(isLoggedIn, function(req, res) {
			res.sendFile(path + '/public/profile.html');
		});

	app.route('/api/:id')
		.get(isLoggedIn, function(req, res) {
			res.json(req.user.github);
		});

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/Home',
			failureRedirect: '/login'
		}));

	app.route('/api/:id/clicks')
		.get(isLoggedIn, clickHandler.getClicks)
		.post(isLoggedIn, clickHandler.addClick)
		.delete(isLoggedIn, clickHandler.resetClicks);
};
