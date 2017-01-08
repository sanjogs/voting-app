'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Choice = new Schema({
    choiceText:String,
    VoteCount:Number
})

var Poll = new Schema({
    question: String,
    choices:Array,
    createdby: Schema.Types.ObjectId,
    createdbyname:String,
    voterdIP:Array
});

module.exports = mongoose.model('Poll', Poll);