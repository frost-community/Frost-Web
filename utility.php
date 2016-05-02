<?php

class Utility
{
	public static function loadStaticFile ($app, $res, $filePath)
	{
		require __DIR__.'/content-types.php';

		$content = null;
		$extension = pathinfo($filePath)['extension'];
		$contentType = null;

		foreach ($contentTypes as $exte => $type) {
			if ($extension === $exte) {
				$contentType = $type;
				break;
			}
		}

		if ($contentType !== null)
			$res = $res->withHeader('Content-Type', $contentType);

		if (file_exists($filePath) && !!($temp = file_get_contents($filePath))) {
			$content = $temp;
		}
		else
		{
			$res->getBody()->write('file not found');
			$res = $res->withStatus(404);
		}

		$res->getBody()->write($content);
		return $res;
	}
}