<?php
$host = "localhost";
$db_name = "news_app";
$username = "root";
$password = "Petrov!23";
  
try {
    $con = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password);
}
catch(PDOException $exception){
    echo "Connection error: " . $exception->getMessage();
}
