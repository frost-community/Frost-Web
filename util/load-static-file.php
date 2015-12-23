<?php

function LoadStaticFile ($res, $filePath) {
	global $app;

	require_once('content-types.php');

	$content = null;
	$extension = pathinfo($filePath)['extension'];
	$contentType = null;

	foreach ($ContentTypes as $exte => $type) {
		if ($extension === $exte) {
			$contentType = $type;
			break;
		}
	}

	if ($contentType !== null)
		$res->headers->set('Content-Type', $contentType);

	if (file_exists($filePath) && !!($temp = file_get_contents($filePath))) {
		$content = $temp;
	} else
		$app->notFound();

	$res->setBody($content);
}
