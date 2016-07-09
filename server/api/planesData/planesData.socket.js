/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var PlanesData = require('./planesData.model');

exports.register = function(socket) {
  PlanesData.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  PlanesData.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('planesData:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('planesData:remove', doc);
}