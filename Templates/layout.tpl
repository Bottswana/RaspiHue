<!DOCTYPE html>
<html lang="en">
	<head>

		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>RaspiHue</title>

		<link rel="stylesheel" href="/Resources/css/hue.css">
		<link rel="stylesheet" href="/Resources/css/bootstrap.min.css">
		<link rel="stylesheet" href="/Resources/css/bootstrap-theme.min.css">

		<script src="/Resources/js/jquery.min.js"></script>
		<script src="/Resources/js/bootstrap.min.js"></script>
		<script src="/Resources/js/client.js"></script>

		<style>
			.HuePopup {
				display: none;
				width: 900px;
				height: 255px;

				background-color:#fff;
				border: 1px solid #ccc;
				z-index: 1000;

				position: absolute;
				top: calc( 50% - 120px );
				left: calc( 50% - 450px );

				-webkit-box-shadow: 7px 7px 10px 0px rgba(50, 50, 50, 0.5);
				-moz-box-shadow:    7px 7px 10px 0px rgba(50, 50, 50, 0.5);
				box-shadow:         7px 7px 10px 0px rgba(50, 50, 50, 0.5);
			}

			.ExitButton {
				width: 24px;
				height: 24px;

				background-image: url('/Resources/img/exit.png');
				background-size: 100%;

				position: relative;
				top: 10px; right: -10px;
				cursor: pointer;
			}

			.ProfileWell {
				text-align: center;
				min-width: 200px;
				
				display: inline-block;
				margin-right: 10px;
			}

			.Help {
				font-size:10px;
				position:relative;
				top:-3px;
			}

			.switcher .left {
				border-bottom-right-radius: 0;
				border-top-right-radius: 0;
			}

			.switcher .right {
				border-bottom-left-radius: 0;
				border-top-left-radius: 0;
				margin-left: -5px;
			}

			a:focus, a:active,
			button,
			input[type="reset"]::-moz-focus-inner,
			input[type="button"]::-moz-focus-inner,
			input[type="submit"]::-moz-focus-inner,
			select::-moz-focus-inner,
			input[type="file"] > input[type="button"]::-moz-focus-inner {
			    outline: none !important;
			}
		</style>

	</head>

	<body role="document">

		{% block content %}{% endblock %}

	</body>
</html>