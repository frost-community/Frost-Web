<?php

class DatabaseManager
{
	public $database;

	public function __construct($hostName, $userName, $password, $dbName)
	{
		try
		{
			$this->database = new PDO('mysql:dbname='.$dbName.';host='.$hostName, $userName, $password);
			$this->database->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		}
		catch (PDOException $e)
		{
			unset($this->database);
			throw new Exception('failed to connect database.');
		}
	}

	public function executeQuery($query, array $content)
	{
		$statement = $this->database->prepare($query);
		$statement->execute($content);

		return new Statement($statement);
	}


}

class Statement
{
	public $statement;
	
	public function __construct($statement)
	{
		$this->statement = $statement;
	}
	
	public function fetch()
	{
		return $this->statement->fetchAll();
	}
}
