{% extends 'layout.tpl' %}

{% block content %}
		<!-- Nav Container -->
		<nav class="navbar navbar-inverse navbar-fixed-top">
			<div class="container">
				<div class="navbar-header">
					<a class="navbar-brand" href="/">RaspiHue</a>
				</div>

				<div id="navbar">
					<ul class="nav navbar-nav">
						<li><a href="/Control">Home</a></li>
						<li class="active"><a href="/Settings">Settings</a></li>
					</ul>
				</div>
			</div>
		</nav>

		<!-- Main Page -->
		<div class="container" role="main" style="padding-top: 40px;">

			<!-- General Settings -->
			<div class="page-header"> 
				<h1 style="font-size:26px; position:relative; top:10px; display:inline-block">General Settings</h1>
			</div>
			<p>Your RaspiHue IP Address is: {{ IPAddress }}</p><br />

			<div class="row" style="margin-bottom:10px">
				<div class="col-md-3" style="padding-top: 5px; font-weight:bold;"><a href="#" class="Help" title="Allow access to the RaspiHue webpage via other web-browsers on the network">(?)</a> Allow Remote Access:</div>
				<div class="col-md-6 switcher">
					{% if Settings['remote-access'] %}
					<button class="btn btn-success left enable" type="button" data-buttonvalue="remote-access">On</button>
					<button class="btn btn-default right disable" type="button" data-buttonvalue="remote-access">Off</button>
					<input type="hidden" id="remote-access" value="1" />
					{% else %}
					<button class="btn btn-default left enable" type="button" data-buttonvalue="remote-access">On</button>
					<button class="btn btn-danger right disable" type="button" data-buttonvalue="remote-access">Off</button>
					<input type="hidden" id="remote-access" value="0" />
					{% endif %}
				</div>
			</div>

			<div class="row" style="margin-bottom:10px">
				<div class="col-md-3" style="padding-top: 5px; font-weight:bold;"><a href="#" class="Help" title="Allow setting change via other web-browsers on the network. Requires Allow Remote Access">(?)</a> Allow Remote Settings:</div>
				<div class="col-md-6 switcher">
					{% if Settings['remote-settings'] %}
					<button class="btn btn-success left enable" type="button" data-buttonvalue="remote-settings">On</button>
					<button class="btn btn-default right disable" type="button" data-buttonvalue="remote-settings">Off</button>
					<input type="hidden" id="remote-settings" value="1" />
					{% else %}
					<button class="btn btn-default left enable" type="button" data-buttonvalue="remote-settings">On</button>
					<button class="btn btn-danger right disable" type="button" data-buttonvalue="remote-settings">Off</button>
					<input type="hidden" id="remote-settings" value="0" />
					{% endif %}
				</div>
			</div><br />

			<div class="row" style="margin-bottom:10px">
				<div class="col-md-3" style="padding-top: 5px; font-weight:bold;"><a href="#" class="Help" title="Default Brightness and Warmth settings when using Lights On">(?)</a> Default 'on' Light State:</div>
				<div class="col-md-6 switcher">
					Bri: <input type="number" id="defaultlight-bri" value="{{ Settings['default-state'][0] }}" min="0" max="100" step="1" style="width:50px;text-align:center" /> &nbsp; 
					Temp: <input type="number" id="defaultlight-hue" value="{{ Settings['default-state'][1] }}" min="154" max="500" step="1" style="width:50px;text-align:center" />
				</div>
			</div>

			<br /><button type="button" class="btn btn-default btn-savesettings">Save Changes</button>

			<!-- Renaming Light Names -->
			<div class="page-header"> 
				<h1 style="font-size:26px; position:relative; top:10px; display:inline-block">Rename Lights</h1>
			</div>

			<p>Select the light you want to rename and enter the new name via the on-screen keyboard</p><br />
			<p>
				{% for light in Lights %}
				<button type="button" class="btn btn-default btn-bulbrename" data-bulbid="{{ light.id }}" style="margin-right:10px">{{ light.name }}</button>
				{% endfor %}
			</p>


			<!-- Disconnect from Bridge -->
			<div class="page-header"> 
				<h1 style="font-size:26px; position:relative; top:10px; display:inline-block">Bridge Disconnect</h1>
			</div>

			<p>Use the following options to disconnect RaspiHue from a bridge, or reset RaspiHue entirely</p><br />
			<p>
				<button type="button" class="btn btn-default btn-danger btn-huedisconnect" style="margin-right:10px">Disconnect Bridge</button>
				<button type="button" class="btn btn-default btn-danger btn-huereset">Reset RaspiHue</button>
			</p>

		</div>

		<!-- Bulb Rename -->
		<div class="ChangeName HuePopup" style="height:300px; top:calc(50% - 190px);">
			<div class="row">

				<div class="col-md-12" style="padding: 0px 40px;">
					<div class="ExitButton" style="float:right"> </div>
					
					<h2 style="font-size:24px !important;"> Light Rename </h2>
					<p style="font-size:12px !important;">
						You have selected the light named: <i><span class="lightname">Unknown</span></i><br />
						Enter the new name for this light below.
					</p>

					<p> <input type="text" id="lightname" style="width:400px; margin-top:10px;" /> </p><br />
					<input type="hidden" id="lightid" value="" />

					<div class="VirtualKeyboard" style="margin-top:-10px;" data-target="#lightname">
						<button type="button" class="btn btn-default" style="width:30px; margin-right:5px; padding-left:9px;">Q</button>
						<button type="button" class="btn btn-default" style="width:30px; margin-right:5px; padding-left:9px;">W</button>
						<button type="button" class="btn btn-default" style="width:30px; margin-right:5px; padding-left:9px;">E</button>
						<button type="button" class="btn btn-default" style="width:30px; margin-right:5px; padding-left:9px;">R</button>
						<button type="button" class="btn btn-default" style="width:30px; margin-right:5px; padding-left:9px;">T</button>
						<button type="button" class="btn btn-default" style="width:30px; margin-right:5px; padding-left:9px;">Y</button>
						<button type="button" class="btn btn-default" style="width:30px; margin-right:5px; padding-left:9px;">U</button>
						<button type="button" class="btn btn-default" style="width:30px; margin-right:5px; padding-left:9px;">I</button>
						<button type="button" class="btn btn-default" style="width:30px; margin-right:5px; padding-left:9px;">O</button>
						<button type="button" class="btn btn-default" style="width:30px; margin-right:30px; padding-left:9px;">P</button>

						<button type="button" class="btn btn-default" style="width:30px; margin-right:30px; padding-left:9px;">←</button>

						<button type="button" class="btn btn-default" style="width:30px; margin-right:5px; padding-left:9px;">7</button>
						<button type="button" class="btn btn-default" style="width:30px; margin-right:5px; padding-left:9px;">8</button>
						<button type="button" class="btn btn-default" style="width:30px; margin-right:5px; padding-left:9px;">9</button>

						<div style="height:10px; width:1px;"></div>

						<button type="button" class="btn btn-default btn-success" style="width:30px; margin-right:5px; padding-left:9px;" id="shiftButton">↑</button>
						<button type="button" class="btn btn-default" style="width:30px; margin-right:5px; padding-left:9px;">A</button>
						<button type="button" class="btn btn-default" style="width:30px; margin-right:5px; padding-left:9px;">S</button>
						<button type="button" class="btn btn-default" style="width:30px; margin-right:5px; padding-left:9px;">D</button>
						<button type="button" class="btn btn-default" style="width:30px; margin-right:5px; padding-left:9px;">F</button>
						<button type="button" class="btn btn-default" style="width:30px; margin-right:5px; padding-left:9px;">G</button>
						<button type="button" class="btn btn-default" style="width:30px; margin-right:5px; padding-left:9px;">H</button>
						<button type="button" class="btn btn-default" style="width:30px; margin-right:5px; padding-left:9px;">J</button>
						<button type="button" class="btn btn-default" style="width:30px; margin-right:5px; padding-left:9px;">K</button>
						<button type="button" class="btn btn-default" style="width:30px; margin-right:95px; padding-left:9px;">L</button>

						<button type="button" class="btn btn-default" style="width:30px; margin-right:5px; padding-left:9px;">4</button>
						<button type="button" class="btn btn-default" style="width:30px; margin-right:5px; padding-left:9px;">5</button>
						<button type="button" class="btn btn-default" style="width:30px; margin-right:5px; padding-left:9px;">6</button>

						<div style="height:10px; width:1px;"></div>

						<button type="button" class="btn btn-default" style="width:30px; margin-right:5px; padding-left:9px;">Z</button>
						<button type="button" class="btn btn-default" style="width:30px; margin-right:5px; padding-left:9px;">X</button>
						<button type="button" class="btn btn-default" style="width:30px; margin-right:5px; padding-left:9px;">C</button>
						<button type="button" class="btn btn-default" style="width:108px; margin-right:5px; padding-left:9px;">SPACE</button>
						<button type="button" class="btn btn-default" style="width:30px; margin-right:5px; padding-left:9px;">V</button>
						<button type="button" class="btn btn-default" style="width:30px; margin-right:5px; padding-left:9px;">B</button>
						<button type="button" class="btn btn-default" style="width:30px; margin-right:5px; padding-left:9px;">N</button>
						<button type="button" class="btn btn-default" style="width:30px; margin-right:56px; padding-left:9px;">M</button>

						<button type="button" class="btn btn-default" style="width:30px; margin-right:5px; padding-left:9px;">0</button>
						<button type="button" class="btn btn-default" style="width:30px; margin-right:5px; padding-left:9px;">1</button>
						<button type="button" class="btn btn-default" style="width:30px; margin-right:5px; padding-left:9px;">2</button>
						<button type="button" class="btn btn-default" style="width:30px; margin-right:5px; padding-left:9px;">3</button>
					</div>
					<div style="float:right; position:relative; top:-18px; right:-18px;"><button type="button" class="btn btn-sm btn-default btn-lightsave">Save</button></div>
				</div>

			</div>
		</div>
{% endblock %}