<?php

function validateStringLength ($target, $minLength = null, $maxLength = null) {
	$flag = true;

	if ($minLength !== null)
		$flag = strlen($target) >= $minLength;

	if ($maxLength !== null)
		$flag = strlen($target) <= $maxLength;

	return $flag;
}