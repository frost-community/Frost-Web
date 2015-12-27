<?php

require_once './config.php';
require_once './vendor/autoload.php';

require_once './model/account.php';

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

ORM::configure('mysql:host='.$config['db-hostname'].';dbname='.$config['db-dbname']);
ORM::configure('username', $config['db-username']);
ORM::configure('password', $config['db-password']);
Model::$auto_prefix_models = '\\Frost\\';

if (!isset($_SESSION['is-login'])) {
	$_SESSION['is-login'] = false;
}

if ($_SESSION['is-login']) {
	//$_SESSION['me']
}

require "./api-router.php";
require "./router.php";

$app->run();
