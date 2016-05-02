<?php

require_once __DIR__.'/../../util/api-exception.php';
require_once __DIR__.'/../../util/api-utils.php';
require_once __DIR__.'/../../util/regex.php';

class Account
{
	public static function create($req, $res, array $params)
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

					if (!Regex::isMatch('/^[a-z0-9_]{4,15}$/i', $params['screen_name']))
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

					if (!Regex::isMatch('/^[a-z0-9_-]{6,128}$/i', $params['password']))
					{
						$isOccurredError = true;
						$errorTargets[] = 'password';
					}

					if (!$isOccurredError)
					{
						//$_SESSION['is-login'] = true;
						//$_SESSION['me'];
						$res = withSuccess($res);
					}
					else
						$res = withFailure($res, 2, ['parameters' => $errorTargets]);
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