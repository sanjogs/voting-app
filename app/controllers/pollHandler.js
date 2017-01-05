'use strict';

function PollHandler(){
    
    this.getPolls=function(){
      
      //get all polls or polls filtered by user
        return {data:[{question:'first', createdBy:'Sam'},
				      {question:'second', createdBy:'Sam'}]};
    }
    
    //get individual poll for modifying or voting
    this.getPoll=function(pollinfo)
    {
        
    }
    
    //vote for a poll
    this.vote=function(pollid, voterip)
    {
        
    }
    
    //create a poll
    this.savePoll=function(question,user)
    {
        
    }
    //create poll choice
    this.saveChoice=function(poll, choice)
    {
        
    }
}

module.exports=PollHandler;