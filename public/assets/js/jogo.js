
const soEuGanho = {
    PLAYER_ONE: 1,
    PLAYER_COMPUTER: 2,
    gameStatus: {
        gameId: '',
        currentPlaying: 1, /* 1 = player, 2 = computer */
        lastStartUser: 2, /* Vai ser chamado e virar pro 1 */
        playerScore: 0,
        computerScore: 0,
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
            self.newGame();
        });
        $('#btn-play').click(function(e) {
            self.playButtonAction();
        });

        self.newGame();
    },
    newGame: function() {

        this.gameStatus.gameId = null;

        this.resetBoard();

        self = this;

        $.ajax({
            url: 'new-game.php',
            type: 'POST',
            data: {
                gameId: self.gameStatus.gameId,
            },
            success: function(data) {

                self.gameStatus.gameId = data.gameId;
                self.startGame();

            }
        })

    },
    startGame: function() {
        this.showGameStatistics();
        this.updateGameStatistics();

        if( this.gameStatus.lastStartUser == this.PLAYER_ONE ) {
            this.gameStatus.lastStartUser = this.PLAYER_COMPUTER
            this.gameStatus.currentPlaying = this.PLAYER_COMPUTER;
        } else {
            this.gameStatus.lastStartUser = this.PLAYER_ONE
            this.gameStatus.currentPlaying = this.PLAYER_ONE;
        }

        this.playIfItsComputerRound();

    },
    playIfItsComputerRound: function() {
        if( this.gameStatus.currentPlaying == this.PLAYER_COMPUTER ) {
            this.computerPlay();
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
        if( this.isTheGameOver() ) {
            this.gameOver();
            return;
        }

        this.updateGameStatistics();
        this.switchPlayer();
        this.showGameStatistics();
        
    },
    updateGameStatistics: function() {
        this.boardStatus = this.getBoardStatus();
        this.gameStatus.numRowsLeft = this.boardStatus.filter( (item) => item > 0 ).length;
        
    },
    removeSelectedPieces: function () {
        let selectedItems = $('.piece.selected')
        selectedItems.each(function() {
            $(this).remove();
        });
        this.gameStatus.selectedLine = null;
    },
    isTheGameOver: function() {
        return $('.piece').length == 1;
    },
    gameOver: function() {
        var playerName = this.gameStatus.currentPlaying == this.PLAYER_ONE ? 'Player 1' : 'Computer';
        if( this.gameStatus.currentPlaying == this.PLAYER_ONE ) {
            this.gameStatus.playerScore++;
        } else {
            this.gameStatus.computerScore++;
        }

        self = this

        window.alert( "Game over!!! " + playerName + " ganhou!");

        $.ajax({
            url: 'game-over.php',
            type: 'POST',
            data: {
                gameId: self.gameStatus.gameId,
                winnerPlayerNumber: self.gameStatus.currentPlaying,
            },
            success: function(data) {
                self.newGame();
            }
        })

        
        
    },
    switchPlayer: function() {
        this.gameStatus.currentPlaying = (this.gameStatus.currentPlaying == 1) ? 2 : 1;
        this.playIfItsComputerRound();
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
        for( let i = 0; i < move.pieces; i++ ) {
            $(linePieces[i]).addClass('selected');
        }
        this.play();        
    },
    resetBoard: function() {
        this.clearBoard();
        this.addLines();
    },
    showGameStatistics: function() {
        // Current player
        $('#jogador').html(this.gameStatus.currentPlaying == this.PLAYER_ONE ? 'Jogador 1' : 'Computador');
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
    addLines: function() {
        this.addLine(3);
        this.addLine(4);
        this.addLine(5);
    },
    addLine: function(numberOfItens) {
        let lineId = this.nextLineId();
        let line = $(`<div class="line" id=${lineId}></div>`);
        for (let i = 0; i < numberOfItens; i++) {
            randomImage = this.getRandomPieceImage();
            randomStyle = this.getRandomPieceStyle();
            piece = $('<div class="piece '+randomStyle+'"><img src="'+randomImage+'"></div>').on('click', this.selectPiece)
            line.append(piece);
        }
        $('.board').append(line);
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

