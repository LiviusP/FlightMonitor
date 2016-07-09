'use strict';

var express = require('express');
var controller = require('./pastPlanesData.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/',auth.canMakeRequests(), controller.businessLogic);


module.exports = router;