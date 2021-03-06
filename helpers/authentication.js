'use strict';

var Hope  = require('hope');
var jwt   = require('jsonwebtoken');
var User  = require('../models/user');
var config= require('../config');

module.exports = function(request, response) {
  var limit = 0;
  var promise = new Hope.Promise();
  var token = request.body.token || request.query.token || request.headers['x-access-token'];


  if (token) {
    var session = jwt.verify(token, config.phrase, function (error, payload) {
	  if (error === null){

		if (payload.expire > new Date()) {
		      var filter = { _id: payload.id };
		      User.search(filter, limit = 1).then(function(error, user) {
			if (user === null) {
			  response.status(400).json({message: 'User not found.'});
			  
			} else {
			  return promise.done(error, user);
			}
		      });
		} else {
		      response.status(419).json({message:'Session expired. Please log in again.'});
		}

	}
	else {

		/*
			1campo
			message: {
			name: "JsonWebTokenError"
			message: "invalid token" }

			2-3campo
			message: {
			name: "JsonWebTokenError"
			message: "invalid signature" }
		*/
		response.status(401).json({message:error});

	}
  });

    		
  } else {
	response.status(419).json({message: 'Access control token header required. Please log in again.' });

  }



  return promise;
};


