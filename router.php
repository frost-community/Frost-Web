<?php

require_once __DIR__.'/utility.php';
require_once __DIR__.'/util/api-exception.php';
require_once __DIR__.'/util/api-utils.php';

require_once __DIR__.'/controllers/api/account.php';

$app->get('/', function ($req, $res, $args)
{
	return $_SESSION['is-login']
		? $this->renderer->render($res, 'home')
		: $this->renderer->render($res, 'entrance');
});

$app->get('/static/{fileName}', function ($req, $res, $args)
{
	return Utility::loadStaticFile($this, $res, __DIR__.'/assets/'.$args['fileName']);
});

$app->post('/signin', function ($req, $res, $args)
{
	try
	{
		if (validateReferer($req))
		{
			if (hasRequireParams($req->getParams(), ['screen_name', 'password'])) {
				$screenName = $req->getParams('screen_name');
				$password = $req->getParams('password');
				
				//$_SESSION['is-login'] = true;
				//$_SESSION['me'] = null;
				return withSuccess($res, 'Success signin.');
			}
		}
	}
	catch(ApiException $e)
	{
		return withFailure($res, $e->getCode(), $e->getData());
	}
});

$app->post('/signout', function ($req, $res, $args)
{
	try
	{
		if (validateReferer($req))
		{
			$_SESSION['is-login'] = null;
			$_SESSION['me'] = null;
			return withSuccess($res, 'Success signout.');
		}
	}
	catch(ApiException $e)
	{
		return withFailure($res, $e->getCode(), $e->getData());
	}
});

$app->group('/api', function () use ($app)
{
	$app->get('/debug/login/toggle', function ($req, $res, $args)
	{
		$_SESSION['is-login'] = !$_SESSION['is-login'];
		return withSuccess($res, 'toggled');
	});

	$app->group('/account', function () use ($app)
	{
		$app->post('/create', function ($req, $res, $args)
		{
			return Account::create($req, $res, $req->getParams());
		});	
	});
});

$app->get('/:screenName', function ($req, $res, $args)
{
	return $this->renderer->render($res, 'user', ['screenName' => $args[0]]);
});
