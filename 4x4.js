var newgamesize=16;

/***************************
*** 4X4 SPECIFIC FUNCTIONS
***************************/
function byfour() {
	reset();
	reset_four();
}

function tab_original_four(i) {
	return document.querySelectorAll("#original_four .tab-" + i.toString())[0];
}
function tab_probs_four(i) {
	return document.querySelectorAll("#probtab_four .tab-" + i.toString())[0];
}
function tab_movement_four(i) {
	return document.querySelectorAll("#movement_four .tab-" + i.toString())[0];
}

function reset_four() {
	for(var i = 0; i < newgamesize; i++) {
		tab_original_four(i).innerHTML = "0";
		tab_movement_four(i).innerHTML = "--";
	}
}

function get_situation_four() {
	var situation = new Array(newgamesize);
	for(var i = 0; i < newgamesize; i++) {
		situation[i] = parseInt(tab_original_four(i).innerHTML);
	}
	return situation;
}

function set_situation(situation, accessor) {
	for(var i = 0; i < situation.length; i++) {
		accessor(i).innerHTML = situation[i];
	}
}

function find_win(situation) {
	var n = Math.sqrt(situation.length);
	var wlines = lines_new[n.toString()];
	for(var i = 0; i < wlines.length; i++) {
		var sum = 0;
		for(var j = 0; j < wlines[i].length; j++) {
			sum += situation[wlines[i][j]];
		}
		if(sum==n) {
			return 1;
		} else if(sum==-n) {
			return -1;
		}
	}
	return 0;
}
function is_draw(situation) {
	for(var i = 0; i < situation.length; i++) {
		if(situation[i] == 0) {
			return false;
		}
	}
	return true;
}

/***************************
*** THE LOGIC OF IT ALL
***************************/
var averages = [
	[0,1,4,5],
	[1,2,5,6],
	[2,3,6,7],
	[4,5,8,9],
	[5,6,9,10],
	[6,7,10,11],
	[8,9,12,13],
	[9,10,13,14],
	[10,11,14,15]
];
var priorities = [
	[[0,5],[1,4]],
	[[5,6],[1,2]],
	[[3,6],[2,5]],
	[[5,9],[4,8]],
	[[5,6,9,10],[]],
	[[6,10],[7,11]],
	[[12,9],[8,13]],
	[[9,10],[13,14]],
	[[15,10],[11,14]]
];
var adjacents = [
	[1,3,4],
	[0,4,2],
	[1,4,5],
	[0,4,6],
	[1,3,5,7],
	[2,4,8],
	[3,4,7],
	[6,4,8],
	[7,4,5]
];

function fourify_threemove(situation, move) {
	var finalmove = null;
	var choices = JSON.parse(JSON.stringify(priorities[move.move_chosen]));
	// high priority moves
	for(var j = 0; j < choices[0].length; j++) {
		while(true) {
			if(choices[0].length == 0) {
				break;
			}
			var cindex = random_range(0,choices[0].length-1);
			var c = choices[0][cindex];
			if(situation[c] == 0) {
				finalmove = c;
				break;
			}
			choices[0].splice(cindex, 1);
		}
	}
	if(finalmove == null) {
		if(choices[1].length == 0) {
			// MIDDLE THINGY IS FULL!!! CHOOSE ADJACENT
			var adj = [0,1,2,3,5,6,7,8];
			return fourify_threemove(situation, {move_chosen: adj[random_range(0,adj.length-1)], over: false});
		}
		for(var j = 0; j < choices[1].length; j++) {
			while(true) {
				if(choices[1].length == 0) {
					// probably a draw -- find adjacent
					//alert("couldn't find good position!!");
					//return {over: true, won: 0};
					//alert("adjacent thingy is " + move.move_chosen);
					var adj = adjacents[move.move_chosen].slice();
					return fourify_threemove(situation, {move_chosen: adj[random_range(0,adj.length-1)]});
					break;
				}
				var cindex = random_range(0,choices[1].length-1);
				var c = choices[1][cindex];
				choices[1].splice(cindex, 1);
				if(situation[c] == 0) {
					finalmove = c;
					break;
				}
			}
		}
	}
	return {move_chosen:finalmove, over:false};
}

