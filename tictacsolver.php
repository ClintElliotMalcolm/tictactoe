<?php
	if(isset($_POST["gs"])) {
		$game = json_decode($_POST["gs"], true);
		$combinations = $game["states"];
		$ws = $game["ws"];
		$size = $game["s"];
		$winSize = $game["wsize"];
		$spots = $game["spots"];
		$depth = max(ceil(5-count($ws)/8),3);
		header("Content-type: application/json");
		if(isset($_POST["type"])) {
			if($_POST["type"] == "single") {
				print json_encode(minimax($depth, $game["symbol"], $game["symbol"], null, null,
						 $ws, $size, $winSize, $spots, $combinations));
			} elseif ($_POST["type"] == "multi") {
				$availables = generateMoves($ws, $spots, $size, $winSize);
				$moveIfSpotChosen = array();
				$other = ($game["symbol"] == "x") ? "o" : "x";
				foreach($availables as $available) {
					$spots[$available] = $game["symbol"];
					$moveIfSpotChosen[$available] = minimax($depth, $other, $other,
							null, null, $ws, $size, $winSize, $spots, $combinations);
					$spots[$available] = " ";
				}
				print json_encode(array("spots" => $moveIfSpotChosen));
			}
		}
	}
	
	//Generate the score of this state of the game
	function evaluate($winningspot, $comp, $points, $symbol) {
		$score = 0;
		$other = ($comp == "x") ? "o" : "x";
		foreach($winningspot as $spot) {
			$score = $score + evaluateLine($spot,$points,$comp,$other,$symbol);
		}
		return $score;
	}
	
	//Get the score of an individual sequence of cells
	function evaluateLine($cells, $points, $comp, $notComp, $symbol) {
		$countX = 0;
		$countO = 0;
		
		//Count the number of Xs and Os
		foreach ($cells as $cell) {
			if ($points[$cell] == "x") {
				$countX++;
			} elseif ($points[$cell] == "o") {
				$countO++;
			}
		}
		
		//generate the score
		$neg = ($comp == "x") ? 1 : -1;
		if ($countO == 0) {
			return $neg * pow(10, $countX);
		} elseif ($countX == 0) {
			return $neg * (-1) * pow(10, $countO);
		}
		return 0;
	}
	
	//Get valid moves
	function generateMoves ($winningspots, $spots, $size, $winSize) {
		$moves = array();
		if ( !hasWon($winningspots, $spots, $winSize) && !isDraw($winningspots, $spots)) {
			for ($i = 0; $i < $size; $i++) {
				for ($j = 0; $j < $size; $j++) {
					if(!($spots[$i."a".$j] == "x" || $spots[$i."a".$j] == "o")) {
						$moves[] = $i."a".$j;
					}
				}
			}
		}
		return $moves;
	}
	
	//Check if the game state is a draw
	function isDraw($winningspots, $spots) {
		$impossibleStates = 0;
		foreach($winningspots as $winstate) {
			$countX = 0;
			$countO = 0;
			foreach ($winstate as $wincell) {
				if($spots[$wincell] == "x") {
					$countX++;
				} else if($spots[$wincell] == "o") {
					$countO++;
				}
				if ($countX > 0 && $countO > 0) {
					$impossibleStates++;
					break;
				}
			}
		}
		return ($impossibleStates == count($winningspots));
	}
	
	//Check if the game state is a win
	function hasWon($winningspots, $spots, $size) {
		foreach($winningspots as $winspot) {
			$countX = 0;
			$countO = 0;
			foreach($winspot as $ws) {
				if($spots[$ws] == "x") {
					$countX++;
				} elseif($spots[$ws] == "o") {
					$countO++;
				}
				if ($countX > 0 && $countO > 0) {
					break;
				} else if ($countX == $size || $countO == $size) {
					return true;
				}
			}
		}
		return false;
	}
	
	//Finds the optimal space to place. It minimizes the possible loss for a worst case (maximum loss) scenario.
	function minimax($depth, $symbol, $compSymb, $alpha, $beta, $winningspots,
			$size, $winSize, $spots, $combinations) {
		$score;
		$bestSpot;
		//Get moves
		$moves = generateMoves($winningspots, $spots, $size, $winSize);
		
		//If no valid moves, or reach the depth then stop.
		if (count($moves) == 0 || $depth == 0) {
			$score = evaluate($winningspots, $compSymb, $spots, $symbol);
			return array("score" => $score, 
					"spot" => $bestSpot);
		}
		$otherSymbol = ($symbol == "x") ? "o" : "x";
		
		//Look how each move turns out
		foreach($moves as $move) {
			$spots[$move] = $symbol;
			$data = minimax($depth - 1, $otherSymbol, $compSymb, $alpha, 
					$beta, $winningspots, $size, $winSize, $spots, $combinations);
			$score = $data["score"];
			if ($symbol == $compSymb) {
				if(!isset($alpha) || $score > $alpha) {
					$alpha = $score;
					$bestSpot = $move;
				} 
			} else {
				if(!isset($beta) || $score < $beta) {
					$beta = $score;
					$bestSpot = $move;
				}
			}
			$spots[$move] = " ";
			//Alpha-beta cut off
			if (isset($alpha) && isset($beta) && $alpha >= $beta) break;
		}
		
		//Return best move
		return array("score" => (($symbol == $compSymb) ? $alpha : $beta),
				"spot" => $bestSpot);
	}
?>