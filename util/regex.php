<?php

class Regex
{
	public static function isMatch($regexStr, $content)
	{
		return preg_match($regexStr, $content) === 1;
	}
	
	public static function match($regexStr, $content)
	{
		return preg_match($regexStr, $content, $ms) === 1 ? $ms : [];
	}
}
