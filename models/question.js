'use strict';
var mongoose = require('mongoose');
var User  = require('./user');
var Hope      	= require('hope');
var Schema = mongoose.Schema;

var questionSchema = new Schema({
	title:{ type: String, required: true },
	body:{ type: String, required: true },
	_user : { type: Schema.ObjectId, ref: 'User', required: true},
	created:{ type: Date, required: true },
	modified:{ type: Date },
	answercount: Number,
	votes: Number,
	views: Number,
	comments:[{comment: String, _user:{ type: Schema.ObjectId, ref: 'User'}, created: Date}],
	tags:[{ tag: String }],
	answers:[{type: Schema.ObjectId, ref: 'Answer'}],
	userVotes:[{type: Schema.ObjectId, ref: 'User'}]
});


/* static methods */
/* Nueva pregunta en el foro*/

questionSchema.statics.createQuestion = function createQuestion (attributes) {
var promise = new Hope.Promise();
var Question = mongoose.model('Question', questionSchema);
Question = new Question(attributes);
Question.save(function (error, question){
	if(error)
	{
		var messageError = '';
		if(error.errors.title != undefined)
		{
			messageError = "Questions title required";
		}
		else if(error.errors.body != undefined)
		{
			messageError = "Questions body required";
		}
		else if(error.errors.created != undefined)
		{
			messageError = "Questions created date required";
		}
		else if (error.errors._user != undefined)
		{
			messageError = "User required";
		}
		error = { code: 400, message: messageError };
		return promise.done(error,null);
	}
	else
	{
		
		return promise.done(error,question);
	}

});
return promise;
}

/* static methods*/
/* ACTUALIZAR pregunta*/
questionSchema.statics.updateQuestion = function updatequestion (id, update, options) {
    var promise = new Hope.Promise();
    this.findByIdAndUpdate(id, update, options,function(error, question) {
        if (error) {
            return promise.done(error, null);
        }else {
            return promise.done(error, question);
        }
    });
    return promise;
};

/* static methods*/
/* método para votar*/
questionSchema.statics.voteQuestion = function votequestion (id , attributes)
{
	var messageError = '';
	if(id === null)
	{
		messageError = "question ID is required";
		error = { code: 400, message: messageError };
        return promise.done(error, null);
	}
	else if(attributes._user === null)
	{
		messageError = "User is required";
		error = { code: 400, message: messageError };
        return promise.done(error, null);
	}
	else if(attributes.vote === null)
	{
		messageError = "Vote is required";
		error = { code: 400, message: messageError };
        return promise.done(error, null);
	}
	else
	{
		var promise = new Hope.Promise();
		var Question = mongoose.model('Question', questionSchema);
		var query = { $and: [ {_id: id }, { userVotes: { $ne: attributes._user }}]};
		var update = { $inc: {votes: attributes.vote}, $push: {userVotes:  attributes._user}};
		var options = { new: true};
		Question.findOne({_id: id},function(error,result) {
			if(error)
			{
				return promise.done(error,null);
			}
			else
			{
				if(result == null)
				{
					error = {code: 402, message:"Question not found"}

					return promise.done(error,null);
				}
				else
				{
					Question.findOneAndUpdate(query, update, options,function(error,result) {
						if(error)
						{
							return promise.done(error,null);			
						}
						else 
						{
							if(result == null)
							{
								error = {code : 402, message:"You have already voted"}
								return promise.done(error,null);
							}
							else
							{
								result = {code:"200", message:"Vote successfully"}
								return promise.done(error,result);
							}	
						}
					});
				}
			}	
		});
	}
	return promise;
}

/* static methods */
/* Obtener Todas las preguntas disponibles*/
questionSchema.statics.getQuestions = function getQuestions(){
	var promise = new Hope.Promise();
	var Question = mongoose.model('Question', questionSchema);
	Question.find().populate('_user').exec(function(error,result){
		if(error)
		{
			var messageError = '';
			return promise.done(error,null);
		}
		else
		{

			return promise.done(error,result);
		}
	});
	return promise;
}

/* static methods*/
/* obtener la pregunta por identificador*/
questionSchema.statics.getQuestion = function getQuestion(attributes)
{
	var promise = new Hope.Promise();
	var Question = mongoose.model('Question', questionSchema);
	Question.findOne({_id: attributes}).populate('_user comments._user answers').exec(function(error,value){
		if(error)
		{
			return promise.done(error,null);
		}
		else
		{   if (value.length === 0) {
                error = {
                    code: 402,
                    message: "Question not found."
                };
                return promise.done(error,null);
            }
            else{
            	
            	return promise.done(error,value);
            }	
		}
	});
	return promise;
}

/* Static methods*/
/* Obtener las preguntas por tag*/


/*Parser de una*/
questionSchema.methods.parse = function parse () {
    var question = this;
    return {
        id:        question._id,
        title:     question.title,
        body:      question.body, 
        user: {
            id         : (question._user._id) ? question._user._id : question._user,
            username   : (question._user.username) ? question._user.username :  ''
        },
        created:   question.created,
        modified:  question.modified,
        answercount: question.answercount,
		votes: question.votes,
		views: question.view,
		/*comments: {
			comment: question.comments.comment,
			user: {
            id         : (question.comments._user._id) ? question.comments._user._id : question.comments._user,
            username   : (question.comments._user.username) ? question.comments._user.username :  ''
        	}
		}*/
    };  
};
module.exports = mongoose.model('Question', questionSchema);