function turn_four(playermove, random) {
	var situation = get_situation_four();
	if(!valid_move(playermove, situation)) {
		alert("Invalid move! Try again.");
		return {over:false};
	}
	situation[playermove] = 1;
	for(var i = 0; i < newgamesize; i++) {
		tab_original_four(i).innerHTML = situation[i];
	}

	// check if this move won
	var won = find_win(situation);
	if(won!=0) {
		return {won:won, over:true};
	}
	// check if this move is a draw
	if(is_draw(situation)) {
		return {won:0, over:true};
	}

	var move = null;
	// simplify 4x4 board into 3x3 situation
	var situation_three = new Array(9);

	for(var i = 0; i < averages.length; i++) {
		var p = [
			{val:0, p:0},
			{val:0, p:1},
			{val:0, p:-1}
		];
		for(var j = 0; j < averages[i].length; j++) {
			var cell = parseInt(tab_original_four(averages[i][j]).innerHTML);
			if(cell==0) {
				p[0].val += 1;
			} else if(cell==1) {
				p[1].val += 1;
			} else if(cell==-1) {
				p[2].val += 1;
			}
		}
		p = p.filter(e => e.val !== 1);
		p = p.filter(e => e.val !== 0);
		// choose a random representative
		var rep = p[random_range(0,p.length-1)];
		// OOOR: give priority to PLAYER if it is EMPTY v. PLAYER!!
		situation_three[i] = rep.p;
	}
	set_situation(situation_three, tab_original);

	// feed to 3x3 neural network
	var finalmove = null;
	if(random) {
		finalmove = random_move(situation);
	} else {
		move = machine_move(situation_three, false);
		situation_three[move.move_chosen] = -1;
		for(var i = 0; i < gamesize; i++) {
			tab_probs(i).innerHTML = move.prob_table[i].toFixed(3);
			tab_movement(i).innerHTML = situation_three[i];
		}
		finalmove = fourify_threemove(situation, move);
	}

	if(finalmove.over) {
		for(var i = 0; i < newgamesize; i++) {
			tab_movement_four(i).innerHTML = situation[i];
		}
		return finalmove;
	}

	situation[finalmove.move_chosen] = -1;
	// check win
	var won = find_win(situation);
	if(won!=0) {
		for(var i = 0; i < newgamesize; i++) {
			tab_movement_four(i).innerHTML = situation[i];
		}
		return {won:won, over:true};
	}

	for(var i = 0; i < newgamesize; i++) {
		tab_movement_four(i).innerHTML = situation[i];
	}

	but_next.disabled = false;
	but_subt.disabled = true;

	return {over:false, move_chosen:finalmove.move_chosen};
}
function manual_turn_four() {
	var t = turn_four(parseInt(val_pmove.value), chk_randop.checked);
	if(t.over) {
		//reset();
		but_subt.disabled = true;
	}
}

function nturn_four() {
	for(var i = 0; i < newgamesize; i++) {
		tab_original_four(i).innerHTML = tab_movement_four(i).innerHTML;
		tab_movement_four(i).innerHTML = "--";
	}
	reset(); // resets 3x3 part
}

function game_rand_four() {
	reset();
	reset_four();
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
		reset();
		reset_four();

		var move = null;
		var m_move = null;
		var situation = null;

		var turn = 0;
		while(true) {
			turn += 1;

			situation = get_situation_four();
			if(is_draw(situation)) {
				draw += 1;
				break;
			}
			while(true) {
				move = random_range(0,15);
				if(situation[move] == 0) {
					break;
				}
			}

			m_move = turn_four(move, randop);
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
			situation[m_move.move_chosen] = -1;
			nturn_four();
			//sleep_for(1000);
		}

		situation = null;
	}

	console.log(times + " epochs: " + won + " won, " + lost + " lost, "+ draw + " draw");
	console.log("p(win) = " + won/times);
}
