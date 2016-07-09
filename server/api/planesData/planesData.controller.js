'use strict';

var _ = require('lodash');
var PlanesData = require('./planesData.model');
var restclient = require('restler');
var config = require('../../config/environment');
var airportCodes = require('../../config/airports');


// Get list of planesDatas
exports.index = function(req, res) {
  PlanesData.find(function (err, planesDatas) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(planesDatas);
  });
};

// Get a single planesData
exports.show = function(req, res) {
  PlanesData.findById(req.params.id, function (err, planesData) {
    if(err) { return handleError(res, err); }
    if(!planesData) { return res.status(404).send('Not Found'); }
    return res.json(planesData);
  });
};

// Creates a new planesData in the DB.
exports.create = function(req, res) {
  PlanesData.create(req.body, function(err, planesData) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(planesData);
  });
};

// Updates an existing planesData in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  PlanesData.findById(req.params.id, function (err, planesData) {
    if (err) { return handleError(res, err); }
    if(!planesData) { return res.status(404).send('Not Found'); }
    var updated = _.merge(planesData, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(planesData);
    });
  });
};

// Deletes a planesData from the DB.
exports.destroy = function(req, res) {
  PlanesData.findById(req.params.id, function (err, planesData) {
    if(err) { return handleError(res, err); }
    if(!planesData) { return res.status(404).send('Not Found'); }
    planesData.remove(function(err) {
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
     PlanesData.find({
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
        var planesDatas = [];
        docs.forEach(function(item){
          planesDatas.push(item.data);
        })
        res.status(200).send(planesDatas);
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

let params = '-latlong "'+ (lat - 1)+ ' ' + (long -1) + ' ' + (lat +1)+ ' ' + (long +1) + '" -inAir 1';  //111.3 km raza


restclient.get(fxml_url + 'Search', {
    username: username,
    password: apiKey,
    query: {query: params, howMany: 20, offset: 0}
}).on('success', function(result, response) {
    responseFromApi = result.SearchResult.aircraft;
    responseFromApi.forEach(function(item,i) {
      let planesData = new PlanesData();
      console.log("test");
      if (item.destination in airportCodes.airports) {
        item.destination = airportCodes.airports[item.destination];
      }
      if (item.origin in airportCodes.airports) {
        item.origin = airportCodes.airports[item.origin];
      }
     planesData.data = item;
     planesData.point = {
         "type": "Point", 
     "coordinates": [item.latitude, item.longitude]
      };
    planesData.createdAt = new Date();
    
    if (i == responseFromApi.length - 1){
      planesData.save(function(error , planesData){
        getFromDB(req,res);
      });
    } else {
      planesData.save();
    }
  }); 
  }).on('error' , function(error) {
    console.log(error);
  });
}

function handleError(res, err) {
  return res.status(500).send(err);
}
