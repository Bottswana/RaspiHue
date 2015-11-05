/*
	RaspiHue - Touch screen Hue controller for Raspberry Pi.
	Control your Hue lights in one easy press.

	Bridge Code
*/

var Bridge = {};
Bridge.DiscoveredBridge = 
{
	HueRegistered: false,
	HueIpAddress: null,
	HueUsername: null,
}


var Database 	= require('../Core/Database').Database;
var Common		= require('../Core/Common').Common;
var HueApi 		= require("node-hue-api");


Bridge.BridgeStatus = function(callbackFunction)
{
	if( !Bridge.DiscoveredBridge.HueRegistered || !Bridge.DiscoveredBridge.HueIpAddress  || !Bridge.DiscoveredBridge.HueUsername ) return callbackFunction(false);
	var ThisBridge = new HueApi.HueApi(Bridge.DiscoveredBridge.HueIpAddress, Bridge.DiscoveredBridge.HueUsername);

	ThisBridge.lightStatus(999).fail(function(Ex)
	{
		// Query light status from the bridge and check the failed response, if there is one.
		if( Ex.message == "unauthorized user" )
		{
			Bridge.DiscoveredBridge.HueUsername = null;
			return callbackFunction(false);			
		}
		else if( Ex.message == "connect EHOSTUNREACH" )
		{
			Bridge.DiscoveredBridge.HueIpAddress = null;
			Bridge.DiscoveredBridge.HueUsername = null;
			return callbackFunction(false);		
		}

		if( Ex.message.indexOf("lights/999, not available") != -1 )
		{
			// Connection is working as expected (Unless we have a light 999? xD)
			return callbackFunction(true);
		}

		// Unknown Error
		return callbackFunction(false);
	});
}

Bridge.FindBridge = function(callbackFunction)
{
	Bridge.BridgeStatus(function(connectStatus) 
	{
		// Checking bridge status
		if( connectStatus === true ) return callbackFunction(true);
		HueApi.nupnpSearch().then(function(bridge)
		{
			if( bridge.length > 1 ) Common.log(2, "Warn", "More than one Hue Bridge detected. RaspiHue is only designed to work with one!");
			var PrimaryBridge = bridge[0];

			if( ( PrimaryBridge != undefined ) && PrimaryBridge.ipaddress )
			{
				// Look up Hue Username from the database
				Common.log(1, "Init", "Found Hue bridge at address: " + PrimaryBridge.ipaddress);
				Database.Conn.query("SELECT value FROM `settings` WHERE name = 'hue-username'", function(err, rows, fields) 
				{
					if(err) Common.log(3, "Error", "Unable to retrieve hue registration: " + err.Message);
					Bridge.DiscoveredBridge.HueIpAddress = PrimaryBridge.ipaddress;
					
					if( rows[0] && (rows[0].value).length > 0 )
					{
						// Verify Bridge Connection
						var ThisBridge = new HueApi.HueApi(Bridge.DiscoveredBridge.HueIpAddress, rows[0].value);
						ThisBridge.lightStatus(999).fail(function(Ex) 
						{
							// Query light status from the bridge and check the failed response, if there is one.
							if( Ex.message == "unauthorized user" )
							{
								Bridge.DiscoveredBridge.HueUsername = null;
								return callbackFunction(false);			
							}
							else if( Ex.message == "connect EHOSTUNREACH" )
							{
								Bridge.DiscoveredBridge.HueIpAddress = null;
								Bridge.DiscoveredBridge.HueUsername = null;

								Common.log(2, "Warn", "Unable to connect to the Bridge. Marking connection as offline");
								return callbackFunction(false);		
							}

							if( Ex.message.indexOf("lights/999, not available") != -1 )
							{
								// Connection is working as expected
								Bridge.DiscoveredBridge.HueUsername = rows[0].value;
								Bridge.DiscoveredBridge.HueRegistered = true;

								Common.log(1, "Init", "Authenticated with Bridge successfully!");
								return callbackFunction(true);
							}

							// Unknown Error
							return callbackFunction(false);
						});
					}
					else
					{
						// No Saved Password
						Common.log(0, "Info", "No authentication details saved for this bridge.");
						Bridge.DiscoveredBridge.HueRegistered = false;
						return callbackFunction(false);
					}
				});
			}
			else
			{
				Common.log(2, "Warning", "Unable to discover a Hue Bridge on the network!");
				Bridge.DiscoveredBridge.HueIpAddress = null;
				Bridge.DiscoveredBridge.HueUsername = null;
				return callbackFunction(false);
			}
		}).done();
	});
}

Bridge.Register = function(callbackFunction)
{
	if( !Bridge.DiscoveredBridge.HueIpAddress )
	{
		// No bridge to register with
		return callbackFunction(false);	
	}
	else if( Bridge.DiscoveredBridge.HueRegistered )
	{
		// Already registered with the bridge
		return callbackFunction(true);	
	}

	// Register Hue
	var ThisBridge = new HueApi.HueApi();
	Common.log(0, "Regn", "Attempting registration with HUE Bridge...");

	ThisBridge.registerUser(Bridge.DiscoveredBridge.HueIpAddress, null, "RaspiHue Control Platform")
	.then(function(returnData) 
	{
		// Successful Registration
		Bridge.DiscoveredBridge.HueRegistered = true;
		Bridge.DiscoveredBridge.HueUsername = returnData;

		Database.Conn.query("REPLACE INTO `settings` (name, value) VALUES ('hue-username', '" + returnData + "')");
		Common.log(1, "Regn", "Registration success, Key: " + returnData);
		return callbackFunction(true);
	})
	.fail(function(returnData) 
	{
		// Failed Registration
		Bridge.DiscoveredBridge.HueRegistered = false;

		Common.log(2, "Regn", "Registration failed: " + returnData.message);
		return callbackFunction(false);
	});
}

Bridge.GetAPIHandle = function()
{
	return new HueApi.HueApi(Bridge.DiscoveredBridge.HueIpAddress, Bridge.DiscoveredBridge.HueUsername);
}

Bridge.GetHue = function()
{
	return HueApi;
}


exports.Bridge = Bridge;