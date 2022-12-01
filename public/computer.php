<?php

require_once 'autoload.php';

define('COMPUTER_PLAYER_NUMBER', 2);


$db = new \MongoDB\Client("mongodb://mongo:27017");


use SoEuGanho\ComputerPlayer;

$gameId = $_REQUEST['gameId'] ?? null;
$playerNumber = (int) ($_REQUEST['playerNumber'] ?? COMPUTER_PLAYER_NUMBER);
$player = new ComputerPlayer(db: $db, gameId: $gameId);
