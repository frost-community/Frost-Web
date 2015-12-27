<?php

function regex ($regexStr, $content) {
	return preg_match($regexStr, $content) === 1;
}
