'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ChoiceSchema = new Schema({
    choice:String,
    votecount:Number,
    createdby:Schema.Types.ObjectId
})

var PollSchema = new Schema({
    question: String,
    choices:[ChoiceSchema],
    createdby: Schema.Types.ObjectId,
    createdbyname:String,
    voterIP:Array
});

module.exports = mongoose.model('Poll', PollSchema);