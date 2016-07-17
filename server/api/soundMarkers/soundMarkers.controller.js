'use strict';

var _ = require('lodash');
var SoundMarker = require('./soundMarkers.model');
var restclient = require('restler');



// Get list of SoundMarkers
exports.index = function(req, res) {
  SoundMarker.find(function (err, soundMarkers) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(soundMarkers);
  });
};

// Get a single planesData
exports.show = function(req, res) {
  SoundMarker.findById(req.params.id, function (err, soundMarker) {
    if(err) { return handleError(res, err); }
    if(!soundMarker) { return res.status(404).send('Not Found'); }
    return res.json(soundMarker);
  });
};

// Creates a new SoundMarker in the DB.
exports.create = function(req, res) {
  var data = req.body;
  data.user = req.user.name;
  SoundMarker.create(data, function(err, soundMarker) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(soundMarker);
  });
};

// Updates an existing SoundMarker in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  SoundMarker.findById(req.params.id, function (err, soundMarker) {
    if (err) { return handleError(res, err); }
    if(!soundMarker) { return res.status(404).send('Not Found'); }
    var updated = _.merge(soundMarker, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(soundMarker);
    });
  });
};

// Deletes a soundMarker from the DB.
exports.destroy = function(req, res) {
  SoundMarker.findById(req.params.id, function (err, soundMarker) {
    if(err) { return handleError(res, err); }
    if(!soundMarker) { return res.status(404).send('Not Found'); }
    soundMarker.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};




function handleError(res, err) {
  return res.status(500).send(err);
}
