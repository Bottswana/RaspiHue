/*
	RaspiHue - Touch screen Hue controller for Raspberry Pi.
	Control your Hue lights in one easy press.

	HTML Template - Control Render Page
*/

var Database 	= require('../Core/Database').Database;
var Common 		= require('../Core/Common').Common;
var Bridge 		= require('../Core/Bridge').Bridge;

var LightCycle  = false;
var LightGroup	= [];


// Path Routing
var Functions = {};
exports.Render = function(req, res, URLPath) 
{
	// Render Page from Router
	if( !URLPath[2] || ( URLPath[2].length <= 0 ) ) return Functions.Index(res);
	var PageFunction = Functions[ URLPath[2] ];

	if( typeof PageFunction === 'function' ) return PageFunction(res, URLPath);
	return Common.Page404(res);
}


// Pages
Functions.Index = function(res)
{
	Database.Conn.query("SELECT * FROM `settings` WHERE `name` = 'remote-settings'", function(err, rows, fields) 
	{
		// Do we have access to settings?
		var RemoteAccess = ( rows[0].value == 1 ) ? true : false;
		var Settings = ( !Common.IsLocal(res.connection.remoteAddress) && !RemoteAccess ) ? false : true;

		// Render
		if( Bridge.DiscoveredBridge.HueRegistered )
		{
			// Fetch the lights we have registered to this bridge
			var ThisBridge = Bridge.GetAPIHandle();
			ThisBridge.lights(function(err, bulbs) 
			{
				var LightInformation = [];
				if( !err ) LightInformation = bulbs.lights;

				Common.RenderTemplate(res, "home.tpl", 
				{
					ShowSettings: Settings,
					Lights: LightInformation
				});
			});
		}
		else
		{
			// Bridge not connected
			Common.RenderTemplate(res, "home.tpl",
			{
				ShowSettings: Settings,
				Lights: null
			});
		}
	});
}

Functions.GetStatus = function(res)
{
	var ReturnObject = {};
	Bridge.FindBridge(function(status)
	{
		// Check bridge connection status
		ReturnObject.HueFound = ( Bridge.DiscoveredBridge.HueIpAddress == null ) ? false : true;
		ReturnObject.HueRegistered = Bridge.DiscoveredBridge.HueRegistered;

		ReturnObject.LightsCycle = LightCycle;
		ReturnObject.LightsOn = false;
		ReturnObject.Profile = null;

		// Get current light state
		if( ReturnObject.HueFound && ReturnObject.HueRegistered )
		{
			var ThisBridge = Bridge.GetAPIHandle();
			ThisBridge.lights(function(err, bulbs) 
			{
				if( !err )
				{
					var TotalBulbs = 0;
					var ProcessedBulbs = 0;

					(bulbs.lights).forEach(function(value) 
					{
						if( !LightGroup.length || ( LightGroup.length && (LightGroup.indexOf(value.id) != -1) ) )
						{
							TotalBulbs = TotalBulbs + 1;
							ThisBridge.getLightStatus(value.id, function(err, result) 
							{
								if( !err && ( result.state.on == true ) )
								{
									ReturnObject.LightsOn = true;
								}

								ProcessedBulbs = ProcessedBulbs + 1;
								if( ProcessedBulbs == TotalBulbs )
								{
									if( !ReturnObject.LightsOn && LightCycle ) LightCycle = false;
									return Common.Output(res, JSON.stringify(ReturnObject));
								}
							});
						}
					});
				}
			});			
		}
		else
		{
			return Common.Output(res, JSON.stringify(ReturnObject));
		}
	});	
}

Functions.LightSelection = function(res)
{
	var ReturnObject = 
	{
		Selected: []
	};

	Database.Conn.query("SELECT value FROM `settings` WHERE name = 'light-selection'", function(err, rows, fields) 
	{
		if( rows[0] && ( rows[0].value ).length > 0 )
		{
			var SelectedLights = rows[0].value.split(',');
			ReturnObject.Selected = SelectedLights;
		}

		LightGroup = ReturnObject.Selected;
		return Common.Output(res, JSON.stringify(ReturnObject));
	});	
}

