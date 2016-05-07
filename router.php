<?php

require_once __DIR__.'/utility.php';
require_once __DIR__.'/util/api-exception.php';
require_once __DIR__.'/util/api-utils.php';
require_once __DIR__.'/database-manager.php';

require_once __DIR__.'/controllers/api/account.php';

/*
		$_SESSION['is-login'] = true;
		$_SESSION['me'] = [
			'screen_name'=>$user[0]['screen_name'],
			'id'=>$user[0]['id'],
			'name'=>$user[0]['name'],
		];
*/

$app->get('/', function ($req, $res, $args) use ($config)
{
	if (isset($_SESSION['me']))
	{
		$id = $_SESSION['me']['id'];

		$user = $db->executeQuery('select * from frost_account where id = ? limit 1', [$id])->fetch();

		if (count($user) === 0)
		{
			unset($_SESSION['me']);
		}
	}

	if ($_SESSION['is_login'])
		return $this->renderer->render($res, 'home', ['screenName'=>$_SESSION['me']['screen_name']]);
	else
		return $this->renderer->render($res, 'entrance');
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

				$_SESSION['me'] = [
					'screen_name'=>$user[0]['screen_name'],
					'id'=>$user[0]['id'],
					'name'=>$user[0]['name'],
				];

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
			unset($_SESSION['me']);

			return withSuccess($res);
		}
	}
	catch(ApiException $e)
	{
		return withFailure($res, $e->getCode(), $e->getData());
	}
});



$app->group('/developer', function()
{
	$app->get('/', function ($req, $res, $args)
	{
		return $this->renderer->render($res, 'developer');
	});
});

$app->get('/:screenName', function ($req, $res, $args)
{
	return $this->renderer->render($res, 'user', ['screenName' => $args[0]]);
});