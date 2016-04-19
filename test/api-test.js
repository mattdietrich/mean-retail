var assert = require('assert');
var express = require('express');
var status = require('http-status');
var superagent = require('superagent');
var wagner = require('wagner-core');

var URL_ROOT = 'http://localhost:3000';
var PRODUCT_ID = '000000000000000000000001';

describe('Online Store API', function() {
	var server;
	var Category;
	var Product;
	var Stripe;
	var User;

	before(function(){
		var app = express();

		//  Configure server
		require('../models/models')(wagner);
		require('../controllers/dependencies')(wagner);

		// Make models available in tests
		var deps = wagner.invoke(function(Category, Product, Stripe, User) {
			return {
				Category: Category,
				Product: Product,
				Stripe: Stripe,
				User: User
			};
		});

    	Category = deps.Category;
    	Product = deps.Product;
    	Stripe = deps.Stripe;
    	User = deps.User;

		app.use(function(req, res, next) {
      		User.findOne({}, function(error, user) {
        		assert.ifError(error);
        		req.user = user;
        		next();
      		});
    	});

		app.use(require('../routes/api')(wagner));

		server = app.listen(3000);

		
	});

	after(function(){
		// Shut the server down when we're done
		server.close();
	});

	beforeEach(function(done){
		// Delete all categories before each test
		Category.remove({}, function(error) {
			assert.ifError(error);
			// Delete all products before each test
			Product.remove({}, function(error) {
				assert.ifError(error);
				// Delete all users before each test
				User.remove({}, function(error) {
          			assert.ifError(error);
          			done();
        		});
        	});
		});
	});

	beforeEach(function(done) {
		// Create some test data

		var categories = [
      		{ _id: 'Electronics' },
      		{ _id: 'Phones', parent: 'Electronics' },
      		{ _id: 'Laptops', parent: 'Electronics' },
      		{ _id: 'Bacon' }
    	];

    	var products = [
      		{
        		name: 'LG G4',
        		category: { _id: 'Phones', ancestors: ['Electronics', 'Phones'] },
        		price: {
          			amount: 300,
          			currency: 'USD'
        		}
      		},
      		{
        		_id: PRODUCT_ID,
        		name: 'Asus Zenbook Prime',
        		category: { _id: 'Laptops', ancestors: ['Electronics', 'Laptops'] },
        		price: {
          			amount: 2000,
          			currency: 'USD'
        		}
      		},
      		{
        		name: 'Flying Pigs Farm Pasture Raised Pork Bacon',
        		category: { _id: 'Bacon', ancestors: ['Bacon'] },
        		price: {
          			amount: 20,
          			currency: 'USD'
        		}
      		}
    	];

    	var users = [{
      		profile: {
        		username: 'vkarpov15',
        		picture: 'http://pbs.twimg.com/profile_images/550304223036854272/Wwmwuh2t.png'
      		},
      		data: {
        		oauth: 'invalid',
        		cart: []
      		}
    	}];

    	Category.create(categories, function(error) {
      		assert.ifError(error);
      		Product.create(products, function(error) {
        		assert.ifError(error);
        		User.create(users, function(error) {
          			assert.ifError(error);
          			done();
        		});
      		});
    	});
	});

	describe('Category API', function() {
		it('can load a category by id', function(done) {
			var url = URL_ROOT + '/category/id/Electronics';
			// Make an HTTP request to localhost:3000/category/id/Electronics
			superagent.get(url, function(error, res) { 
				assert.ifError(error);
				var result;
				// Make sure we get a response of { _id: 'Electronics' } back
				assert.doesNotThrow(function() {
					result = JSON.parse(res.text);
				});
				assert.ok(result.category);
				assert.equal(result.category._id, 'Electronics');
				done();
			});
		});

		it('can load all categories that have a certain parent', function(done) {
			var url = URL_ROOT + '/category/parent/Electronics';
			// Make an HTTP request to localhost:3000/category/parent/Electronics
			superagent.get(url, function(error, res) {
				assert.ifError(error);
				var result;
				// Make sure we get a response of Laptops and Phones back
				assert.doesNotThrow(function() {
					result = JSON.parse(res.text);
				});
				assert.equal(result.categories.length, 2);
				// Should be in ascending order by _id
				assert.equal(result.categories[0]._id, 'Laptops');
				assert.equal(result.categories[1]._id, 'Phones');
				done();
			});
		});
	});

	describe('Product API', function() {
		it('can load a product by id', function(done) {
			var url = URL_ROOT + '/product/id/' + PRODUCT_ID;
			// Make an HTTP request to 
			// localhost:3000/product/id/000000000000000000000001
			superagent.get(url, function(error, res) { 
				assert.ifError(error);
				var result;
				// Make sure we get a response of the Asus Zenbook Prime back
				assert.doesNotThrow(function() {
					result = JSON.parse(res.text);
				});
				assert.ok(result.product);
				assert.equal(result.product._id, PRODUCT_ID);
				assert.equal(result.product.name, 'Asus Zenbook Prime');
				done();
			});
		});

		it('can load all products in a category with sub-categories', function(done) {
			var url = URL_ROOT + '/product/category/Electronics';
			// Make an HTTP request to localhost:3000/product/category/Electronics
			superagent.get(url, function(error, res) {
				assert.ifError(error);
				var result;
				assert.doesNotThrow(function() {
					result = JSON.parse(res.text);
				});
				assert.equal(result.products.length, 2);
				// Should be in ascending order by name
				assert.equal(result.products[0].name, 'Asus Zenbook Prime');
				assert.equal(result.products[1].name, 'LG G4');

				// Sort by price, ascending
  				var url = URL_ROOT + '/product/category/Electronics?price=1';
				superagent.get(url, function(error, res) {
					assert.ifError(error);
    				var result;
    				assert.doesNotThrow(function() {
    					result = JSON.parse(res.text);
    				});
    				assert.equal(result.products.length, 2);
    				// Should be in ascending order by price
    				assert.equal(result.products[0].name, 'LG G4');
    				assert.equal(result.products[1].name, 'Asus Zenbook Prime');
    				done();
				});
			});

		});
	});

	describe('User + Cart API', function() {
		it('can save users cart', function(done) {
    		var url = URL_ROOT + '/me/cart';
    		superagent.
      			put(url).
      			send({
        			data: {
          				cart: [{ product: PRODUCT_ID, quantity: 1 }]
        			}
      			}).
      			end(function(error, res) {
        			assert.ifError(error);
        			assert.equal(res.status, status.OK);
        			User.findOne({}, function(error, user) {
          				assert.ifError(error);
          				assert.equal(user.data.cart.length, 1);
          				assert.equal(user.data.cart[0].product, PRODUCT_ID);
          				assert.equal(user.data.cart[0].quantity, 1);
          				done();
        			});
      			});
  		});

  		it('can load users cart', function(done) {
    		var url = URL_ROOT + '/me';

    		User.findOne({}, function(error, user) {
      			assert.ifError(error);
      			user.data.cart = [{ product: PRODUCT_ID, quantity: 1 }];
      			user.save(function(error) {
        			assert.ifError(error);

        			superagent.get(url, function(error, res) {
         	 			assert.ifError(error);

          				assert.equal(res.status, status.OK);
          				var result;
          				assert.doesNotThrow(function() {
            				result = JSON.parse(res.text).user;
          				});
          				assert.equal(result.data.cart.length, 1);
          				assert.equal(result.data.cart[0].product.name, 'Asus Zenbook Prime');
          				assert.equal(result.data.cart[0].quantity, 1);
          				done();
        			});
      			});
    		});
  		});
	});

	describe('User Checkout', function() {
		it('can check out', function(done) {
    		var url = URL_ROOT + '/checkout';

    		// Set up data
    		User.findOne({}, function(error, user) {
      			assert.ifError(error);
      			user.data.cart = [{ product: PRODUCT_ID, quantity: 1 }];
      			user.save(function(error) {
        			assert.ifError(error);

        			// Attempt to check out by posting to /api/v1/checkout
        			superagent.
          				post(url).
          				send({
            				// Fake stripe credentials. stripeToken can either be
            				// real credit card credentials or an encrypted token -
            				// in production it will be an encrypted token.
            				stripeToken: {
              					number: '4242424242424242',
              					cvc: '123',
              					exp_month: '12',
              					exp_year: '2016'
            				}
          				}).
          				end(function(error, res) {
            				assert.ifError(error);

            				assert.equal(res.status, status.OK);
            				var result;
				            assert.doesNotThrow(function() {
				              result = JSON.parse(res.text);
				            });

				            // API call gives us back a charge id.
				            assert.ok(result.id);

				            // Make sure stripe got the id
				            Stripe.charges.retrieve(result.id, function(error, charge) {
				              	assert.ifError(error);
				              	assert.ok(charge);
				              	assert.equal(charge.amount, 2000 * 100); // 2000 USD
				              	done();
				            });
          				});
      			});
    		});
  		});
	});

	describe('Text Search API', function() {
		it('can search by text', function(done) {
			var url = URL_ROOT + '/product/text/asus';
			// Get products whose name contains 'asus'

			superagent.
				get(url, function(error, res) {
					assert.ifError(error);
					assert.equal(res.status, status.OK);
					
					var results;
		            assert.doesNotThrow(function() {
		              results = JSON.parse(res.text).products;
		            });
		            
		            // Expect that we got the Zenbook Prime back
      				assert.equal(results.length, 1);
      				assert.equal(results[0]._id, PRODUCT_ID);
      				assert.equal(results[0].name, 'Asus Zenbook Prime');
     				done();
				});
		});
	});
});