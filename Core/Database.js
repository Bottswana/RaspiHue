/*
	RaspiHue - Touch screen Hue controller for Raspberry Pi.
	Control your Hue lights in one easy press.

	Database Intergration
*/

var Common 		= require("./Common").Common;
var Connector 	= require('mysql');
var Database 	= {};

Database.Init = function(connectCallback) 
{
	// Initialise Database Connection
	Database.Conn = Connector.createConnection({
		host: Common.Settings.DatabaseCredentials.Host, user: Common.Settings.DatabaseCredentials.User, password: Common.Settings.DatabaseCredentials.Pass
	});

	Database.Conn.connect(function(err) {
		if( err ) 
		{
			// SQL Server is not responding
			Common.log(3, "Error", "Unable to connect to SQL Database: " + err.code);
			connectCallback(err.code);
		}
		else 
		{
			// Set active database, and create tables if required
			Database.Conn.query("USE `" + Common.Settings.DatabaseCredentials.Db + "`", function(err, rows, fields) 
			{
				if( err ) Database.CreateDatabase();
				Database.Conn.query("SELECT * FROM `settings`", function(err, rows, fields) {
					if( err ) Database.CreateTables();

					// Finish connection and return our callback
					Database.Conn.on('error', Database.DatabaseError);
					connectCallback(null);
				});
			});			
		}
	});
}

Database.Close = function()
{
	// Close Database Connection
	Database.Conn.end();
}

Database.DatabaseError = function(errorString)
{
	// Handle an error in the connection
	if( errorString.code === 'PROTOCOL_CONNECTION_LOST' )
	{
		Common.log(0, "Info", "Database connection lost, reconnecting..");
		return Database.Init(ReconnectCallback);
	}

	// Handle another type of error
	Common.log(2, "Warn", "Database Error: " + errorString.message);
	console.log(errorString.stack);
}

Database.ReconnectCallback = function(connectStatus)
{
	if( connectStatus == null ) return;

	Common.log(2, "Warn", "Unable to connect to database, retrying connection in 5 seconds.");
	window.setTimeout( function() {
		Database.Init(ReconnectCallback);
	}, 5000);
}

Database.CreateDatabase = function()
{
	// Create Database
	Common.log(1, "Init", "Creating database `" + Common.Settings.DatabaseCredentials.Db + "`");
	Database.Conn.query("CREATE DATABASE `" + Common.Settings.DatabaseCredentials.Db + "`", function(err, rows, fields) {
		if( err ) Common.log(3, "Error", "Unable to create database `" + Common.Settings.DatabaseCredentials.Db + "` (" + err + ")");
	});
}

Database.CreateTables = function()
{
	// Create Tables
	Common.log(1, "Init", "Creating database tables");

	Database.Conn.query("CREATE TABLE IF NOT EXISTS settings (name VARCHAR(255), value TEXT, primary KEY (name))");
	Database.Conn.query("CREATE TABLE IF NOT EXISTS profiles (id INT NOT NULL AUTO_INCREMENT, name TEXT NOT NULL, data TEXT NOT NULL, primary KEY (id))");
}


exports.Database = Database;