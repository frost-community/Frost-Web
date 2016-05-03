<?php

require_once __DIR__.'/utility.php';
require_once __DIR__.'/util/api-exception.php';
require_once __DIR__.'/util/api-utils.php';
require_once __DIR__.'/database-manager.php';

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

$app->post('/signin', function ($req, $res, $args) use ($config)
{
	try
	{
		if (validateReferer($req))
		{
			if (hasRequireParams($req->getParams(), ['screen_name', 'password']))
			{
				$params = $req->getParams();
				$screenName = $params['screen_name'];
				$password = $params['password'];

				$db = new DatabaseManager($config['db-hostname'], $config['db-username'], $config['db-password'], $config['db-dbname']);

				$user = $db->executeQuery('select * from frost_account where screen_name = ? limit 1', [$screenName])->fetch();

				if (count($user) === 0)
					throw new ApiException(2, ['invalid_parameter'=>'screen_name']);

				$passwordHash = hash('sha256', $password.$user[0]['created_at']);

				if ($user[0]['password_hash'] !== $passwordHash)
					throw new ApiException(2, ['invalid_parameter'=>'password']);

				$_SESSION['is-login'] = true;
				$_SESSION['me'] = ['screen_name'=>$user[0]['screen_name']];

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

$app->group('/api', function () use ($app, $config)
{
	$app->get('/debug/login/toggle', function ($req, $res, $args)
	{
		$_SESSION['is-login'] = !$_SESSION['is-login'];
		return withSuccess($res, 'toggled');
	});

	$app->group('/account', function () use ($app, $config)
	{
		$app->post('/create', function ($req, $res, $args) use ($config)
		{
			return Account::create($req, $res, $req->getParams(), $config);
		});	
	});
});

$app->get('/:screenName', function ($req, $res, $args)
{
	return $this->renderer->render($res, 'user', ['screenName' => $args[0]]);
});
