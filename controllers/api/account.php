<?php

require_once __DIR__.'/../../util/api-exception.php';
require_once __DIR__.'/../../util/api-utils.php';
require_once __DIR__.'/../../util/regex.php';

class Account
{
	public static function create($req, $res, array $params, array $config)
	{
		try
		{
			if (validateReferer($req))
			{
				if (hasRequireParams($params, ['screen_name', 'password']))
				{
					$invalidSN = [
						'frost',
						'help',
						'home',
						'mentions',
						'login',
						'logout',
						'search',
						'signin',
						'signup',
						'signout',
						'welcome',
						//'tos',
					];

					$isOccurredError = false;
					$errorTargets = [];

					$db = new DatabaseManager($config['db-hostname'], $config['db-username'], $config['db-password'], $config['db-dbname']);

					if (!Regex::isMatch('/^[a-z0-9_]{4,15}$/i', $params['screen_name']))
					{
						$isOccurredError = true;
						$errorTargets[] = 'screen_name';
					}
					else
					{
						$isExistUser = count($db->executeQuery('select * from frost_account where screen_name = ? limit 1', [$params['screen_name']])->fetch()) === 1;
						
						if ($isExistUser)
						{
							$isOccurredError = true;
							$errorTargets[] = 'screen_name';
						}
						else
						{
							foreach ($invalidSN as $i)
							{
								if ($params['screen_name'] === $i)
								{
									$isOccurredError = true;
									$errorTargets[] = 'screen_name';
								}
							}
						}
					}

					if (!Regex::isMatch('/^[a-z0-9_-]{6,128}$/i', $params['password']))
					{
						$isOccurredError = true;
						$errorTargets[] = 'password';
					}

					if ($isOccurredError)
						throw new ApiException(2, ['invalid_parameters' => $errorTargets]);

					$createdAt = time();
					$passwordHash = hash('sha256', $params['password'].$createdAt);
					$db->executeQuery('insert into frost_account (created_at, screen_name, name, password_hash) values(?, ?, ?, ?)', [$createdAt, $params['screen_name'], "froster", $passwordHash]);

					$_SESSION['is-login'] = true;
					$_SESSION['me'] = ['screen_name'=>$params['screen_name']];
					$res = withSuccess($res);
				}
			}

			return $res;
		}
		catch(ApiException $e)
		{
			return withFailure($res, $e->getCode(), $e->getData());
		}
	}
}