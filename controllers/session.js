  'use strict';

var Auth  = require('../helpers/authentication');
var User  = require('../models/user');
var Token = require('../helpers/token');
var mail  =require('../services/mailer.js');

exports.signup = function signup (request, response) {

  User.signup(request.body).then(function signup (error, result) {
    console.log(error)
    if (error) {
      
      response.status(error.code).json({message: error.message});
    } else {

      var token = Token(result);
      //request.session.user = token;
      result.token = token;
      response.json(result.parse());
    }
  });
};


exports.login = function login (request, response) {

  User.login(request.body).then(function login (error, result) {

    if (error) {
      response.status(error.code).json({message: error.message});
    } else {
      var token = Token(result);
      //request.session.user = token;
      var user = result.parse();
      user.token = token;
      response.json(user);
    }
  });
};




exports.profile = function profile (request, response) {
  Auth(request, response).then(function(error, result) {
    if (error) {
	/* nunca va a entrar */
      response.status(error.code).json({message: error.message});
    } else {
	/* devuelve el usuario entero */
      response.json(result.parse());
    }
  })
};

exports.forget = function forget(request, response){
 User.search(request.body,1).then (function search(error, result){
  if(error){
    response.status(error.code).json({message: error.message});
  } 
  else {
    /*Envio de mail y token*/
    var token = Token(result);
    result.token=token;
    response.json(token);
    
    mail.check(result,function(error,result){
      if(error){
         response.status(error.code).json({message: error.message});
       }else{
        response.json(result.parse());
       }
      });      
    }});
  };

exports.reset = function reset(request, response){
  
 Auth(request, response).then(function(error, result) {
    if (error) {
  /* nunca va a entrar */
      response.status(error.code).json({message: error.message});
    } else 
    {
      result.newPass= request.body.password;
      User.reset(result);
      response.json({message:"Contraseña cambiada con éxito"});
    }
  })
};
