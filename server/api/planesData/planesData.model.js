'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PlanesDataSchema = new Schema({
 data : Object,
 point : Object,
 createdAt : Date 
});
PlanesDataSchema.index({"createdAt" : 1} , {expireAfterSeconds : 120});
PlanesDataSchema.index({point : "2dsphere"});

module.exports = mongoose.model('PlanesData', PlanesDataSchema);