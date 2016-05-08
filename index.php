<?php

use Slim\Views\JadeRenderer;

require_once __DIR__.'/vendor/autoload.php';
require_once __DIR__.'/config.php';
require_once __DIR__.'/model/account.php';

session_set_cookie_params(60 * 60 * 24 * 7, '/', $config['session_domain']);
session_name($config['session-name']);
session_start();

$appConfig =
[
    'settings' =>
    [
        'displayErrorDetails' => true
    ],
    'config' => $config,
    'renderer' => new JadeRenderer()
];

$app = new Slim\App($appConfig);

require_once './router.php';

$app->run();
