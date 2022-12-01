<?php

require_once('computer.php');



$board = $_REQUEST['board'] ?? [];
$move = $player->play($board);

header('Content-Type: application/json');

echo json_encode([
    'gameId' => $gameId,
    'playerNumber' => $player->getPlayerNumber(),
    'board' => $board,
    'move' => $move,
]);
