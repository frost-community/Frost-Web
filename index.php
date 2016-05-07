<?php

use Slim\Views\JadeRenderer;

require_once __DIR__.'/vendor/autoload.php';
require_once __DIR__.'/config.php';
require_once __DIR__.'/model/account.php';

session_cache_expire(60 * 24 * 7);
session_name($webConfig['session-name']);
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
