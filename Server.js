#!/usr/bin/nodejs

/*
	RaspiHue - Touch screen Hue controller for Raspberry Pi.
	Control your Hue lights in one easy press.

	James Botting - james@bottswanamedia.info
	https://github.com/bottswana

	Requires Node.js and the following dependancies installed via npm.
	- node-hue-api
	- chalk
	- mysql
	- swig
	- mime
*/

// Basic Hue Setup
var Common = require('./Core/Common').Common;
Common.Settings = 
{
	WebHost: "0.0.0.0",
	WebPort: 80,

	DatabaseCredentials: 
	{
		Host: 	"127.0.0.1",
		User: 	"",
		Pass: 	"",
		Db:   	"raspihue"
	}
}

// Nothing user configurable below this line \\

// Includes
var WebServer 	= require('./Core/WebServer').WebServer;
var Database 	= require('./Core/Database').Database;
var Bridge 		= require('./Core/Bridge').Bridge;

// Database Connection
Common.log(0, "Info", "Initialising RaspiHue v1.0.0");
Database.Init(function(err) 
{
	if( err ) process.exit();

	// Search for Bridge
	Bridge.FindBridge( function() {} );

	// Initialise Webserver
	WebServer.SpoolServer();
});