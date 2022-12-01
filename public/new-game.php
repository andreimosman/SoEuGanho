<?php

require_once('computer.php');

$currentGameId = $_REQUEST['gameId'] ?? null;
$winnerPlayerNumber = (int) ($_REQUEST['winnerPlayerNumber'] ?? 0);

$sessionBeforeEnd = $_SESSION['soEuGanho'] ?? null;

if( $currentGameId ) {
    $player->end($winnerPlayerNumber);
}

$gameId = $player->start(COMPUTER_PLAYER_NUMBER);

header('Content-Type: application/json');

echo json_encode([
    'gameId' => $gameId,
    'playerNumber' => $player->getPlayerNumber(),
]);

