<?php

require_once('./util/load-static-file.php');

$app->get('/static/:fileName', function ($fileName) use ($app) {
	LoadStaticFile($app->response, './assets/'.$fileName);
});

$app->get('/', function () use ($app) {
	//$app->render('home.jade');
	$app->render('entrance.jade');
});

$app->get('/:screenName', function ($screenName) use ($app) {
	$app->render('user.jade', [
		'screenName' => $screenName
	]);
});
