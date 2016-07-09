/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var pastPlanesData = require('./pastPlanesData.model');

exports.register = function(socket) {
  pastPlanesData.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  pastPlanesData.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('pastPlanesData:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('pastPlanesData:remove', doc);
}