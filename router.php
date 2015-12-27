<?php

require_once(dirname(__FILE__).'/util/load-static-file.php');
require_once(dirname(__FILE__).'/util/api-utils.php');

$app->get('/static/:fileName', function ($fileName) use ($app) {
	LoadStaticFile($app->response, './assets/'.$fileName);
});

$app->get('/', function () use ($app) {
	if ($_SESSION['is-login'])
		$app->render('home.jade');
	else
		$app->render('entrance.jade');
});

$app->post('/signin', function () use ($app) {
	if (validateReferer()) {
		if (validateApiParameters(['screen_name', 'password'])) {
			$screenName = $app->request->post('screen_name');
			$password = $app->request->post('password');
			
			//$_SESSION['is-login'] = true;
			//$_SESSION['me'] = null;
			buildSuccessResponse("Success signin.");
		}
	}
});

$app->post('/signout', function () use ($app) {
	if (validateReferer()) {
		$_SESSION['is-login'] = null;
		$_SESSION['me'] = null;
		buildSuccessResponse("Success signout.");
	}
});

$app->get('/:screenName', function ($screenName) use ($app) {
	$app->render('user.jade', [
		'screenName' => $screenName
	]);
});
