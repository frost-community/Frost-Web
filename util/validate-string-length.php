<?php

function validateStringLength ($target, $minLength = null, $maxLength = null) {
	if ($minLength !== null)
		return strlen($target) >= $minLength;
	if ($maxLength !== null)
		return strlen($target) <= $maxLength;
	return true;
}