var express = require('express');
var wagner = require('wagner-core');

require('./models/models')(wagner);
require('./controllers/dependencies')(wagner);

var app = express();

wagner.invoke(require('./controllers/auth'), { app: app });

app.use('/api/v1', require('./routes/api')(wagner));

// Serve up static HTML pages from the file system
// For instance, '/html-examples/hello-http.html' in
// the browser will show the './public/html-examples/hello-http.html'
// file.

app.use(express.static('./public', { maxAge: 2 * 60 * 60 * 1000 /* 2 hrs */ }));


app.listen(3000);
console.log('Listening on port 3000!');