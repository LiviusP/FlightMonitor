'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');
var cors = require('../../config/CORS');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/password', auth.isAuthenticated(), controller.changePassword);
router.post('/password/reset', controller.resetPassword);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', controller.create);
router.post('/addRequests' , auth.hasRole('admin') , controller.incrementRequests);
router.get('/confirm/:id' , controller.confirmUser);

module.exports = router;
