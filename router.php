<?php

require_once('./util/load-static-file.php');

$app->get('/static/:fileName', function ($fileName) use ($app) {
	LoadStaticFile($app->response, './assets/'.$fileName);
});

$app->get('/', function () use ($app) {
	if ($_SESSION['is-login'])
		$app->render('home.jade');
	else
		$app->render('entrance.jade');
});

$app->post('/login', function () use ($app) {
	$screenName = $app->request->post('screen_name');
	$password = $app->request->post('password');
	if ($screenName !== null && $password !== null)
		$app->response->write("good request");
	else
	{
		$app->response->setStatus(400);
		$app->response->write("bad request");
	}
});

$app->get('/:screenName', function ($screenName) use ($app) {
	$app->render('user.jade', [
		'screenName' => $screenName
	]);
});
