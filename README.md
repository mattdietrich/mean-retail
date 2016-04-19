# mean-retail
Sample retail web app made with the MEAN stack

This project was created during an online course called _MongoDBx: M101x Introduction to MongoDB using the MEAN Stack_

# Dependencies
* MongoDB: https://www.mongodb.org
* Node.js: https://nodejs.org/

# Installation/Configuration
Run ```npm install``` from your terminal in the project directory

Requires a configuration file ```/config/config.json``` with the following contents:
```
{
	"facebookClientId": "",
	"facebookClientSecret": "",
	"expressSessionSecret": "",
	"stripeKey": "",
	"openExchangeRatesKey": ""
}
```

# Starting the Server
Start MongoDB via ```mongod --dbpath ./db/``` (dbpath must exist)

Start the server via ```node server.js```

Navigate to ```localhost:3000``` in your browser

Enjoy!
