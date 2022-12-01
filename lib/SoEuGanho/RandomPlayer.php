<?php

namespace SoEuGanho;

class RandomPlayer implements IPlayer
{

    const RANDOM_PLAYER_NUMBER = 1;

    public function start(?int $playerNumber): string
    {
        return $this->getGameId();
    }

    public function getGameId(): string
    {
        return uniqid();
    }

    public function getPlayerNumber(): int
    {
        return self::RANDOM_PLAYER_NUMBER;
    }


    public function randomPlay($board): array
    {
        $possibleMoves = SoEuGanho::getPossibleMoves($board);
        $randomMove = $possibleMoves[array_rand($possibleMoves)];
        return $randomMove;
    }

    public function play(array $board): array
    {
        return $this->randomPlay($board);
    }

    public function end(int $winnerPlayerNumber): void
    {

    }
    
}