Functions.UpdateLightSelection = function(res, URLPath)
{
	var LightSelection = decodeURI(URLPath[3]);

	LightGroup = LightSelection.split(",");
	Database.Conn.query("UPDATE `settings` SET value = " + Database.Conn.escape(LightSelection) + " WHERE name = 'light-selection'");

	var ReturnObject = { Success: true };
	return Common.Output(res, JSON.stringify(ReturnObject));
}

Functions.Register = function(res)
{
	var ReturnObject = {};
	Bridge.BridgeStatus(function(status)
	{
		// Check current registration status
		if( status === true )
		{
			ReturnObject.Registered = true;
			ReturnObject.Message = "Hue Bridge already registered!";
			return Common.Output(res, JSON.stringify(ReturnObject));
		}

		// Call Registration
		Bridge.Register(function(status2)
		{
			if( status2 === true )
			{
				ReturnObject.Registered = true;
				ReturnObject.Message = "Hue Bridge registered successfully.";
				return Common.Output(res, JSON.stringify(ReturnObject));
			}
			
			ReturnObject.Registered = false;
			ReturnObject.Message = "Hue Bridge registration failed";
			return Common.Output(res, JSON.stringify(ReturnObject));		
		});
	});
}

Functions.Shutdown = function(res, HueSettings)
{
	var ReturnObject = 
	{
		success: false,
		message: ""
	};

	var ThisBridge = Bridge.GetAPIHandle();
	var LightState = Bridge.GetHue().lightState.create().off();

	ThisBridge.lights(function(err, bulbs) 
	{
		if( !err )
		{
			// Change each lights state
			(bulbs.lights).forEach(function(value) 
			{
				// Shut down lights inside our specified group
				if( LightGroup.length && (LightGroup.indexOf(value.id) != -1) ) ThisBridge.setLightState(value.id, LightState);
			});

			LightCycle = false;
			ReturnObject.success = true;
			return Common.Output(res, JSON.stringify(ReturnObject));
		}

		// Light error
		ReturnObject.message = err;
		ReturnObject.success = false;
		
		Common.log(3, "Light Error", err);
		return Common.Output(res, JSON.stringify(ReturnObject));
	});
}

Functions.Startup = function(res, HueSettings)
{
	var ReturnObject = 
	{
		success: false,
		message: ""
	};

	Database.Conn.query("SELECT value FROM `settings` WHERE name = 'default-state'", function(err, rows, fields) 
	{
		var LightState = ['100', '100'];
		if( rows[0] && ( rows[0].value ).length > 0 )
		{
			var DefaultState = rows[0].value;
			LightState = DefaultState.split(',');
		}
		else
		{
			Database.Conn.query("INSERT INTO `settings` VALUES ('default-state', '100,100')");
		}

		var ThisBridge = Bridge.GetAPIHandle();
		var LightState = Bridge.GetHue().lightState.create().on().white(LightState[1], LightState[0]);
		ThisBridge.lights(function(err, bulbs) 
		{
			if( !err )
			{
				// Change each lights state
				(bulbs.lights).forEach(function(value) 
				{
					// Enable lights inside our specified group
					if( LightGroup.length && (LightGroup.indexOf(value.id) != -1) ) ThisBridge.setLightState(value.id, LightState);
				});

				LightCycle = false;
				ReturnObject.success = true;
				return Common.Output(res, JSON.stringify(ReturnObject));
			}

			// Light error
			ReturnObject.message = err;
			ReturnObject.success = false;
			
			Common.log(3, "Light Error", err);
			return Common.Output(res, JSON.stringify(ReturnObject));
		});
	});
}

