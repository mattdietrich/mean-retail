module.exports = function(config) {
	config.set({
    	files: [
      		'http://code.jquery.com/jquery-1.12.2.js',
      		'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.9/angular.js',
      		// For ngMockE2E
      		'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.9/angular-mocks.js',
      		'./bin/index.js',
      		'./test/client-test.js',
            { pattern: './templates/*.html', included: false, served: true }
    	],
    	frameworks: ['mocha', 'chai'],
    	browsers: ['Chrome'],
        port: 9876,
    	proxies : {
      		'/': 'http://localhost:9876/base/'
    	}
  	});
};
