var gamesize=9;

function bythree() {
	but_next = document.getElementById("nturnbut");
	but_subt = document.getElementById("submibut")
	val_epoch = document.getElementById("epoch");
	val_pmove = document.getElementById("pturn");
	chk_randop = document.getElementById("randop");

	reset();
}

function get_situation() {
	var situation = new Array(gamesize);
	for(var i = 0; i < gamesize; i++) {
		situation[i] = parseInt(tab_original(i).innerHTML);
	}
	return situation;
}

function turn(playermove, random) {
	var situation = get_situation();
	if(!valid_move(playermove, situation, gamesize)) {
		alert("Invalid move ("+playermove+")! Try again.");
		return;
	}
	situation[playermove] = 1;
	for(var i = 0; i < gamesize; i++) {
		tab_original(i).innerHTML = situation[i];
	}

	var move = null;
	if(random) {
		move = random_move(situation);
	} else {
		move = machine_move(situation);
	}

	//console.log("machine moving to " + move.move_chosen);
	situation[move.move_chosen] = -1

	if(move.over) {
		//console.log("-> game over, player " + move.won + " won!");
		//console.log("final situation: " + situation);
		for(var i = 0; i < gamesize; i++) {
			tab_movement(i).innerHTML = situation[i];
		}
		return move;
	}

	for(var i = 0; i < gamesize; i++) {
		tab_probs(i).innerHTML = move.prob_table[i].toFixed(3);
		tab_movement(i).innerHTML = situation[i];
	}

	but_next.disabled = false;
	but_subt.disabled = true;

	return move;
}

function manual_turn() {
	var t = turn(parseInt(val_pmove.value), chk_randop.checked);
	if(t.over) {
		//reset();
		but_subt.disabled = true;
	}
}

function nturn() {
	for(var i = 0; i < gamesize; i++) {
		tab_original(i).innerHTML = tab_movement(i).innerHTML;
		tab_movement(i).innerHTML = "--";
		tab_probs(i).innerHTML = "--";
	}
	but_next.disabled = true;
	but_subt.disabled = false;
}

function reset() {
	for(var i = 0; i < gamesize; i++) {
		tab_original(i).innerHTML = "0";
		tab_movement(i).innerHTML = "--";
		tab_probs(i).innerHTML = "--";
	}
	but_next.disabled = true;
	but_subt.disabled = false;
}

function game_rand() {
	reset();
	var times = parseInt(val_epoch.value);
	var won = 0;
	var lost = 0;
	var draw = 0;
	var randop = chk_randop.checked;

	if(!randop) {
		console.log("playing against N.NETW PLAYER");
	} else {
		console.log("playing against RANDOM PLAYER");
	}

	for(var i = 0; i < times; i++) {
		// this is a game
		reset();

		var move = null;
		var m_move = null;
		var situation = null;

		while(true) {
			situation = get_situation();
			while(true) {
				move = random_range(0,8);
				if(situation[move] == 0) {
					break;
				}
			}

			m_move = turn(move, randop);
			if(m_move.over == true) {
				if(m_move.won == 1) {
					won += 1;
				} else if(m_move.won == -1) {
					lost += 1;
				} else if(m_move.won == 0) {
					draw += 1;
				}
				break;
			}
			nturn();
		}

		situation=null;
	}

	console.log(times + " epochs: " + won + " won, " + lost + " lost, "+ draw + " draw");
	console.log("p(win) = " + won/times);
}
