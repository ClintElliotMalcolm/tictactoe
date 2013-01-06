//Tic Tac Toe Game Application
//Clint Malcolm

//Play tic tac toe against your friends!

//Board locations stored as a string in the pattern of "XaY" where X is the
//location in the horizontal direction and Y is the location in the vertical
//direction, the a is the char 'a'. All indexs start at zero.
"use strict";
(function () {
	
	//Whether X places or not
	var isX;
	//Whether someone won
	var won;
	//Is it impossible to win
	var draw;
	//Size of the tic tac toe board
	var size;
	//The states of the game you can win from
	var states;
	//The number of spaces you need to get in a row to win
	var winSize;
	
	//The space that is optimal to be taken
	var bufferedSpace;
	//Do I need to check buffer, and timer to check ID
	var needToCheckBuffer;
	//Gamestate
	var gamestate;
	
	//set up
	$(document).ready(setup);	
	
	//Load controls, set up puzzle
	function setup () {
		$("#size").change(updateSize);
		$("#winSize").change(updateWinSize);
		$("#AI").click(checkBuffer);
		$("#reset").click(resetPuzzle);
		size = $("#size").attr("value");
		$("#sizeat").html(size);
		winSize = $("#winSize").attr("value");
		$("#winat").html(winSize);
		$("#winSize").attr("max", size);
		$("#content").css("width", 100*size);
		$("#grid").css("width", 100*size);
		$("#grid").css("height", 100*size);
		resetPuzzle();
	}
	
	//Look to see if there is a space available to place, and keep checking
	function checkBuffer() {
		if(!needToCheckBuffer) {
			needToCheckBuffer = setInterval(checkBuffer, 100);
		}
		if(bufferedSpace) {
			displayPieceHelper($("#"+bufferedSpace)); 
			placePieceHelper($("#"+bufferedSpace));
			bufferedSpace = null;
			clearInterval(needToCheckBuffer);
			needToCheckBuffer = null;
		}
	}
	
	//Updates the size of the puzzle
	function updateSize () {
		var oldSize = size;
		size = $("#size").attr("value");
		$("#sizeat").html(size);
		$("#winSize").attr("max", size);
		$("#content").css("width", 100*size);
		$("#grid").css("width", 100*size);
		$("#grid").css("height", 100*size);
		if( winSize == oldSize ) {
			$("#winSize").attr("value", size);
			winSize = size;
			$("#winat").html(winSize);
		}
		resetPuzzle();
	}
	
	//Updates the size needed to win
	function updateWinSize () {
		winSize = $("#winSize").attr("value");
		$("#winat").html(winSize);
		resetPuzzle();
	}
	
	//Get all valid ways to win
	function generateWinningStates () {
		states = [];
		
		for (var xSpot = 0; xSpot < parseInt(size) + 1 - winSize; xSpot++) {
			for (var ySpot = 0; ySpot < parseInt(size) + 1 - winSize; ySpot++) {
				//horizontals
				var currentState = [];
				for (var i = 0; i < winSize; i++) {
					for (var j = 0; j < winSize; j++) {
						currentState.push(parseInt(xSpot)+i+"a"+(parseInt(ySpot)+j));
					}
					states.push(currentState);
					currentState = [];
				}
				
				//verticals
				for (var j = 0; j < winSize; j++) {
					for (var i = 0; i < winSize; i++) {
						currentState.push(parseInt(xSpot)+i+"a"+(parseInt(ySpot)+j));
					}
					states.push(currentState);
					currentState = [];
				}
				
				//diagonal
				currentState = [];
				for (var i = 0; i < winSize; i++) {
					currentState.push(parseInt(xSpot)+i+"a"+(parseInt(ySpot)+i));
				}
				states.push(currentState);
				
				//antidiagonal
				currentState = [];
				for (var i = 0; i < winSize; i++) {
					currentState.push((xSpot + parseInt(winSize) - 1 - i)+"a"+(parseInt(ySpot)+i));
				}
				states.push(currentState);
			}
		}
	}
	
	//reset game state variables
	function resetVariables() {
		isX = true;
		won = false;
		draw = false;
		$("#congrats").hide();
		clearInterval(needToCheckBuffer);
		needToCheckBuffer = null;
		gamestate = {};
	}
	
	//Update the puzzle to have a new size
	function resetPuzzle() {
		//change state variables
		resetVariables();
		
		//set game pieces
		$("#grid").html("");
		for(var i = 0; i < size; i++) {
			for(var j = 0; j < size; j++) {
				var piece = $('<div>', {
								"class" : "gridPiece",
								"id" : i + "a" + j
							});
				var x = $('<img>', {
							"src" : "x.png",
							"alt" : "an x piece",
							"id" : i + "a" + j + "x"
						});
				var o = $('<img>', {
							"src" : "o.png",
							"alt" : "an o piece",
							"id" : i + "a" + j + "o"
						});
				var xVal = i * 100;
				var yVal =  j * 100;
				piece.css("left",xVal);
				piece.css("top",yVal);
				x.hide();
				x.addClass("notyetselected");
				o.hide();
				o.addClass("notyetselected");
				piece.append(x,o);
				piece.mouseover(displayPiece);
				piece.mouseout(hidePiece);
				piece.click(placePiece);
				$("#grid").append(piece);
			}
		}
		generateWinningStates();
		getAINextMove();
	}

	//Display the piece that this was called from, but it is not yet selected
	function displayPiece () {
		displayPieceHelper($(this));
	}
	
	//Display the image shown, but it isnot yet selected
	function displayPieceHelper (div) {
		if(!div.hasClass("selected") && !won && !draw) {
			var what = isX ? "x" : "o";
			$("#" + div.attr("id") + what).show();
		}
	}
	
	//hide the image shown
	function hidePiece () {
		if(!$(this).hasClass("selected") && !won && !draw) {
			var what = isX ? "x" : "o";
			$("#" + $(this).attr("id") + what).hide();
		}
	}
	
	//place the piece this was called from
	function placePiece () {
		placePieceHelper($(this));
	}
	
	//Place the piece on the div passed
	function placePieceHelper (div) {
		if(!div.hasClass("selected") && !won && !draw) {
			var what = isX ? "x" : "o";
			$("#" + div.attr("id") + what).removeClass("notyetselected");
			gamestate[div.attr("id")] = what;
			isX = !isX;
			div.addClass("selected");
			div.addClass(what);
			
			if(hasWon()) {
				won = true;
				$("#congrats").html(what.toUpperCase() + " has won!");
				$("#congrats").show();
			} else if(isDraw()) {
				draw = true;
				$("#congrats").html("Draw");
				$("#congrats").show();
			}
			getAINextMove();
		}
	}

	//Get the x coordinate of the div passed
	function getX (div) {
		return parseInt(div.attr("id"));
	}
	
	//Get the y coordiante of the div passed
	function getY (div) {
		var id = div.attr("id");
		var index = id.indexOf("a");
		return id.substring(parseInt(index)+1);
	}
	
	//Checks to see if the game is in a won state
	function hasWon () {
		for(var i = 0; i < states.length; i++) {
			var state = states[i];
			var countX = 0;
			var countO = 0;
			for(var j = 0; j < state.length; j++) {
				if($("#"+state[j]).hasClass("x")) {
					countX++;
				} else if($("#"+state[j]).hasClass("o")) {
					countO++;
				}
				if (countX > 0 && countO > 0) {
					break;
				} else if (countX == state.length || countO == state.length) {
					return true;
				}
			}
		}
		return false;
	}
	
	//Checks to see if the game is still possible to win
	function isDraw () {
		var impossibleStates = 0;
		for(var i = 0; i < states.length; i++) {
			var state = states[i];
			var countX = 0;
			var countO = 0;
			for(var j = 0; j < state.length; j++) {
				if($("#"+state[j]).hasClass("x")) {
					countX++;
				} else if($("#"+state[j]).hasClass("o")) {
					countO++;
				}
				if (countX > 0 && countO > 0) {
					impossibleStates++;
					break;
				}
			}
		}
		return (impossibleStates == states.length);
	}
	
	//Place next optimal move into buffer.
	function getAINextMove() {
		var symb = isX ? "x" : "o";
		var data = {
			"symbol":symb,
			"ws":states,
			"s":size,
			"wsize":winSize,
			"states":states,
			"spots":gamestate};
		console.log(JSON.stringify(data));
		$.post("tictacsolver.php", 
			{"gs":JSON.stringify(data),"type":"single"},
			function(data,status) {
				bufferedSpace = data["spot"];
			});
	}
})();