'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Poll = new Schema({
    question: String,
    choices:String,
    createdby: Schema.Types.ObjectId,
});

module.exports = mongoose.model('Poll', Poll);