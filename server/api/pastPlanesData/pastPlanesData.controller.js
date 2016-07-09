'use strict';

var _ = require('lodash');
var PastPlanesData = require('./pastPlanesData.model');
var restclient = require('restler');
var config = require('../../config/environment');
var airportCodes = require('../../config/airports');


// Get list of pastPlanesDatas
exports.index = function(req, res) {
  PastPlanesData.find(function (err, pastPlanesDatas) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(pastPlanesDatas);
  });
};

// Get a single pastPlanesData
exports.show = function(req, res) {
  PastPlanesData.findById(req.params.id, function (err, pastPlanesData) {
    if(err) { return handleError(res, err); }
    if(!pastPlanesData) { return res.status(404).send('Not Found'); }
    return res.json(pastPlanesData);
  });
};

// Creates a new pastPlanesData in the DB.
exports.create = function(req, res) {
  PastPlanesData.create(req.body, function(err, pastPlanesData) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(pastPlanesData);
  });
};

// Updates an existing pastPlanesData in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  PastPlanesData.findById(req.params.id, function (err, pastPlanesData) {
    if (err) { return handleError(res, err); }
    if(!pastPlanesData) { return res.status(404).send('Not Found'); }
    var updated = _.merge(pastPlanesData, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(pastPlanesData);
    });
  });
};

// Deletes a pastPlanesData from the DB.
exports.destroy = function(req, res) {
  PastPlanesData.findById(req.params.id, function (err, pastPlanesData) {
    if(err) { return handleError(res, err); }
    if(!pastPlanesData) { return res.status(404).send('Not Found'); }
    pastPlanesData.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};


exports.businessLogic = function(req , res) {


    res.madeRequest = false;
    getFromDB(req , res);    
}

var getFromDB = function(req , res){

   let coordinates = [];
   if(req.query && req.query.hasOwnProperty('lat') && req.query.hasOwnProperty('long')) {
          coordinates[0] = parseInt(req.query.lat);
          coordinates[1] = parseInt(req.query.long);
      } 

      console.log(coordinates);
     PastPlanesData.find({
       point :{
        $nearSphere : coordinates,
        $maxDistance: (10/111.2) * 10  //100 k
      }
    } , function(err , docs){
       
       if (err){
        res.status(500).send("Error looking into DB");
       } else if (docs.length == 0) {
          if (!res.madeRequest){
            res.madeRequest = true; 
            makeRequest(req,res);
         } else {
              res.status(404).send("No planes found");
         }
        } else {
        var pastPlanesDatas = [];
        docs.forEach(function(item){
          pastPlanesDatas.push(item.data);
        })
        res.status(200).send(pastPlanesDatas);
       }

       
    });
}

var makeRequest = function(req , res){

var responseFromApi = [];

var fxml_url = 'http://flightxml.flightaware.com/json/FlightXML2/';
var username = config.flightAware.username;
var apiKey = config.flightAware.apiKey;

let lat = parseInt(req.query.lat);
let long = parseInt(req.query.long);

let params = '-latlong "'+ (lat - 1)+ ' ' + (long -1) + ' ' + (lat +1)+ ' ' + (long +1) + '" -inAir 0';  //111.3 km raza


restclient.get(fxml_url + 'Search', {
    username: username,
    password: apiKey,
    query: {query: params, howMany: 20, offset: 0}
}).on('success', function(result, response) {
    responseFromApi = result.SearchResult.aircraft;
    responseFromApi.forEach(function(item,i) {
      let pastPlanesData = new PastPlanesData();
      item.destination = airportCodes.airports[item.destination];
      item.origin = airportCodes.airports[item.origin];
     pastPlanesData.data = item;
     pastPlanesData.point = {
         "type": "Point", 
     "coordinates": [item.latitude, item.longitude]
      };
    pastPlanesData.createdAt = new Date();
    
    if (i == responseFromApi.length - 1){
      pastPlanesData.save(function(error , pastPlanesData){
        getFromDB(req,res);
      });
    } else {
      pastPlanesData.save();
    }
  }); 
  }).on('error' , function(error) {
    console.log(error);
  });
}

function handleError(res, err) {
  return res.status(500).send(err);
}
