<?php

use Slim\Views\JadeRenderer;

require_once __DIR__.'/vendor/autoload.php';
require_once __DIR__.'/config.php';
require_once __DIR__.'/model/account.php';

session_cache_expire(60 * 24 * 7);
session_name($config['session-name']);
session_start();

$config = [
    'settings' => [
        'displayErrorDetails' => true
    ]
];

$app = new Slim\App($config);
$container = $app->getContainer();
$container['renderer'] = new JadeRenderer();

// init
if (!isset($_SESSION['is-login'])) {
	$_SESSION['is-login'] = false;
}

if ($_SESSION['is-login']) {
	//$_SESSION['me']
}

require_once './router.php';

$app->run();
