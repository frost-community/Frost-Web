<?php

require_once './config.php';
require_once './vendor/autoload.php';

use Jlndk\SlimJade\Jade;
use \Slim\Slim;

$app = new Slim([
	"view" => new Jade(),
	"templates.path" => dirname(__FILE__)."/views"
]);

$app->add(new \Slim\Middleware\SessionCookie([
    'expires' => 0,
    'path' => '/',
    'domain' => null,
    'secure' => false,
    'httponly' => false,
    'name' => $config['session-name'],
    'secret' => $config['session-secret'],
    'cipher' => MCRYPT_RIJNDAEL_256,
    'cipher_mode' => MCRYPT_MODE_CBC
]));

if ($_SESSION['is-login'] !== true) {
	$_SESSION['is-login'] = false;
}

$app->group('/api', function () use ($app) {
	require "./api-router.php";
});

require "./router.php";

$app->run();
