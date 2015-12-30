<?php

require_once(dirname(__FILE__).'/util/regex.php');
require_once(dirname(__FILE__).'/util/validate-string-length.php');
require_once(dirname(__FILE__).'/util/api-utils.php');

$app->group('/api', function () use ($app) {

	$app->get('/debug/login/toggle', function () {
		$_SESSION['is-login'] = !$_SESSION['is-login'];
	});

	$app->post('/account/create', function () use ($app) {
		if (validateReferer()) {
			if (validateApiParameters(['screen_name', 'password'])) {
				$invalidSN = [
					"help",
					"home",
					"mentions",
					"login",
					"logout",
					"search",
					"signin",
					"signup",
					"signout",
					"welcome",
					//"tos",
				];

				$screenName = $app->request->post('screen_name');
				$password = $app->request->post('password');

				$isOccurredError = false;
				$errorTargets = [];

				if (!(regex("/^[a-z0-9_]+$/i", $screenName)) || !(validateStringLength($screenName, 4, 15))) {
					$isOccurredError = true;
					$errorTargets[] = 'screen_name';
				} else {
					foreach ($invalidSN as $i) {
						if ($screenName === $i) {
							$isOccurredError = true;
							$errorTargets[] = 'screen_name';
						}
					}
				}

				if (!(regex("/^[a-z0-9_-]+$/i", $password)) || !(validateStringLength($password, 6))) {
					$isOccurredError = true;
					$errorTargets[] = 'password';
				}

				if (!$isOccurredError) {
					//$_SESSION['is-login'] = true;
					//$_SESSION['me'] = null;
					buildSuccessResponse();
				} else
					buildErrorResponse(2, ['parameters' => $errorTargets]);
			}
		}
	});
});
