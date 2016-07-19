'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SoundMarkersSchema = new Schema({
 data : Object,
 point : Object,
 user: String
});


module.exports = mongoose.model('SoundMarker', SoundMarkersSchema);