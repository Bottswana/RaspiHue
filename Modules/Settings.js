/*
	RaspiHue - Touch screen Hue controller for Raspberry Pi.
	Control your Hue lights in one easy press.

	HTML Template - Settings Render Page
*/

var Database 	= require('../Core/Database').Database;
var Common 		= require('../Core/Common').Common;
var Bridge 		= require('../Core/Bridge').Bridge;


// Path Routing
var Functions = {};
exports.Render = function(req, res, URLPath) 
{
	// Do we have access to this page?
	Database.Conn.query("SELECT * FROM `settings` WHERE `name` = 'remote-settings'", function(err, rows, fields) 
	{
		// Check Access
		var RemoteAccess = ( rows[0].value == 1 ) ? true : false;
		if( !Common.IsLocal(res.connection.remoteAddress) && !RemoteAccess )
		{
			Common.log(0, "Info", "Attempted access to Settings from remote endpoint denied");
			return Common.Page403(res);
		}

		// Render Page from Router
		if( !URLPath[2] || ( URLPath[2].length <= 0 ) ) return Functions.Index(res);
		var PageFunction = Functions[ URLPath[2] ];

		if( typeof PageFunction === 'function' ) return PageFunction(res, URLPath);
		return Common.Page404(res);
	});
}


// Pages
Functions.Index = function(res)
{
	// Load Settings Information
	Database.Conn.query("SELECT * FROM `settings` WHERE `name` in ('default-state','remote-access','remote-settings')", function(err, rows, fields) 
	{
		var ThisBridge		 = Bridge.GetAPIHandle();
		var LightInformation = [];
		var Settings 		 = {};

		// Process Settings Information
		if( rows.length >= 1 )
		{
			rows.forEach(function(data)
			{
				if( data.name == "default-state" ) Settings[data.name] = (data.value).split(",");
				else Settings[data.name] = (data.value == 1) ? true : false;
			});
		}

		// Fetch Light Information
		if( Bridge.DiscoveredBridge.HueRegistered )
		{
			// Fetch the lights we have registered to this bridge
			ThisBridge.lights(function(err, bulbs) 
			{
				// Load Light Information
				if( !err ) LightInformation = bulbs.lights;

				// Output Page
				Common.RenderTemplate(res, "settings.tpl", 
				{
					Lights: 	LightInformation,
					IPAddress: 	Common.GetIP(),
					Settings: 	Settings,
				});
			});
		}
		else
		{
			// Bridge not connected
			Common.RenderTemplate(res, "settings.tpl",
			{
				Lights: 	null,
				IPAddress: 	Common.GetIP(),
				Settings: 	Settings,
			});
		}
	});
}

// Update Settings
Functions.UpdateSettings = function(res, URLPath)
{
	var JSONData = JSON.parse(decodeURI(URLPath[3]));
	var ReturnData =
	{
		success: true,
		message: ""
	};

	// Update Values
	JSONData.forEach(function(data)
	{
		Common.log(1, "Save", "Updating setting: " + data[0] + " with value: " + data[1]);
		Database.Conn.query("UPDATE `settings` SET `value` = " + Database.Conn.escape(data[1]) + " WHERE name = " + Database.Conn.escape(data[0]));
	});

	// Output
	Common.Output(res, JSON.stringify(ReturnData));
}

Functions.UpdateLight = function(res, URLPath)
{
	var JSONData = JSON.parse(decodeURI(URLPath[3]));
	var ReturnData =
	{
		success: true,
		message: ""
	};

	// Rename light on the Bridge
	var ThisBridge = Bridge.GetAPIHandle();
	ThisBridge.setLightName(JSONData.LightID, JSONData.LightName);

	// Output
	Common.Output(res, JSON.stringify(ReturnData));	
}

Functions.Disconnect = function(res)
{
	Database.Conn.query("UPDATE `settings` SET value = '' WHERE name = 'hue-username'");
	Bridge.DiscoveredBridge = 
	{
		HueRegistered: false,
		HueIpAddress: null,
		HueUsername: null,
	};

	// Output
	var ReturnData =
	{
		success: true,
		message: ""
	};

	Common.Output(res, JSON.stringify(ReturnData));	
}

Functions.Reset = function(res)
{
	// Disconnect Bridge
	Database.Conn.query("UPDATE `settings` SET value = '' WHERE name = 'hue-username'");
	Bridge.DiscoveredBridge = 
	{
		HueRegistered: false,
		HueIpAddress: null,
		HueUsername: null,
	};

	// Set Defaults
	Database.Conn.query("UPDATE `settings` SET value = '1' WHERE name = 'remote-access'");
	Database.Conn.query("UPDATE `settings` SET value = '1' WHERE name = 'remote-settings'");
	Database.Conn.query("UPDATE `settings` SET value = '100,100' WHERE name = 'default-state'");
	Database.Conn.query("UPDATE `settings` SET value = '' WHERE name = 'light-selection'");

	// Clear profiles
	Database.Conn.query("DELETE FROM `profiles`");

	// Output
	var ReturnData =
	{
		success: true,
		message: ""
	};

	Common.Output(res, JSON.stringify(ReturnData));	
}