Functions.Cycle = function(res, HueSettings)
{
	var ReturnObject = 
	{
		success: false,
		message: ""
	};

	Database.Conn.query("SELECT value FROM `settings` WHERE name = 'default-state'", function(err, rows, fields) 
	{
		var LightState = ['100', '100'];
		if( rows[0] && ( rows[0].value ).length > 0 )
		{
			var DefaultState = rows[0].value;
			LightState = DefaultState.split(',');
		}

		var ThisBridge = Bridge.GetAPIHandle();
		var LightState = Bridge.GetHue().lightState.create().on().saturation(100).colorLoop();

		ThisBridge.lights(function(err, bulbs) 
		{
			if( !err )
			{
				// Change each lights state
				(bulbs.lights).forEach(function(value) 
				{
					// Enable cycle lights inside our specified group
					if( LightGroup.length && (LightGroup.indexOf(value.id) != -1) ) ThisBridge.setLightState(value.id, LightState);
				});

				LightCycle = true;
				ReturnObject.success = true;
				return Common.Output(res, JSON.stringify(ReturnObject));
			}

			// Light error
			ReturnObject.message = err;
			ReturnObject.success = false;
			
			Common.log(3, "Light Error", err);
			return Common.Output(res, JSON.stringify(ReturnObject));
		});
	});
}

Functions.CreateProfile = function(res, URLPath)
{
	var JSONData = JSON.parse(decodeURI(URLPath[3]));
	var ReturnData =
	{
		success: false,
		message: ""
	};

	var LightData = [];
	var TotalLights = 0;
	var ThisBridge = Bridge.GetAPIHandle();

	var thisTimeout = setTimeout(function()
	{
		if( TotalLights == JSONData.SelectedLights.length ) return;

		ReturnData.success = false;
		ReturnData.message = "Unable to load current light states";
		Common.Output(res, JSON.stringify(ReturnData));
	}, 5000);

	JSONData.SelectedLights.forEach(function(value)
	{
		ThisBridge.getLightStatus(value, function(err, result) 
		{
			if( !err )
			{
				LightData.push(
				{
					id: value,
					state: result.state
				});
			}

			TotalLights = TotalLights + 1;
			if( TotalLights == JSONData.SelectedLights.length )
			{
				clearTimeout(thisTimeout);
				Common.log(1, "Save", "Saved new profile named '" + JSONData.ProfileName + "' to database");
				Database.Conn.query("INSERT INTO profiles (name, data) VALUES (" + Database.Conn.escape(JSONData.ProfileName) + ",'" + JSON.stringify(LightData) + "')");

				ReturnData.success = true;
				Common.Output(res, JSON.stringify(ReturnData));
			}
		});
	});
}

Functions.DeleteProfile = function(res, URLPath)
{
	var ProfileID = parseInt(URLPath[3]);
	Database.Conn.query("DELETE FROM profiles WHERE id = '" + Database.Conn.escape(ProfileID) + "'", function(err, rows, fields) 
	{
		Common.log(1, "Delt", "Deleting profile with id: " + ProfileID);
		Common.Output(res, "Success");
	});
}

Functions.Profiles = function(res) 
{
	Database.Conn.query("SELECT * FROM profiles", function(err, rows, fields) 
	{
		var ReturnData = [];
		rows.forEach(function(value)
		{
			ReturnData.push(
			{
				ProfileID: value.id,
				ProfileName: value.name,
				ProfileActive: false
			});
		});

		Common.Output(res, JSON.stringify(ReturnData));
	});
}

Functions.ApplyProfile = function(res, URLPath)
{
	var ProfileID = parseInt(URLPath[3]);
	var ReturnData =
	{
		success: false,
		message: ""
	};

	// Retrieve Light ID
	Database.Conn.query("SELECT * FROM profiles WHERE id = '" + Database.Conn.escape(ProfileID) + "'", function(err, rows, fields)
	{
		var ThisBridge = Bridge.GetAPIHandle();
		if( rows.length >= 1 )
		{
			Common.log(0, "Info", "Applying profile: " + rows[0].name);
			var LightData = JSON.parse(rows[0].data);

			LightData.forEach(function(value)
			{
				ThisBridge.setLightState(value.id, value.state);
			});

			ReturnData.success = true;
			Common.Output(res, JSON.stringify(ReturnData));
		}
		else
		{
			ReturnData.message = "Unknown Profile";
			Common.Output(res, JSON.stringify(ReturnData));
		}
	});
}