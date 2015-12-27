<?php

use \Slim\Slim;

/* Error Message List */
$errorMessage[1] = "400:Some required parameters.";
$errorMessage[2] = "400:Some Invalid parameters.";
$errorMessage[3] = "400:Invalid referer.";
$errorMessage[4] = "400:Please request with login.";
$errorMessage[5] = "500:Failed to execute.";
$errorMessage[6] = "404:User not found.";
$errorMessage[7] = "400:This user is you.";

/* API Response Builder */
function buildErrorResponse($errorCode, $content = null) {
	global $errorMessage;
	$res = Slim::getInstance()->response;

	$error = explode(':', $errorMessage[$errorCode]);

	$res->setStatus($error[0]);
	$src['error']['code'] = $errorCode;
	$src['error']['message'] = $error[1];

	if (is_array($content))
		$src['error'] += $content;

	$res->write(json_encode($src));
}

function buildSuccessResponse($content = null) {
	$res = Slim::getInstance()->response;

	if ($content === null)
		$src["message"] = "Successful.";
	else
		if (is_array($content))
			$src = $content;
		else
			$src["message"] = $content;

	$res->write(json_encode($src));
}

/* Validate Referer */
function validateReferer () {
	$referer = Slim::getInstance()->request->getReferrer();
	if ($referer === null || $referer === "") {
		buildErrorResponse(3);
		return false;
	}
	return true;
}

/* Validate Api Parameters */
function validateApiParameters($requireParams) {
	$req = Slim::getInstance()->request;
	$method = $req->getMethod();

	if ($method == "GET") {
		$data = $req->get();
	} else if ($method == "POST") {
		$data = $req->post();
	} else {
		$data = [];
	}

	foreach($requireParams as $requireParam) {
		if (!array_key_exists($requireParam, $data)) {
			BuildErrorResponse(1, ['Require parameters' => array_keys($requireParams)]);
			return false;
		}
	}
	return true;
}