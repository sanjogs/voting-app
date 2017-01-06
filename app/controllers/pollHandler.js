'use strict';

function PollHandler(){
    var Poll = require('../models/poll.js');
    
    this.getPolls=function(callback){
      var allPolls=[];
     
      //get all polls or polls filtered by user
       Poll.find({}, function (err, polls) {
          if(err) return callback(null);
           callback(null,polls);
       });
       
    };
    
    //get individual poll for modifying or voting
    this.getPoll=function(id)
    {
        return {id:id,question:'first',
                choices:['a', 'b']};
    };
    
    //vote for a poll
    this.vote=function(pollid, voterip)
    {
        
    };
    
    //create a poll
    this.savePoll=function(question,user)
    {
        
    };
    
    //create poll choice
    this.saveChoice=function(poll, choice)
    {
        
    };
}

module.exports=PollHandler;