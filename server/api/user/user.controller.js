'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');


var validationError = function(res, err) {
  return res.status(422).json(err);
};


var sendEmail = function(email,id,name){
  // create reusable transporter object using the default SMTP transport
   var transporter = nodemailer.createTransport('smtps://flight.monitor.app%40gmail.com:licentalivius@smtp.gmail.com');

var link = config.host + "/api/users/confirm/" + id;
var text = " <h1>Dear " + name + ", thank you for using our app!</h1><br><br><h3>" + 
                      " Your account has been created! Click here to confirm it : <a href='" + link + "'>" + link + "</a></h3>";
// setup e-mail data with unicode symbols
var mailOptions = {
    from: '"Flight Monitor" <flight.monitor.app@gmail.com>', // sender address
    to: 'plivius@yahoo.com', // list of receivers
    subject: 'FlightMonitor Confirm account', // Subject line
    text: text, // plaintext body
    html: text // html body
};

// send mail with defined transport object
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
});
}


var sendPasswordResetEmail = function(email, password) {
  var transporter = nodemailer.createTransport('smtps://flight.monitor.app%40gmail.com:licentalivius@smtp.gmail.com');

var text = "<h2>This is your new password! You can change it in the application!" + password + "</h3>";
// setup e-mail data with unicode symbols
var mailOptions = {
    from: '"Flight Monitor" <flight.monitor.app@gmail.com>', // sender address
    to: 'plivius@yahoo.com', // list of receivers
    subject: 'FlightMonitor Password Reset', // Subject line
    text: text, // plaintext body
    html: text // html body
};
// send mail with defined transport object
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
});
}
/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return res.status(500).send(err);
    res.status(200).json(users);
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.requests = -1;
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    console.log(newUser.email + "  " +  newUser._id);
    sendEmail(newUser.email , newUser._id, newUser.name);
    res.json({ token: token });

  });
};

exports.incrementRequests = function(req, res, next){
  var userId = req.body.id;
  var requests = req.body.reqNumber;
  console.log(userId);
  User.findById(userId , function(err, user){
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');

    user.incrementRequests(requests);
    user.save(function(err){
      if (err) return validationError(res, err);
        res.status(200).send('OK');
      });
  });
};

exports.confirmUser = function(req, res, next){
  var userId = req.params.id;
  User.findById(userId , function(err, user){
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');


    var confirmed = user.confirmUser();
    if (confirmed === true){
    user.save(function(err){
      if (err) return validationError(res, err);
        res.status(200).send('<h1 style="margin: auto;width: 50%;text-align:center;">User confirmed! </h1>');
      });
    } else {
      res.status(200).send('<h1 style="margin: auto;width: 50%;text-align:center;">User is already active! </h1>')
    }
  });
}

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    res.json(user.profile);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.status(500).send(err);
    return res.status(204).send('No Content');
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);
  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.status(200).send('OK');
      });
    } else {
      res.status(403).send('Forbidden');
    }
  });
};

/**
* Sends an email to the user with a new ganerated password
*/

exports.resetPassword = function(req, res, next) {
  var email = req.body.email;
  var newPass = 'temp' + Math.floor(Math.random() * 10000);

    User.findOne({
        email: email.toLowerCase()
      }, function (err, user) {
    if(user) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        sendPasswordResetEmail(user.email, newPass);
        res.status(200).send('OK');
      });
    } else {
      res.status(404).send('User not found');
    }
  });
}

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    res.json(user);
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
