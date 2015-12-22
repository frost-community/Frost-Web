<?php

require_once 'vendor/autoload.php';

use Jlndk\SlimJade\Jade;
use \Slim\Slim;

$app = new Slim([
	"view" => new Jade(),
	"templates.path" => dirname(__FILE__)."/views"
]);

require "./router.php";

$app->run();
