/*
	RaspiHue - Touch screen Hue controller for Raspberry Pi.
	Control your Hue lights in one easy press.

	Common functions and code.
*/

var Common 		= {};
Common.Settings = {};

var chalk = require('chalk');
var Template = require('swig');

// Swig Settings
Template.setDefaults({ cache: false });

// Common Functions
Common.Page404 = function(res) 
{
	res.writeHead(404, {'Content-Type': 'text/html'});
	res.end('HTML/1.1 404 - Page Not Found');
	return true;
}

Common.Page403 = function(res) 
{
	res.writeHead(403, {'Content-Type': 'text/html'});
	res.end('HTML/1.1 403 - Forbidden');
	return true;
}

Common.Page400 = function(res) 
{
	res.writeHead(400, {'Content-Type': 'text/html'});
	res.end('HTML/1.1 400 - Bad Request');
	return true;
}

Common.Redirect = function(res, location)
{
	res.writeHead(302, {'Location': location});
	res.end();
	return true;
}

Common.RenderTemplate = function(res, fileName, options)
{
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end(Template.renderFile('./Templates/' + fileName, options));
	return true;
}

Common.Output = function(res, content)
{
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end(content);
	return true;	
}

Common.log = function(logLevel, prefix, logMessage)
{
	var logPrefix = "";

	if( logLevel == 0 ) 		logPrefix = "[" + prefix +"] ";
	else if( logLevel == 1 )	logPrefix = "[" + chalk.green(prefix) + "] ";
	else if( logLevel == 2 )	logPrefix = "[" + chalk.yellow(prefix) + "] ";
	else if( logLevel == 3 )	logPrefix = "[" + chalk.red(prefix) + "] ";

	console.log( logPrefix + logMessage );
}

Common.GetIP = function()
{
	var ifaces = require('os').networkInterfaces();
	var IPAddresses = [];

	Object.keys(ifaces).forEach(function(ifname) 
	{
		ifaces[ifname].forEach(function(iface) 
		{
			if( 'IPv4' !== iface.family || iface.internal !== false )
			{
				// skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
				return;
			}

			if( IPAddresses.indexOf(iface.address) == -1 )
			{
				// Add address to array
				IPAddresses.push(iface.address);
			}
		});
	});

	return IPAddresses;
}

Common.IsLocal = function(ClientIP)
{
	// Check Local IP Addresses
	if( ClientIP == "127.0.0.1" || ClientIP == "::1" )
	{
		return true;
	}

	// Check for our Server IP Addresses
	var ServerIP = Common.GetIP();
	ServerIP.forEach(function(data)
	{
		if( data == ClientIP ) return true;
	});

	// Otherwise, we are not local
	return false;
}

exports.Common = Common;