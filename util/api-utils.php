<?php

/* Error Message List */
$errorMessage[1] = '400:Some required parameters.';
$errorMessage[2] = '400:Some Invalid parameters.';
$errorMessage[3] = '400:Invalid referer.';
$errorMessage[4] = '400:Please request with login.';
$errorMessage[5] = '500:Failed to execute.';
$errorMessage[6] = '404:User not found.';
$errorMessage[7] = '400:This user is you.';

/* API Response Builder */
function withFailure($res, $errorCode, $content = null)
{
	global $errorMessage;

	$status = intval(explode(':', $errorMessage[$errorCode])[0]);

	$src['error']['code'] = $errorCode;
	$src['error']['message'] = $error[1];

	if (is_array($content))
		$src['error'] += $content;

	return $res->withJson($src, $status);
}

function withSuccess($res, $content = null)
{
	if ($content === null)
		$src['message'] = 'successful';
	else
		if (is_array($content))
			$src = $content;
		else
			$src['message'] = $content;

	return $res->withJson($src);
}

/* Validate Referer */
function validateReferer($req)
{
	$referer = $req->getHeader('Referer');
	if ($referer === null || $referer === '')
	{
		throw new ApiException(3);
	}

	return true;
}

/* Validate Api Parameters */
function hasRequireParams($params, $requireParams)
{
	foreach($requireParams as $requireParam)
		if (!array_key_exists($requireParam, $params))
			throw new ApiException(1, ['require_parameters' => array_values($requireParams)]);

	return true;
}