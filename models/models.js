var mongoose = require('mongoose');
var _ = require('underscore');

var userSchema = require('./user');
var categorySchema = require('./category');
var productSchema = require('./product');

module.exports = function(wagner) {
	mongoose.connect('mongodb://localhost:27017/test');

	wagner.factory('db', function() {
		return mongoose;
	});

	var User = mongoose.model('User', userSchema, 'users');
	var Category = mongoose.model('Category', categorySchema, 'categories');

	var models = {
		User: User,
		Category: Category
	};

	// To ensure DRY-ness, register factories in a loop
	_.each(models, function(value, key) {
		wagner.factory(key, function() {
			return value;
		});
	});

	wagner.factory('Product', productSchema);

	return models;
};
