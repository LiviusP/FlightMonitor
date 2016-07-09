/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
// Insert seed models below
var PlanesData = require('../api/planesData/planesData.model');
var User = require('../api/user/user.model');

// Insert seed data below
var planesDataSeed = require('../api/planesData/planesData.seed.json');

// Insert seed inserts below
PlanesData.find({}).remove(function() {
	PlanesData.create(planesDataSeed);
});

