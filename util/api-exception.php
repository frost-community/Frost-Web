<?php

class ApiException extends Exception
{
	// 例外を再定義し、メッセージをオプションではなくする
	public function __construct($code, $data = [], Exception $previous = null)
	{
		parent::__construct('Api error', $code, $previous);
		$this->data = $data;
	}

	public $data;

	public function getData()
	{
		return $this->data;
	}
}
