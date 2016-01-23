
function random_range(min, max) {
	return Math.floor(Math.random()*(max-min+1)+min);
}
function max_ele(arr) {
	var maxx = arr[0];
	var temp = 0;
	for(var i = 1; i < arr.length; i++) {
		if(arr[i] > maxx) {
			temp = i;
			maxx = arr[i];
		}
	}
	return temp;
}
function sleep_for(milis) {
	var now = new Date().getTime();
	while(new Date().getTime() < now + milis){}
}

function transform(frome, transf) {
	var to = new Array(transf.length);
	for(var j = 0; j < transf.length; j++) {
		to[j] = frome[transf[j]];
	}
	return to;
}
function transform_o(frome, transf) {
	return transf.map(function(x){return x;}).indexOf(frome);
}

function valid_move(move, situation, size) {
	return !(move > size || move < 0 || situation[move] != 0);
}

var net; // declared outside -> global variable in window scope
function tab_original(i) {
	return document.querySelectorAll("#original .tab-" + i.toString())[0];
}
function tab_probs(i) {
	return document.querySelectorAll("#probtab .tab-" + i.toString())[0];
}
function tab_movement(i) {
	return document.querySelectorAll("#movement .tab-" + i.toString())[0];
}
var but_next = null;
var but_subt = null;
var val_epoch = null;
var val_pmove = null;
var chk_randop = null;
var lines = [
	[0,1,2],
	[3,4,5],
	[6,7,8],
	[0,3,6],
	[1,4,7],
	[2,5,8],
	[0,4,8],
	[2,4,6]
];

function start() {

	var layers = [];
	layers.push({type:'input', out_sx:1, out_sy:1, out_depth:9});
	layers.push({type:'fc', num_neurons:18, activation:'tanh'});
	layers.push({type:'softmax', num_classes:9});
	net = new convnetjs.Net();
	net.makeLayers(layers);

	var database = [
		[[0,1,0,0,0,0,0,0,0],0],
		[[0,0,0,0,1,0,0,0,0],6],
		[[0,0,0,0,0,0,-1,1,1],3],
		[[0,1,0,0,-1,0,0,0,1],0],
		[[0,1,-1,0,0,1,0,0,0],7],
		[[1,0,0,0,1,0,0,0,-1],6],
		[[-1,0,0,1,0,0,0,1,0],2],
		[[0,0,1,0,-1,0,1,0,0],5],
		[[1,0,0,-1,1,1,0,0,-1],6],
		[[1,-1,1,0,-1,0,0,1,0],8],
		[[0,0,0,1,0,-1,-1,1,1],1],
		[[1,-1,0,0,0,1,0,1,-1],3],
		[[0,1,-1,0,-1,1,1,0,0],8],
		[[0,0,1,-1,0,1,0,1,-1],0],
		[[1,0,0,0,0,0,0,0,0],4],
		[[0,0,-1,0,0,1,1,0,0],4],
		[[0,0,1,0,0,0,0,1,-1],4]
	];
	var transf_0 = [6,3,0,7,4,1,8,5,2];
	var transf_1 = [2,1,0,5,4,3,8,7,6];
	var transf_2 = [6,7,8,3,4,5,0,1,2];
	var transf_3 = [8,5,2,7,4,1,6,3,0];
	var transf_4 = [0,3,6,1,4,7,2,5,8];

	var layer = new Array(transf_0.length);
	var out = null;
	var trainer = new convnetjs.Trainer(net, {learning_rate:0.01, l2_decay:0.001});
	for(var i = 0; i < database.length; i++) {
		var entry = null;
		layer = database[i][0];
		out = database[i][1];

		// vanilla layout, e rotation
		entry = new convnetjs.Vol(layer);
		trainer.train(entry, out);

		// rotation 90 deg
		for(var j = 0; j < 3; j++) {
			layer = transform(layer, transf_0);
			out = transform_o(out, transf_0);
			entry = new convnetjs.Vol(layer);
			trainer.train(entry, out);
		}
		// go back to e
		layer = transform(layer, transf_0);
		out = transform_o(out, transf_0);

		// transform 1
		layer = transform(layer, transf_1);
		out = transform_o(out, transf_1);
		entry = new convnetjs.Vol(layer);
		trainer.train(entry, out);
		layer = transform(layer, transf_1);
		out = transform_o(out, transf_1);

		// transform 2
		layer = transform(layer, transf_2);
		out = transform_o(out, transf_2);
		entry = new convnetjs.Vol(layer);
		trainer.train(entry, out);
		layer = transform(layer, transf_2);
		out = transform_o(out, transf_2);

		// transform 3
		layer = transform(layer, transf_3);
		out = transform_o(out, transf_3);
		entry = new convnetjs.Vol(layer);
		trainer.train(entry, out);
		layer = transform(layer, transf_3);
		out = transform_o(out, transf_3);

		// transform 4
		layer = transform(layer, transf_4);
		out = transform_o(out, transf_4);
		entry = new convnetjs.Vol(layer);
		trainer.train(entry, out);
		layer = transform(layer, transf_4);
		out = transform_o(out, transf_4);
	}

}

function random_move(situation) {
	var move = null;
	var sum = 0;
	var probs = [0,0,0,0,0,0,0,0,0];

	for(var i = 0; i < lines.length; i++) {
		for(var j = 0; j < lines[i].length; j++) {
			var what = situation[lines[i][j]];
			sum += what;
			if(what == 0) {
				empty = lines[i][j];
			}
		}
		if(sum==3) {
			// lost
			return {over: true, won: 1};
		}
		if(sum==-3) {
			// won
			return {over: true, won: -1};
		}
		sum = 0;
	}

	while(true) {
		if(situation.every(elem => elem!=0)) {
			return {over: true, won: 0};
		}
		move = random_range(0,8);
		if(situation[move] == 0) {
			return {move_chosen: move, prob_table: probs};
		}
	}
}
function machine_move(situation) {
	var move = null;
	var situation_o = situation;
	var x = new convnetjs.Vol(situation);

	// check if we have to block or can win
	var sum = 0;
	var empty = null;
	var canwin = false;
	var prob = {w: [0,0,0,0,0,0,0,0,0]};

	// check if we can win
	for(var i = 0; i < lines.length; i++) {
		for(var j = 0; j < lines[i].length; j++) {
			var what = situation[lines[i][j]];
			sum += what;
			if(what == 0) {
				empty = lines[i][j];
			}
		}
		if(sum==3) {
			// lost
			return {over: true, won: 1};
		}
		if(sum==-2) {
			canwin = true;
			move = empty;
			break;
		}
		sum = 0;
	}

	sum=0;

	if(!canwin) {
		// check if we have to block
		for(var i = 0; i < lines.length; i++) {
			for(var j = 0; j < lines[i].length; j++) {
				var what = situation[lines[i][j]];
				sum += what;
				if(what == 0) {
					empty = lines[i][j];
				}
			}
			if(sum==2) {
				break;
			}
			sum = 0;
		}

		if(sum==2) {
			// enemy is about to win: block!!
			move = empty;
		} else {
			prob = net.forward(x);
			while(true) {
				if(prob.w.every(elem => elem==0)) {
					return {over: true, won: 0};
				}

				var temp = max_ele(prob.w);

				if(situation[temp] !== 0) {
					prob.w[temp] = 0;
					continue;
				}
				move = temp;
				break;
			}
		}
	}

	if(canwin) {
		return {over: true, won: -1, move_chosen: move};
	}

	return {prob_table: prob.w, move_chosen: move, over: false};
}
