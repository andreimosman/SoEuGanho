
const soEuGanho = {
    PLAYER_ONE: 1,
    PLAYER_COMPUTER: 2,
    animationStatus: {
        numberOfItens: 0,  
    },
    gameStatus: {
        gameId: '',
        currentPlaying: 1, /* 1 = player, 2 = computer */
        lastStartUser: 2, /* Vai ser chamado e virar pro 1 */
        playerScore: 0,
        computerScore: 0,
        machineLearningStatus: {
            games: 0,
            wins: 0,
            loses: 0,
            winRate: 0.0,
        },
        selectedLine: null,
        lineId: 0,
        boardStatus: [0,0,0],
        numRowsLeft: 3,
    },
    nextLineId: function() {
        return 'line-' + this.gameStatus.lineId++;
    },
    pieceImages: [
        'assets/images/mostarda.png',
        'assets/images/maionese.png',
        'assets/images/ketchup.png',
    ],
    getRandomPieceImage: function() {
        return this.pieceImages[Math.floor(Math.random() * this.pieceImages.length)];
    },
    getRandomPieceStyle: function() {
        return "piece-style-" + Math.floor(Math.random() * 6);
    },
    init: function() {
        self = this;
        $('#btn-reset').click(function() {
            self.btnResetAction();
        });
        $('#btn-play').click(function(e) {
            self.playButtonAction();
        });

        this.resetBoardAndCallNewGame();

    },
    btnResetAction: function() {
        this.resetBoardAndCallNewGame();
    },
    newGame: function() {
        this.gameStatus.gameId = null;

        self = this;

        $.ajax({
            url: 'new-game.php',
            type: 'POST',
            data: {
                gameId: self.gameStatus.gameId,
            },
            success: function(data) {

                self.gameStatus.gameId = data.gameId;
                self.machineLearningStatus = data.machineLearning;
                self.startGame();

            }
        })

    },
    startGame: function() {
        this.showMachineLearningStatus();
        this.showGameStatistics();
        this.updateGameStatistics();

        if( this.gameStatus.lastStartUser == this.PLAYER_ONE ) {
            this.gameStatus.lastStartUser = this.PLAYER_COMPUTER
            this.gameStatus.currentPlaying = this.PLAYER_COMPUTER;
        } else {
            this.gameStatus.lastStartUser = this.PLAYER_ONE
            this.gameStatus.currentPlaying = this.PLAYER_ONE;
        }

        this.showPlayerTurn();

        this.playIfItsComputerRound();

    },
    playIfItsComputerRound: function() {
        if( this.gameStatus.currentPlaying == this.PLAYER_COMPUTER ) {
            self = this;

            var randomTime = Math.floor(Math.random() * 500);

            setTimeout(function(){
                self.computerPlay()
            }, randomTime);
        }
    },
    playButtonAction: function() {
        self = this;
        self.play();
    },
    play: function() {
        let selectedItems = $('.piece.selected')
        if( selectedItems.length == 0 ) {
            window.alert("Você deve selecionar pelo menos uma peça para jogar!");
            return;
        }

        this.removeSelectedPieces();
        
    },
    piecesRemoved: function() {

        if( this.isTheGameOver() ) {
            this.switchPlayer(); // Switch back to the player that won
            this.gameOver();
            return;
        }

        this.showPlayerTurn();

        this.updateGameStatistics();
        
        this.playIfItsComputerRound();
        this.showGameStatistics();
    },
    updateGameStatistics: function() {
        this.boardStatus = this.getBoardStatus();
        this.gameStatus.numRowsLeft = this.boardStatus.filter( (item) => item > 0 ).length;
        
    },
    showPlayerTurn: function() {
        if( soEuGanho.gameStatus.currentPlaying == 1 ) {
            $('.box-player-2').removeClass('vez-do-jogador');
            $('.box-player-1').addClass('vez-do-jogador');
        } else {
            $('.box-player-1').removeClass('vez-do-jogador');
            $('.box-player-2').addClass('vez-do-jogador');
        }
    },
    removeSelectedPieces: function () {

        this.switchPlayer();

        self = this;

        let selectedItems = $('.piece.selected')

        this.animationStatus.numberOfItens = selectedItems.length;

        let direction = this.gameStatus.currentPlaying == this.PLAYER_ONE ? 'Left' : 'Right';
        
        selectedItems.each(function(index, item) {
            randomTime = Math.floor(Math.random() * 500);
            setTimeout( () => $(item).addClass('animate__animated').addClass('animate__zoomOut'+direction), randomTime);
            $(item).on('animationend', (e) => {
                $(e.currentTarget).unbind('animationend');
                $(e.currentTarget).removeClass('animate__animated').removeClass('animate__zoomOut'+direction);
                $(e.currentTarget).remove();
                self.animationStatus.numberOfItens--;
                if( self.animationStatus.numberOfItens == 0 ) {
                    self.piecesRemoved();
                }
            });
        });
            
        /**
        selectedItems.each(function() {
            $(this).remove();
        });
        */
        this.gameStatus.selectedLine = null;
    },
    isTheGameOver: function() {
        return $('.piece').length == 1;
    },
    gameOver: function() {
        var playerName = this.gameStatus.currentPlaying == this.PLAYER_ONE ? 'Player 1' : 'Computer';
        var winnerPlayerNumber = 0;
        if( this.gameStatus.currentPlaying == this.PLAYER_ONE ) {
            this.gameStatus.playerScore++;
            winnerPlayerNumber = this.PLAYER_ONE;
        } else {
            this.gameStatus.computerScore++;
            winnerPlayerNumber = this.PLAYER_COMPUTER;
        }

        $('#player1-score').html(this.gameStatus.playerScore);
        $('#computer-score').html(this.gameStatus.computerScore);

        self = this

        window.alert( "Game over!!! " + playerName + " ganhou!");

        $.ajax({
            url: 'game-over.php',
            type: 'POST',
            data: {
                gameId: self.gameStatus.gameId,
                winnerPlayerNumber: winnerPlayerNumber,
            },
            success: function(data) {
                self.resetBoardAndCallNewGame();
                // self.newGame();
            }
        })

        
        
    },
    switchPlayer: function() {
        this.gameStatus.currentPlaying = (this.gameStatus.currentPlaying == 1) ? 2 : 1;
        
    },
    computerPlay: function() {
        self = this;
        $.ajax({
            url: 'computer-play.php',
            type: 'POST',
            data: {
                gameId: self.gameStatus.gameId,
                board: self.getBoardStatus(),
            },
            success: function(data) {
                self.executeComputerMove(data.move);
            }
        })
    },
    executeComputerMove: function(move) {
        let line = $('.line').eq(move.line);
        linePieces = line.find('.piece');
        linePieces.sort(() => (Math.random() > .5) ? 1 : -1);
        totalComputerTime = 0;
        for( let i = 0; i < move.pieces; i++ ) {
            // random time bewteen 0 and 500
            let randomTime = Math.floor(Math.random() * 500);
            totalComputerTime += randomTime;
            setTimeout(() => $(linePieces[i]).addClass('selected'), randomTime );

        }
        setTimeout(() => this.play(), totalComputerTime + 500);
        // this.play();        
    },
    resetBoardAndCallNewGame: function() {
        this.clearBoard();
        this.addLines();
    },
    showMachineLearningStatus: function() {
        // machineLearningStatus
        $('#summary_games').text(this.machineLearningStatus.games);
        $('#summary_wins').text(this.machineLearningStatus.wins);
        $('#summary_losses').text(this.machineLearningStatus.losses);

    },
    showGameStatistics: function() {
        // Current player
        // $('#jogador').html(this.gameStatus.currentPlaying == this.PLAYER_ONE ? 'Jogador 1' : 'Computador');
        $('.turn-area').removeClass('d-none');

        if( this.gameStatus.currentPlaying == this.PLAYER_ONE ) {
            $('.computer-turn-alert').hide();
            $('.player-one-turn-alert').show();
            $('.btn-play').prop('disabled', false);
        } else {
            $('.computer-turn-alert').show();
            $('.player-one-turn-alert').hide();
            $('.btn-play').prop('disabled', true);
        }
    },
    getBoardStatus: function() {
        let boardStatus = [];
        $('.line').each(function() {
            boardStatus.push($(this).find('.piece').length);
        });
        return boardStatus;
        
    },
    clearBoard: function() {
        $('.board').html('');
    },
    allLinesAddedSoCallNewGame: function() {
        this.newGame();
    },
    addLines: function() {
        this.animationStatus.numberOfItens = 12; // 3+4+5
        this.addLine(3);
        this.addLine(4);
        this.addLine(5);
    },
    addLine: function(numberOfItens) {
        let lineId = this.nextLineId();
        let line = $(`<div class="line" id=${lineId}></div>`);
        for (let i = 0; i < numberOfItens; i++) {
            randomTime = Math.floor(Math.random() * 500);
            setTimeout( () => line.append(this.addPiece(line)), randomTime);
        }
        $('.board').append(line);
    },
    addPiece: function(line) {
        randomImage = this.getRandomPieceImage();
        randomStyle = this.getRandomPieceStyle();
        piece = $('<div class="piece '+randomStyle+'"><img src="'+randomImage+'" class="animate__animated animate__bounceIn"></div>').on('click', this.selectPiece)
        self = this;
        $(piece).on('animationend', (e) => {
            $(e.currentTarget).unbind('animationend');
            $(e.currentTarget).removeClass('animate__animated').removeClass('animate__bounceIn');
            self.animationStatus.numberOfItens--;
            if( self.animationStatus.numberOfItens == 0 ) {
                self.allLinesAddedSoCallNewGame();
            }
        });
        line.append(piece);
    },
    markAsSelected: function(target) {

        let parentId = $(target).parent().attr('id');

        if( this.gameStatus.selectedLine == null ) {
            this.gameStatus.selectedLine = parentId;
        } else {
            if( parentId != this.gameStatus.selectedLine ) {
                window.alert("Você deve selecionar de uma única linha");
                return;
            }
            if( 
                this.gameStatus.numRowsLeft == 1 && 
                ($('.selected').length+1) == $('.piece').length
            ) {
                window.alert("Você deve deixar pelo menos uma peça no tabuleiro");
                return;
            }
        }
        target.addClass('selected');
    },
    markAsUnselected: function(target) {
        target.removeClass('selected');
        if( $('.piece.selected').length == 0 ) this.gameStatus.selectedLine = null;
    },
    selectPiece: function(e) {        

        self = soEuGanho
        if( self.gameStatus.currentPlaying != self.PLAYER_ONE ) return; // Ignora quando não é nossa vez

        let target = $(e.currentTarget);
        if (target.hasClass('selected')) {
            self.markAsUnselected(target);
        } else {
            self.markAsSelected(target);
        }
    },

}

$(function(){
    soEuGanho.init();
})

