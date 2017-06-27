var board = [];
var turn = 1;
var isGameOver = false;
var vsAI = true;
var horizontalWinConditions = [[],[],[]];
var verticalWinConditions = [[], [], []];
var diagonalWinConditions = [[], []];
var winConditions = [];

function square(x, y, owner) {
	this.x = x;
	this.y = y;
	this.owner = owner;
}

function gameStart() {
	initialiseBoard();
	populateWinConditions();
}

function gameRestart() {
	console.log(winConditions);
	aiMoves = [];
	playerMoves = [];
	board = [];
	combinedMoves = [];
	turn = 1;
	isGameOver = false;
	initialiseBoard();
	clearBoard();
}

function initialiseBoard() {
	for (var i = 0; i < 3; i++) {
		for (var n = 0; n < 3; n++) {
			board.push(new square(i, n, 0));
		}
	}
}

function populateWinConditions() {
	for (var i = 0; i < board.length; i++) {
		for (var n = 0; n < 3; n++) {
			if (board[i]['x'] == n) {
				horizontalWinConditions[n].push(i);
			}
			if (board[i]['y'] == n) {
				verticalWinConditions[n].push(i);
			}
		}
		if (board[i]['x'] == board[i]['y']) {
			diagonalWinConditions[0].push(i);
		}
		if (board[i]['x'] + board[i]['y'] == 2) {
			diagonalWinConditions[1].push(i);
		}
	}
	winConditions = [
		horizontalWinConditions[0],
		horizontalWinConditions[1],
		horizontalWinConditions[2],
		verticalWinConditions[0],
		verticalWinConditions[1],
		verticalWinConditions[2],
		diagonalWinConditions[0],
		diagonalWinConditions[1]
	];
}

function checkWinConditions() { // returns the integer of the winner. P1 win -> 1, P2 win -> 2, none -> 0.
	for (var i =0; i< winConditions.length; i++){
		if (areEqual(board[winConditions[i][0]]['owner']
		,board[winConditions[i][1]]['owner']
		,board[winConditions[i][2]]['owner']
		)){
			return board[winConditions[i][0]]['owner'];
		}
	}
	return 0;
}

function areEqual() {
	var len = arguments.length;
	for (var i = 1; i < len; i++) {
		if (arguments[i] === 0 || arguments[i] !== arguments[i - 1]) // 0 is empty square
			return false;
	}
	return true;
}

// --------- player moves ---------

function onSquareClick(square) {
	// check whether it is a valid time to move
	if (vsAI && turn != 1
		|| square['owner'] !== 0
		|| isGameOver) {
		return;
	}
	// if its not, the active player takes the square
	square['owner'] = turn;
	drawBoard();
	// check for win condition
	if (checkWinConditions() > 0) {
		isGameOver = true;
		$('#winner').html("Winner is: " + checkWinConditions());
		// TODO: do winner stuff

	}
	// change turn
	turn == 1 ? turn = 2 : turn = 1;
	
	if(vsAI){
		aiMove();
		drawBoard();
		if (checkWinConditions() > 0) {
			isGameOver = true;
			$('#winner').html("Winner is: " + checkWinConditions());
		// TODO: do winner stuff
		}
	}
	// if playing against AI, ai moves after player makes his move
}

// --------- DOM manipuation ---------
$(document).ready(function () {
	gameStart();
});

$('.square').click(function (e) {
	onSquareClick(board[e.target.id]);
});

$('#restart').click(function (e) {
	gameRestart();
	$('#winner').html("");
})

function drawBoard() {
	for (var i = 0; i < board.length; i++) {
		$('#' + i).html(board[i]['owner']);
	}
}
function clearBoard() {
	for (var i = 0; i < board.length; i++) {
		$('#' + i).html('');
	}
}

// --------- AI ---------

function aiMove() {
	// 1. if there is an immediate win condition, place there
	// 2. if there is an immediate lose condition, place there
	// 3. check for double prong possibility
	// 4. try to make 2
	// 5. randomise?
	if(isGameOver){
		return;
	}	

	if (immediateEndCheck('ai')) { // 1.
		board[immediateEndCheck('ai')-1]['owner'] = 2;
		turn = 1;
		console.log("I win!");
		return;
	}
	if (immediateEndCheck('player')) { // 2.
		board[immediateEndCheck('player')- 1]['owner'] = 2;
		turn = 1;
		console.log('block!');
		return;
	}
	if (connectTwo()){
		board[connectTwo() - 1]['owner'] = 2;	
		turn = 1;
		return;
	}
	if (typeof randomMove() == "number") {
		//console.log(board[randomMove()]);
		board[randomMove()]['owner'] = 2;
		turn = 1;
		console.log("random");
		//console.log(board);
		return;
	}
	return;
}

function immediateEndCheck(str) { // returns the winning move(number) or false
    endCheck:
	for (var i = 0; i < winConditions.length; i++) {
		var counter = 0;
		for (var n = 0; n < 3; n++){
			if (board[winConditions[i][n]]['owner']=== (str === 'ai' ? 2 : 1)){
				counter++;
			}
			if (board[winConditions[i][n]]['owner']=== (str === 'ai' ? 1 : 2)){
				continue endCheck;
			}
		}
		if (counter === 2){
			for (var n = 0; n < 3; n++){
				if (board[winConditions[i][n]]['owner']=== 0){
					return winConditions[i][n] + 1;
				}
			}
		}
	}
	return false;
}

function connectTwo(){
	if(aiMoves.length == 0){
		return false;
	}	
	var candidateIndex = [];
	loop1:
	for (var i = 0; i <  winConditions.length; i++){
		var counter = 0;
		for (var n = 0; n < winConditions[i].length; n++){
			if (board[winConditions[i][n]]['owner'] === 2){
				counter++;
			}
			if (board[winConditions[i][n]]['owner'] === 1){
				continue loop1;
			}
		}
		if (counter === 1){
			candidateIndex.push(i);
		}
	}
	if (candidateIndex.length > 0){
		for (var i =0; i < 3; i++){
			if (board[winConditions[candidateIndex[0]][i]]['owner'] ===0){
				return winConditions[candidateIndex[0]][i] + 1;
			}
		}
	} 
	return false;
}

function randomMove(){
	var moves = [0,1,2,3,4,5,6,7,8];
	moves = shuffleArray(moves);
	for (var i = 0; i < board.length; i++) {
		if(board[moves[i]]['owner'] === 0){
			return moves[i];
		}	
	}
	return false;
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}