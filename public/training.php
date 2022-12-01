<?php

require_once('computer.php');


function play_game($player1, $player2, $player1_starts) {
    $board = [3,4,5];

    $players = [
        $player1_starts ? $player1 : $player2,
        $player1_starts ? $player2 : $player1,
    ];

    $player2->start(2); // Gera o id do jogo

    $count = 0;

    while( count( \SoEuGanho\SoEuGanho::getPossibleMoves($board) ) ) {

        $p = $players[$count % 2];
        $move = $p->play($board);

        echo "Board: " . implode(', ', $board) . PHP_EOL;

        $board[ $move['line'] ] -= $move['pieces'];

        echo "Player " . ($p->getPlayerNumber()) . " removed " . $move['pieces'] . " pieces from line " . ($move['line']+1) . "\n";

        // echo "Possible moves: " . count(\SoEuGanho\SoEuGanho::getPossibleMoves($board)) . PHP_EOL;
        $count++;
    }

    $winnerPlayerNumber = $p->getPlayerNumber();

    echo "Winner is player $winnerPlayerNumber\n";
    echo "----------------------------\n";

    $player2->end( $winnerPlayerNumber );

}

$player->setTraining(true);

$randomPlayer = new \SoEuGanho\RandomPlayer();


$max_games = @$_REQUEST['max_games'] ?? 30;

echo "<pre>";
for($i=0;$i<$max_games;$i++)
{
    play_game(player1: $randomPlayer, player2: $player, player1_starts: !((bool)($i % 2)));
}

