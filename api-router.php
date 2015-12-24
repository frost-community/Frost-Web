<?php

$app->map('/teapot/coffee', function () use ($app) {
	$app->response->setStatus(418);
	$app->response->write("Error 418 - I'm a teapot.");
});

$app->get('/login/toggle', function () use ($app) {
	$_SESSION['is-login'] = !$_SESSION['is-login'];
	$app->response->write("toggle successful.");
});
