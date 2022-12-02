<?php

require_once('computer.php');

function debug_echo($output)
{
    echo $output;
}


function play_game($player1, $player2, $player1_starts) {
    $board = [3,4,5];

    $players = [
        $player1_starts ? $player1 : $player2,
        $player1_starts ? $player2 : $player1,
    ];

    $player1->start(1); // Gera o id do jogo
    $player2->start(2); // Gera o id do jogo

    $count = 0;

    while( count( \SoEuGanho\SoEuGanho::getPossibleMoves($board) ) ) {

        $p = $players[$count % 2];
        $move = $p->play($board);

        debug_echo("Board: " . implode(', ', $board) . PHP_EOL);

        $board[ $move['line'] ] -= $move['pieces'];

        debug_echo("Player " . ($p->getPlayerNumber()) . " removed " . $move['pieces'] . " pieces from line " . ($move['line']+1) . "\n");

        // debug_echo("Possible moves: " . count(\SoEuGanho\SoEuGanho::getPossibleMoves($board)) . PHP_EOL);
        $count++;
    }

    $winnerPlayerNumber = $p->getPlayerNumber();

    debug_echo("Winner is player $winnerPlayerNumber\n");
    debug_echo("----------------------------\n");

    $player1->end( $winnerPlayerNumber );
    $player2->end( $winnerPlayerNumber );

}

$computerPlayer1 = new \SoEuGanho\ComputerPlayer(db: $db);

$player->setTraining(true); // Player2 testa múltiplas possibilidades
$computerPlayer1->setTraining(false); // player1 tenta as melhores

debug_echo("<pre>");

// return;


$games = @$_REQUEST['games'] ?? 1;

for($i=0;$i<$games;$i++)
{
    play_game(player1: $computerPlayer1, player2: $player, player1_starts: !((bool)($i % 2)));
}

