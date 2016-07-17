'use strict';

var express = require('express');
var controller = require('./soundMarkers.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/',auth.isAuthenticated(), controller.index);
router.put('/add',auth.isAuthenticated(), controller.create);

module.exports = router;