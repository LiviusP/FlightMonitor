/**
 * Main application routes
 */

'use strict';

var path = require('path');

module.exports = function(app) {

app.all('/*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');


    next();
})

  // Insert routes below
  app.use('/api/planesData', require('./api/planesData'));
  app.use('/api/pastPlanesData', require('./api/pastPlanesData'));
  app.use('/api/users', require('./api/user'));
  app.use('/api/soundMarkers', require('./api/soundMarkers'));

  app.use('/auth', require('./auth'));
  

};
