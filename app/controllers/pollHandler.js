'use strict';

function PollHandler() {
    var Poll = require('../models/poll.js');

    this.getPolls = function(callback) {


        //get all polls or polls filtered by user
        Poll.find({}, function(err, polls) {
            if (err) return callback(null);
            callback(null, polls);
        });

    };

    //get individual poll for modifying or voting
    this.getPoll = function(id, callback) {
        Poll.findOne({
            _id: id
        }, function(err, data) {
            if (err) return callback(null);
            if (callback) {
                callback(null, data);
            }

        });

    };

    //vote for a poll
    this.vote = function(pollid, voterip) {

    };

    //create a poll
    this.savePoll = function(question, user) {

    };

    //create poll choice
    this.saveChoice = function(poll, choice) {

    };
}

module.exports = PollHandler;
