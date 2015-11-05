$(document).ready(function()
{
	// Function Definitions and Values
	var HueAvailable = false;
	var ArraySearch = function(array, lightId)
	{
		var ReturnValue = -1;
		$.each(array, function(key, value)
		{
			if( value.ProfileID == lightId ) ReturnValue = key;
		});

		return ReturnValue;
	};

	var PollingCallbacks = 
	{
		PollStatus: function()
		{
			$.ajax(
			{
				url: "/Control/GetStatus",
				dataType: "json",

				success: function(data)
				{
					if( data.HueFound && data.HueRegistered )
					{
						// Everything is OK
						window.setTimeout(PollingCallbacks.PollStatus, 5000);
						$(".HueRegistration").hide();
						$(".HueFailed").hide();

						if( data.LightsCycle && data.LightsOn )
						{
							$(".btn-lightsoff, .btn-lightson").removeClass("btn-success").addClass("btn-default");
							$(".btn-lightscycle").removeClass("btn-default").addClass("btn-success");					
						}
						else if( data.LightsOn )
						{
							$(".btn-lightsoff, .btn-lightscycle").removeClass("btn-success").addClass("btn-default");
							$(".btn-lightson").removeClass("btn-default").addClass("btn-success");
						}
						else
						{
							$(".btn-lightson, .btn-lightscycle").removeClass("btn-success").addClass("btn-default");
							$(".btn-lightsoff").removeClass("btn-default").addClass("btn-success");
						}

						HueAvailable = true;
						return;
					}
					else if( data.HueFound && !data.HueRegistered )
					{
						// Not registered to this Hue Bridge
						$(".HueRegistration").show();
						var Timer = 50;

						// Define Callbacks
						var RegFunction = function()
						{
							if( HueAvailable )
							{
								// Hue Registration Complete
								$(".HueRegistration").hide();
								location.reload();
							}

							Timer = ( Timer - 1 );
							$(".progress-bar").css("width", Timer*2 + "%");

							if( (Timer <= 0) && !HueAvailable ) { $(".HueRegistration").hide(); alert("Timeout exceeded. Please reload and try again"); }
							else if( (Timer > 0) && !HueAvailable ) window.setTimeout(RegFunction, 1000);
						};

						var CallbackFunction = function(data2)
						{
							if( data2.Registered == true ) HueAvailable = true;
							else if( Timer > 0 ) window.setTimeout(function() 
							{
								$.ajax(
								{
									dataType: "json",
									url: "/Control/Register",
									success: CallbackFunction
								});
							}, 2000);
						};

						// Fire off our callbackss
						window.setTimeout(RegFunction, 1000);
						$.ajax(
						{
							dataType: "json",
							url: "/Control/Register",
							success: CallbackFunction
						});
					}
					else
					{
						// No Hue Bridge
						$(".HueFailed").show();
					}
				},
				fail : function()
				{
					// Command Error
					alert("Whoops. A problem occoured setting up the connection to your bridge");
				}
			});
		},
		LightSelection: function()
		{
			$.ajax(
			{
				url: "/Control/LightSelection",
				dataType: "json",

				success: function(data)
				{
					var EnabledLights = data.Selected;
					
					// Light Selection
					$(".btn-bulbselect").removeClass("btn-success");
					$(".btn-bulbselect").each(function()
					{
						var thisButton = $(this);
						if( EnabledLights.indexOf(thisButton.attr("data-bulbid")) != -1 )
						{
							thisButton.removeClass("btn-default").addClass("btn-success");
						}
					})

					// Set next update interval
					window.setTimeout(PollingCallbacks.LightSelection, 5000);
				},
				fail : function()
				{
					// Command Error
					alert("Whoops. A problem occoured setting up the connection to your bridge");
				}
			});		
		},
		ProfileList: function()
		{
			$.ajax(
			{
				url: "/Control/Profiles",
				dataType: "json",

				success: function(data)
				{
					$(".ProfileWell").each(function()
					{
						var thisButton = $(this);

						var LightID = parseInt(thisButton.attr("data-profileid"));
						var ArrayIndex = ArraySearch(data, LightID);
						if( ArrayIndex != -1 )
						{
							var ProfileData = data[ ArrayIndex ];
							if( !ProfileData )
							{
								// Remove button for non-existant profile
								thisButton.remove();
							}
							else
							{
								// Update this button
								thisButton.html(ProfileData.ProfileName);

								if( ProfileData.ProfileActive && !thisButton.hasClass("profileActive") ) thisButton.addClass("profileActive");
								else if( !ProfileData.ProfileActive && thisButton.hasClass("profileActive") ) thisButton.removeClass("profileActive");
							}

							// Remove Entry from Array
							data.splice(ArrayIndex, 1);
						}
					});

					$.each(data, function(key, value)
					{
						var NewButton = '<div class="well ProfileWell" data-profileid="' + value.ProfileID + '">' + value.ProfileName + '</div>';
						$(".ProfileUnit").append(NewButton);
					});

					// Set next update interval
					window.setTimeout(PollingCallbacks.ProfileList, 5000);
				},
				fail : function()
				{
					// Command Error
					alert("Whoops. A problem occoured setting up the connection to your bridge");
				}
			});	
		}
	};

	// Initiate Callbacks
	PollingCallbacks.LightSelection();
	PollingCallbacks.ProfileList();
	PollingCallbacks.PollStatus();

	// Quick Lighting Buttons
	$(".btn-lightsoff").on("click", function()
	{
		if( !HueAvailable ) return;
		$.ajax(
		{
			url: "/Control/Shutdown",
			dataType: "json",

			success: function(data)
			{
				if( data.success === true )
				{
					$(".btn-lightson, .btn-lightscycle").removeClass("btn-success").addClass("btn-default");
					$(".btn-lightsoff").removeClass("btn-default").addClass("btn-success");
					return;
				}

				// Command Error
				alert("Unable to complete command:\r\n" + data.message);
			},
			fail : function()
			{
				// Command Error
				alert("Unexpected error occoured sending the request");
			}
		});
	});

	$(".btn-lightson").on("click", function()
	{
		if( !HueAvailable ) return;
		$.ajax(
		{
			url: "/Control/Startup",
			dataType: "json",

			success: function(data)
			{
				if( data.success === true )
				{
					$(".btn-lightsoff, .btn-lightscycle").removeClass("btn-success").addClass("btn-default");
					$(".btn-lightson").removeClass("btn-default").addClass("btn-success");
					return;
				}

				// Command Error
				alert("Unable to complete command:\r\n" + data.message);
			},
			fail : function()
			{
				// Command Error
				alert("Unexpected error occoured sending the request");
			}
		});
	});

	$(".btn-lightscycle").on("click", function()
	{
		if( !HueAvailable ) return;
		$.ajax(
		{
			url: "/Control/Cycle",
			dataType: "json",

			success: function(data)
			{
				if( data.success === true )
				{
					$(".btn-lightsoff, .btn-lightson").removeClass("btn-success").addClass("btn-default");
					$(".btn-lightscycle").removeClass("btn-default").addClass("btn-success");
					return;
				}

				// Command Error
				alert("Unable to complete command:\r\n" + data.message);
			},
			fail : function()
			{
				// Command Error
				alert("Unexpected error occoured sending the request");
			}
		});
	});

	// Light selection
	$(".btn-bulbselect").on("click", function()
	{
		if( !HueAvailable ) return;

		// Update Button Selection
		if( $(this).hasClass("btn-success") ) $(this).removeClass("btn-success").addClass("btn-default");
		else $(this).removeClass("btn-default").addClass("btn-success");

		// Get list of active lights
		var LightSelection = [];
		$(".btn-bulbselect").each(function()
		{
			var thisButton = $(this);
			if( thisButton.hasClass("btn-success") ) LightSelection.push(thisButton.attr("data-bulbid"));
		});

		$.ajax("/Control/UpdateLightSelection/" + LightSelection.join(","));
	});

	// Create Profile
	$(".btn-saveprofile").on("click", function()
	{
		if( !HueAvailable ) return;
		$(".btn-theselights").removeClass("btn-success").addClass("btn-default");
		$("#profilename").val("");

		$(".CreateProfile").show();
	});

	$(".ExitButton").on("click", function()
	{
		$(".HuePopup").hide();
	});

	// Virtual Keyboard
	var firstInit = true;
	$(".VirtualKeyboard").on("click", ".btn", function()
	{
		var targetContainer = $( $(this).parent().attr("data-target") );
		var thisKey = $(this).html();

		if( thisKey.toLowerCase() == "↑" )
		{
			// Shift the keyboard
			var tKey = $(this);
			if( tKey.hasClass("btn-success") )
			{
				tKey.removeClass("btn-success").addClass("btn-default");
				$(".VirtualKeyboard .btn").each(function()
				{
					var ttKey = $(this);
					if( ttKey.html() != "↑" && ttKey.html() != "SPACE" ) ttKey.html(ttKey.html().toLowerCase());
				});
			}
			else
			{
				tKey.removeClass("btn-default").addClass("btn-success");
				$(".VirtualKeyboard .btn").each(function()
				{
					var ttKey = $(this);
					if( ttKey.html() != "↑" && ttKey.html() != "SPACE" ) ttKey.html(ttKey.html().toUpperCase());
				});				
			}
		}
		else if( thisKey.toLowerCase() == "←" )
		{
			// Backspace
			var CurrentString = targetContainer.val();
			targetContainer.val( CurrentString.substring(0, CurrentString.length - 1) );
		}
		else if( thisKey.toLowerCase() == "space" )
		{
			// Apply space!
			targetContainer.val( targetContainer.val() + " " );
		}
		else
		{
			// Append the key pressed into the box
			targetContainer.val( targetContainer.val() + thisKey );
		}

		if( firstInit && ( thisKey.toLowerCase() != "←" && thisKey.toLowerCase() != "space" ) )
		{
			firstInit = false;
			var tKey = $("#shiftButton");
			if( tKey.hasClass("btn-success") )
			{
				tKey.removeClass("btn-success").addClass("btn-default");
				$(".VirtualKeyboard .btn").each(function()
				{
					var ttKey = $(this);
					if( ttKey.html() != "↑" && ttKey.html() != "SPACE" ) ttKey.html(ttKey.html().toLowerCase());
				});
			}
		}
	});

	// Light Selector
	$(".btn-theselights").on("click", function() 
	{
		if( $(this).hasClass("btn-success") ) $(this).removeClass("btn-success").addClass("btn-default");
		else $(this).removeClass("btn-default").addClass("btn-success");		
	});

	// Save Profile
	$(".btn-initsave").on("click", function()
	{
		if( !HueAvailable ) return;

		var ReturnData = 
		{
			ProfileName: $("#profilename").val(),
			SelectedLights: []
		};

		$(".btn-theselights").each(function()
		{
			var thisLight = $(this);
			if( thisLight.hasClass("btn-success") ) ReturnData.SelectedLights.push(thisLight.attr("data-bulbid"));
		});

		if( ReturnData.SelectedLights.length <= 0 )
		{
			alert("Please select some lights to save on this profile!");
			return;
		}

		var ReturnJson = JSON.stringify(ReturnData);
		$.ajax(
		{
			url: "/Control/CreateProfile/" + ReturnJson,
			dataType: "json",

			success: function(data)
			{
				if( data.success )
				{
					$(".CreateProfile").hide();
					return;
				}

				alert("Unable to create profile:\r\n" + data.message);
			},
			fail: function()
			{
				alert("Unable to create profile!");
			}
		});
	});

	// Profile Delete
	var DoubleActive = false;
	$(".ProfileUnit").on("dblclick", ".ProfileWell", function()
	{
		if( !DoubleActive )
		{
			DoubleActive = true;
			$(".ShowWarning").show();

			window.setTimeout(function()
			{
				DoubleActive = false;
				$(".ShowWarning").hide();
			}, 10000);
		}
		else
		{
			var thisButton = $(this);
			var ProfileID = thisButton.attr("data-profileid");

			DoubleActive = false;
			$(".ShowWarning").hide();

			$.ajax("/Control/DeleteProfile/" + ProfileID);
			thisButton.remove();
		}
	});

	// Apply Profile
	$(".ProfileUnit").on("click", ".ProfileWell", function()
	{
		var thisButton = $(this);
		var ProfileID = thisButton.attr("data-profileid");
		$.ajax("/Control/ApplyProfile/" + ProfileID);	
	});

	// Settings Buttons
	if( $(".enable").length > 0 )
	{
		$(".enable").on('click', function() {
			var ElementName = $(this).attr("data-buttonvalue");
			$("#" + ElementName).val("1");

			$(this).removeClass('btn-default').addClass('btn-success');
			$('*[data-buttonvalue="' + ElementName + '"]').filter(".btn-danger").removeClass('btn-danger').addClass('btn-default');
		});

		$(".disable").on('click', function() {
			var ElementName = $(this).attr("data-buttonvalue");
			$("#" + ElementName).val("0");

			$(this).removeClass('btn-default').addClass('btn-danger');
			$('*[data-buttonvalue="' + ElementName + '"]').filter(".btn-success").removeClass('btn-success').addClass('btn-default');
		});
	}

	// Save Settings
	$(".btn-savesettings").on("click", function() 
	{
		// Update Settings
		var SettingData = 
		[
			["remote-access", $("#remote-access").val()],
			["remote-settings", $("#remote-settings").val()],
			["default-state", $("#defaultlight-bri").val() + "," + $("#defaultlight-hue").val()]
		];

		var UpdateData = JSON.stringify(SettingData);
		$.ajax(
		{
			url: "/Settings/UpdateSettings/" + UpdateData,
			dataType: "json",

			success: function(data)
			{
				if( !data.success )
				{
					alert("Unable to save settings:\r\n" + data.message);
				}
			},
			fail: function()
			{
				alert("Unable to save settings!");
			}
		});
	});

	// Rename Light
	$("body").on("click", ".btn-bulbrename", function()
	{
		if( !HueAvailable ) return;

		var ThisButtonID = $(this).attr("data-bulbid");
		var ThisButtonName = $(this).html();

		$(".ChangeName .lightname").html(ThisButtonName);
		$(".ChangeName #lightid").val(ThisButtonID);

		$(".ChangeName").show();
		$(".ChangeName #lightname").val("").focus();
	});

	// Save Light Rename
	$("body").on("click", ".btn-lightsave", function()
	{
		var NewValues = 
		{
			LightID: 	$("#lightid").val(),
			LightName: 	$("#lightname").val() 
		};

		var NewData = JSON.stringify(NewValues);
		$.ajax(
		{
			url: "/Settings/UpdateLight/" + NewData,
			dataType: "json",

			success: function(data)
			{
				if( !data.success )
				{
					alert("Unable to save settings:\r\n" + data.message);
					return;
				}

				location.reload();
			},
			fail: function()
			{
				alert("Unable to save settings!");
			}
		});
	});

	// Disconnect Bridge
	$(".btn-huedisconnect").on("click", function()
	{
		if( confirm("Are you sure you want to disconnect from Hue?") === true )
		{
			$.ajax(
			{
				url: "/Settings/Disconnect",
				dataType: "json",

				success: function(data)
				{
					if( !data.success )
					{
						alert("Unable to disconnect:\r\n" + data.message);
						return;
					}

					alert("Raspihue Will now reload.");
					window.location = "/";
				},
				fail: function()
				{
					alert("Unable to disconnect!");
				}
			});
		}
	});

	// Reset Hue
	$(".btn-huereset").on("click", function()
	{
		if( confirm("Are you sure you want to reset RaspiHue?") === true )
		{
			$.ajax(
			{
				url: "/Settings/Reset",
				dataType: "json",

				success: function(data)
				{
					if( !data.success )
					{
						alert("Unable to reset:\r\n" + data.message);
						return;
					}

					alert("Raspihue Will now reset.");
					window.location = "/";
				},
				fail: function()
				{
					alert("Unable to reset!");
				}
			});
		}
	});
});