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
			sum += wlines[i][j];
		}
		if(sum==n) {
			return 1;
		} else if(sum==-n) {
			return -1;
		}
	}
	return 0;
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
	[[6,10],[5,11]],
	[[12,9],[8,13]],
	[[9,10],[13,14]],
	[[15,10],[11,14]]
];

function turn_four(playermove, random) {
	var situation = get_situation_four();
	if(!valid_move(playermove, situation)) {
		alert("Invalid move! Try again.");
		return;
	}
	situation[playermove] = 1;
	for(var i = 0; i < newgamesize; i++) {
		tab_original_four(i).innerHTML = situation[i];
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
		situation_three[i] = rep.p;
	}
	set_situation(situation_three, tab_original);

	// feed to 3x3 neural network
	if(random) {
		move = random_move(situation);
	} else {
		move = machine_move(situation_three, false);
	}
	situation_three[move.move_chosen] = -1;
	for(var i = 0; i < gamesize; i++) {
		tab_probs(i).innerHTML = move.prob_table[i].toFixed(3);
		tab_movement(i).innerHTML = situation_three[i];
	}

	// complexify into 4x4 situation
	/*for(var i = 0; i < 9; i++) {
		// select by priority: try elems. of first array, then second
		var choices = priorities[i];
		// first choices
		for(var j = 0; j < choices[0].length; j++) {
			while(true) {
				var c = choices[0][random_range(0,choices[0].length-1)];
				if()
			}
		}
	}*/
	var finalmove = null;
	var choices = priorities[move.move_chosen];
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
		console.log("trying second choice");
		for(var j = 0; j < choices[1].length; j++) {
			while(true) {
				if(choices[1].length == 0) {
					break;
				}
				var cindex = random_range(0,choices[1].length-1);
				var c = choices[1][cindex];
				if(situation[c] == 0) {
					finalmove = c;
					break;
				}
				choices[1].splice(cindex, 1);
			}
		}
	}
	console.log("finally moving to " + finalmove);
	situation[finalmove] = -1;
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

	return move;
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
