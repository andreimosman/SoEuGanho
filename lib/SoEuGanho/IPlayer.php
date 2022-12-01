<?php

namespace SoEuGanho;

interface IPlayer {

    /**
     * @returns the game id
     */
    public function start(?int $playerNumber): string;

    /**
     * @returns the game id
     */
    public function getGameId(): string;

    /**
     * @returns the player number
     */
    public function getPlayerNumber(): int;

    /**
     * @returns the move
     */
    public function play(array $board): array;

    /**
     * @param $status 0 = abort game, 1 = player 1 won, 2 = player 2 won
     */
    public function end(int $winnerPlayerNumber): void;
    
}
