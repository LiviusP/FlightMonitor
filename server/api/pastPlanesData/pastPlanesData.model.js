'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var pastPlanesDataSchema = new Schema({
 data : Object,
 point : Object,
 createdAt : Date 
});
pastPlanesDataSchema.index({"createdAt" : 1} , {expireAfterSeconds : 120});
pastPlanesDataSchema.index({point : "2dsphere"});

module.exports = mongoose.model('pastPlanesData', pastPlanesDataSchema);