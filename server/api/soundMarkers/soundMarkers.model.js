'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SoundMarkersSchema = new Schema({
 data : String,
 point : Object,
 user: String
});


module.exports = mongoose.model('SoundMarker', SoundMarkersSchema);