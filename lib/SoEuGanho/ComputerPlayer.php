<?php

namespace SoEuGanho;

class ComputerPlayer implements IPlayer
{

    private ?\MongoDB\Client $db;
    private $gameId;
    private $playerNumber;

    private $training = false;

    const COMPUTER_PLAYER_NUMBER = 2;

    const REWARD_POINTS = 3;
    const PENALTY_POINTS = -1;

    public function __construct(\MongoDB\Client $db = null, string $gameId = null, int $playerNumber = null)
    {
        $this->db = $db;
        $this->gameId = $gameId;
        $this->playerNumber = $playerNumber ?? self::COMPUTER_PLAYER_NUMBER;
    }

    public function setTraining(bool $training = true): void
    {
        $this->training = $training;
    }

    public function start(?int $playerNumber): string
    {
        $playerNumber ??= self::COMPUTER_PLAYER_NUMBER; // Computer

        $this->gameId = uniqid();
        $this->playerNumber = $playerNumber;

        return $this->gameId;
    }

    public function clearSessionRecord(): void
    {
        unset($_SESSION['soEuGanho']);
    }

    public function addHistory($board, $move): void
    {
        $collection = $this->db->selectCollection('soeuganho', 'history');

        $collection->insertOne([
            'timestamp' => time(),
            'gameId' => $this->gameId,
            'board' => array_map(fn($pieces) => (int) $pieces, $board),
            'move' => $move,
        ]);
    }

    public function getGameId(): string
    {
        return $this->gameId;
    }

    public function getPlayerNumber(): int
    {
        return $this->playerNumber ?? self::COMPUTER_PLAYER_NUMBER;
    }

    public static function toFullArrayOrNull($value): ?array
    {
        return empty($value) ? null : json_decode(json_encode($value),true);;
    }

    public function getRankedMoves($board, $sort = 1): ?array {
        $filter = [
            'board' => array_map(fn($pieces) => (int) $pieces, $board),
        ];

        $moves = $this->db
            ->selectCollection('soeuganho', 'moves')
            ->find($filter, ['sort' => ['rating' => $sort]]);
        
        return self::toFullArrayOrNull($moves->toArray());
    }

    public function createRankedMoves($board): ?array {
        $moves = array_map(function($move) use ($board) {
            return [
                'board' => array_map(fn($pieces) => (int) $pieces, $board),
                'move' => $move,
                'rating' => 3,
            ];
        }, SoEuGanho::getPossibleMoves($board));

        $this->db->selectCollection('soeuganho', 'moves')->insertMany($moves);

        return $this->getRankedMoves($board);
    }

    public function getPossibleMoves($board): array
    {
        $moves = $this->getRankedMoves($board) ?? $this->createRankedMoves($board);
        return array_map(fn($move) => $move['move'], $moves);
    }

    public function randomPlay($board): array
    {
        $possibleMoves = SoEuGanho::getPossibleMoves($board);
        $randomMove = $possibleMoves[array_rand($possibleMoves)];
        return $randomMove;
    }

    public function getRandomMoveConsideringWeight($board): array
    {
        $moves = $this->getRankedMoves($board) ?? $this->createRankedMoves($board);

        // echo "Count: " . count($moves) . "\n";

        /**
        // Este método estava gerando menos ocorrências do que tem mais peso.

        $sum = 0;

        $moves = array_map(function($move) use (&$sum) {
            $sum += $move['rating'];
            $move['weight'] = $sum;
            return $move;
        }, $moves);

        $randomIndex = $sum > 0 ? mt_rand(0, $sum) : 0; 

        $movesInTheZone = array_filter($moves, function($move) use ($randomIndex) {
            return $move['weight'] >= $randomIndex; // <=
        });

        $selectedMove = $movesInTheZone[ count($movesInTheZone)-1 ] ?? $moves[0] ?? [];

        */

        // Script alfaiate
        // Begin remendo
        $stringao = "";

        foreach($moves as $i => $move) {
            $stringao .= str_repeat(chr($i+65),$move['rating'] > 0 ? $move['rating'] : 1);
        }

        // echo "Stringao: " . $stringao . "\n";

        $weightedIndexes = str_split($stringao);
        $randomIndex = ord( $weightedIndexes[ rand(0, count($weightedIndexes)-1 ) ] ) - 65;

        $selectedMove = $moves[$randomIndex] ?? $moves[0] ?? [];

        return $selectedMove;
    }

    public function learnedPlay($board): array
    {
        $move = $this->getRandomMoveConsideringWeight($board);
        $theMove = $move['move'] ?? [];
        return $theMove;
    }

    public function selectTheBestMove($board): array
    {
        $moves = $this->getRankedMoves(board: $board, sort: -1) ?? $this->createRankedMoves($board);

        $bestMove = $moves[0] ?? [];

        return $bestMove['move'] ?? [];
    }

    public function play(array $board): array
    {
        // Todo: implement a better strategy
        // if( $this->training ) {
            $move = $this->learnedPlay($board);
        // } else {
        //    $move = $this->selectTheBestMove($board);
        // }
        
        $this->addHistory($board, $move);
        return $move;
    }

    public function getHistory(): ?array
    {
        $collection = $this->db->selectCollection('soeuganho', 'history');

        $history = $collection->find([
            'gameId' => $this->gameId,
        ]);

        return self::toFullArrayOrNull($history->toArray());
    }

    public function learn(bool $win): void
    {
        $history = $this->getHistory() ?? [];

        foreach($history as $move) {
            $rating = $win ? self::REWARD_POINTS : self::PENALTY_POINTS;
            $board = $move['board'];
            $r = $this->db->selectCollection('soeuganho', 'moves')->updateOne(
                [
                    'board' => array_map(fn($pieces) => (int) $pieces, $board),
                    'move' => $move['move'],
                ],
                [
                    '$inc' => [
                        'rating' => $rating,
                    ],
                ]
            );
        }

        $this->saveResult($win);
    }

    public function saveResult($win): void
    {
        $collection = $this->db->selectCollection('soeuganho', 'results');

        $collection->insertOne([
            'timestamp' => time(),
            'gameId' => $this->gameId,
            'win' => $win,
        ]);
    }

    public function cleanHistory() {
        $this->db->selectCollection('soeuganho', 'history')->deleteMany([
            'gameId' => $this->gameId,
        ]);
        $this->db->selectCollection('soeuganho', 'history')->deleteMany([
            'timestamp' => [
                '$lt' => time() - 600,
            ],
        ]);
    }

    public function end(int $winnerPlayerNumber): void
    {
        $win = $winnerPlayerNumber === $this->playerNumber;
        $this->learn(win: $win);
        $this->cleanHistory();
    }
       
}
