<?php

namespace SoEuGanho;

class SoEuGanho
{

    const MAX_LINES = 3;
    const MAX_PIECES_PER_LINE = 5;

    public static function getPossibleMoves(array $board): array
    {
        if(count($board) > self::MAX_LINES) return []; // Invalid board
        $totalPieces = array_sum($board);

        if( $totalPieces == 1 ) return [];

        $playableLines = array_filter($board, fn($line) => $line > 0 && $line <= self::MAX_PIECES_PER_LINE);
        $numberOfPlayableLines = count($playableLines);


        $possibleMoves = [];

        $discardPieces = $numberOfPlayableLines == 1 ? 1 : 0;

        foreach ($playableLines as $line => $pieces) {
            for( $i=1;$i<=$pieces - $discardPieces;$i++) {
                $possibleMoves[] = ["line" => $line, "pieces" => $i];
            }
        }

        return $possibleMoves;
    }

    public static function start(): string
    {
        $gameId = uniqid();
        return $gameId;
    }

}
