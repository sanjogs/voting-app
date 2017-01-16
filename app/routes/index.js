'use strict';

var path = process.cwd();
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

	var pollHandler = new PollHandler();

	app.set('view engine', 'ejs');
	app.set('views', './app/views/');

	app.route('/')
		.get(function(req, res) {
			res.redirect('/home');
		});

	app.route('/home')
		.get(function(req, res) {

			pollHandler.getPolls(null, function(err, polls) {
				if (err) throw err;

				res.render('home', {
					pageTitle: 'Home - FCC Voting App',
					isLoggedIn: req.isAuthenticated(),
					userId: req.isAuthenticated() ? req.user._id : '',
					userName: req.isAuthenticated() ? req.user.github.displayName : '',
					polls: polls,
				});
			});
		});

	app.route('/mypolls')
		.get(isLoggedIn, function(req, res) {

			pollHandler.getPolls(req.user._id, function(err, polls) {
				if (err) throw err;

				res.render('mypolls', {
					pageTitle: 'My Polls - FCC Voting App',
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
				if (poll.voterIP.indexOf(req.headers['x-forwarded-for']) > -1) {
					hasvoted = true;
				}

				res.render('vote', {
					pageTitle: 'Vote - FCC Voting App',
					isLoggedIn: req.isAuthenticated(),
					userId: req.isAuthenticated() ? req.user._id : '',
					userName: req.isAuthenticated() ? req.user.github.displayName : '',
					poll: poll,
					hasvoted: hasvoted,
					shareUrl: req.protocol + '://' + req.get('host') + req.originalUrl
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


			if (req.body.choice == '0') {
				//user selected customchoice-add choice and vote
				Poll.findOneAndUpdate({
						_id: req.query.id
					}, {

						$push: {
							'voterIP': req.headers['x-forwarded-for'],
							'choices': {
								votecount: 1,
								choice: req.body.customchoice,
								createdby: req.user._id
							}
						}
					},
					function(err, doc) {
						if (err) throw err;

						//refresh
						res.redirect('/vote?id=' + req.query.id);
					});
			}
			else {
				//find choice and increase vote count
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

						//refresh
						res.redirect('/vote?id=' + req.query.id);
					});
			}
		});


	app.route('/poll')
		.get(isLoggedIn, function(req, res) {
			//render page to create new poll
			res.render('poll', {
				pageTitle: 'Create Poll - FCC Voting App',
				isLoggedIn: req.isAuthenticated(),
				userName: req.isAuthenticated() ? req.user.github.displayName : '',
				poll: null,
			});
		})
		.post(isLoggedIn, function(req, res) {
			//split multiline choices
			var allChoices = req.body.choices.split('\r\n');
			//create choice object
			var choices = allChoices.map(function(c) {
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
			//filter out empty choices
			choices = choices.filter(function(c) {
				return c != null;
			});

			//create new
			var poll = new Poll();

			poll.question = req.body.question;
			poll.choices = choices;
			poll.createdby = req.user._id;
			poll.createdbyname = req.user.github.displayName;
			poll.votes = [];
			poll.save(function(err, doc) {
				if (err) {
					res.status(500).end('Oops! something went worng. Poll not saved.');
				}
				//redirect to voting screen
				res.redirect('/vote?id=' + doc._id);
			});
		})
		.delete(isLoggedIn, function(req, res) {
			var pollId = req.query.id;
			if (pollId) {
				//find and remove poll
				Poll.findOneAndRemove({
					_id: pollId
				}, function(err, data) {
					if (err) throw err;
					//send ok 
					res.status(200).send();
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
			res.redirect('/');
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
			failureRedirect: '/Home'
		}));
};
