/*
	RaspiHue - Touch screen Hue controller for Raspberry Pi.
	Control your Hue lights in one easy press.

	WebServer Code
*/

var WebServer 	= {};
var FileSystem 	= require('fs');
var FileTypes	= require('mime');

var Common		= require('../Core/Common').Common;
var Database 	= require('../Core/Database').Database;

WebServer.SpoolServer = function()
{
	// Initialise http webserver
	WebServer.Server = ( require('http') ).createServer( WebServer.HandleRequest );
	WebServer.Server.listen(Common.Settings.WebPort, Common.Settings.WebHost);

	Common.log(1, "Init", "Hue server listening on " + Common.Settings.WebHost + ":" + Common.Settings.WebPort);
}

WebServer.HandleRequest = function(req, res)
{
	// Do we have access to this page?
	WebServer.CheckAccess(res.connection.remoteAddress, function(AllowedAccess)
	{
		// Check Access
		if( !AllowedAccess )
		{
			Common.log(0, "Info", "Attempted access from remote endpoint denied");
			return Common.Page403(res);
		}

		// Render Page from Router
		var RequestedURL = req.url;
		if( RequestedURL.length > 0 )
		{
			// Route Pages
			var URLPath = RequestedURL.split('/');
			if( URLPath[1].length > 0 )
			{
				if( URLPath[1] == "Resources" )
				{
					// Resource Request
					return WebServer.ResRequest(req, res, URLPath);
				}
				else
				{
					// Module Request
					return WebServer.ModRequest(req, res, URLPath);
				}
			}
			else
			{
				// Route root path to control page
				return Common.Redirect(res, "/Control");
			}
		}

		// Bad Request
		return Common.Page400(res);
	});
}

WebServer.CheckAccess = function(IpAddress, callback)
{
	Database.Conn.query("SELECT * FROM `settings` WHERE `name` = 'remote-access'", function(err, rows, fields) 
	{
		// Check Access
		var RemoteAccess = ( rows[0].value == 1 ) ? true : false;
		if( !Common.IsLocal(IpAddress) && !RemoteAccess )
		{
			return callback(false);
		}

		return callback(true);
	});	
}

WebServer.ModRequest = function(req, res, URLPath)
{
	try 
	{
		var PageModule = require("../Modules/" + URLPath[1]);
		return PageModule.Render(req, res, URLPath);
	}
	catch(ex)
	{
		if( ex.message.indexOf("Cannot find module") != -1 )
		{
			// Unable to find module
			Common.log(2, "Warn", "Unable to find module: " + URLPath[1]);
			return Common.Page404(res);
		}

		// Unknown Error
		var ModuleError = "<b>Module Error Occoured:</b> " + ex.message + "<br /><br /><pre>" + ex.stack + "</pre>";
		Common.log(2, "Warn", "Module error: " + ex.message);
		return Common.Output(res, ModuleError);
	}
}

WebServer.ResRequest = function(req, res, URLPath)
{
	var FilePath = __dirname + "/../Resources";
	for( var i=2; i < URLPath.length; i++ )
	{
		FilePath = FilePath + "/" + URLPath[i].replace(/[^a-z0-9\-\.\_]/gi,'');
	}

	// Check if file exists
	FileSystem.lstat(FilePath, function(err, stats)
	{
		if( !err && stats.isFile() )
		{
			// Requested file exists
			var FileType = FileTypes.lookup(FilePath);
			res.writeHead(200, {'Content-Type': FileType});

			var FileStream = FileSystem.createReadStream(FilePath);
			FileStream.pipe(res);
			return;
		}
		
		// Non existant file
		return Common.Page404(res);
	});
}

exports.WebServer = WebServer;