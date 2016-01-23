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
		var sum = 0;
		for(var j = 0; j < averages[i].length; j++) {
			sum += parseInt(tab_original_four(averages[i][j]).innerHTML);
		}
		situation_three[i] = sum/averages[i].length;
		console.log(sum);
	}
	set_situation(situation_three, tab_original);

	// feed to 3x3 neural network
	// get result, complexify into 4x4 situation
}
function manual_turn_four() {
	var t = turn_four(parseInt(val_pmove.value), chk_randop.checked);
	if(t.over) {
		//reset();
		but_subt.disabled = true;
	}
}
