'use strict';

function PollHandler() {
    var Poll = require('../models/poll.js');

    this.getPolls = function(userId,callback) {
        if(userId)
        {
            //get  polls filtered by user
            Poll.find({createdby:userId}, function(err, polls) {
                if (err) return callback(null);
                callback(null, polls);
            });    
        }
        else
        {
            //get all polls
            Poll.find({}, function(err, polls) {
                if (err) return callback(null);
                callback(null, polls);
            });
        }
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
}

module.exports = PollHandler;
