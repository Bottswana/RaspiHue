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
						<li class="active"><a href="/Control">Home</a></li>
						{% if ShowSettings %}<li><a href="/Settings">Settings</a></li>{% endif %}
					</ul>
				</div>
			</div>
		</nav>

		<!-- Main Page -->
		<div class="container" role="main" style="padding-top: 80px;">

			<!-- Quick Lighting Buttons -->
			<p>
				<button type="button" class="btn btn-lg btn-default btn-lightsoff">Lights Off</button>
				<button type="button" class="btn btn-lg btn-default btn-lightson">Lights On</button>
				<button type="button" class="btn btn-lg btn-default btn-lightscycle">Cycle</button>
			</p>

			<!-- Bulb Selection -->
			<p>
				{% for light in Lights %}
				<button type="button" class="btn btn-default btn-bulbselect" data-bulbid="{{ light.id }}">{{ light.name }}</button>
				{% endfor %}
			</p>

			<!-- Lighting Profiles -->
			<div class="page-header"> 
				<div style="float:right; position:relative; top:25px; z-index:999;"><button type="button" class="btn btn-default btn-saveprofile">Save Profile</button></div>
				
				<h1 style="font-size:26px; position:relative; top:10px; display:inline-block">Light Profiles</h1>
				<span class="ShowWarning" style="margin-left:40px; position:relative; top:10px; display:none;">Double tap this profile again to delete it.</span>
			</div>

			<div class="row"><br />
				<div class="col-md-12 ProfileUnit" style="text-align:center; font-size:20px;"></div>
			</div>

		</div>

		<!-- Registration Screen -->
		<div class="HueRegistration HuePopup">
			<div class="row">

				<div class="col-md-6">
					<img src="/Resources/img/smartbridge.jpg" alt="Press the button!" />
				</div>

				<div class="col-md-6">
					<h2> I found your Hue Bridge! </h2><br />
					<p> Press the button on your Hue Bridge now to confirm registration. </p>

					<br /><br /><br />
					<div class="progress" style="margin-right:60px;">
						<div style="width: 100%" aria-valuemax="100" aria-valuemin="0" aria-valuenow="100" role="progressbar" class="progress-bar progress-bar-success">
							<span class="sr-only"></span>
						</div>
					</div>
				</div>

			</div>
		</div>

		<!-- Missing Bridge Screen -->
		<div class="HueFailed HuePopup">
			<div class="row">

				<div class="col-md-6">
					<img src="/Resources/img/smartbridge.jpg" alt="Press the button!" />
				</div>

				<div class="col-md-6">
					<h2> Where is your Hue Bridge? </h2><br />
					<p> Have you misplaced your Hue bridge? I can't find it! </p>
				</div>

			</div>
		</div>

		<div class="CreateProfile HuePopup" style="height:405px; top:calc(50% - 190px);">
			<div class="row">

				<div class="col-md-12" style="padding: 0px 40px;">
					<div class="ExitButton" style="float:right"> </div>
					
					<h2 style="font-size:24px !important;"> Creating New Profile </h2>
					<p style="font-size:12px !important;">
						Create a new profile by saving the current light state to RaspiHue. Select the lights you wish to include in this profile and enter a name.<br />
						The current state of the lights you select will be saved to the profile. This includes lights which are turned off. Lights not saved on the profile will not be altered when the profile is activated.
					</p>

					<h2 style="font-size:20px !important;"> Selection and Name </h2>
					<p>
						{% for light in Lights %}
						<button type="button" class="btn btn-default btn-theselights" data-bulbid="{{ light.id }}" style="margin-right:5px;">{{ light.name }}</button>
						{% endfor %}
					</p>

					<p> <input type="text" id="profilename" placeholder="Profile name" style="width:400px; margin-top:10px;" /> </p><br />

					<div class="VirtualKeyboard" style="margin-top:-10px;" data-target="#profilename">
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
					<div style="float:right; position:relative; top:-18px; right:-18px;"><button type="button" class="btn btn-sm btn-default btn-initsave">Save</button></div>
				</div>

			</div>
		</div>
{% endblock %}