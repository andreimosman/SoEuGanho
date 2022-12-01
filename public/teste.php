<?php

require_once('computer.php');

echo "<pre>";
// print_r($player);

$moves = $player->getPossibleMoves([3,3,5]);

print_r($moves);
echo "</pre>";
