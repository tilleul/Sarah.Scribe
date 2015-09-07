var sons = [];			// les sons
var poils = [];			// les rimes

function include(f) {
	f = __dirname + '/' + f;
	console.log(f);
	var fs = require("fs");
	eval (fs.readFileSync(f).toString());
}

if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

var sons_keys;
var phrase ="sarah";
// correspondance la plus longue
var longest = -1;
// index de la correspondance
var longest_idx = -1;

var token;
var cpt_initial;

exports.action = function(data, callback, config, SARAH){
	var util = require('util');
	include("rimes.js");

	// récupération de tous les sons
	sons_keys = Object.keys(sons);
	
	/*if (typeof Config === 'undefined') {
		var Config = config_local;
		var SARAH = SARAH_local;
	}*/
	
	maConfig = config.modules.poil_au_doigt_scribe;
	

	console.log("Poil_Au_Doigt_SCRIBE CALL LOG: " + util.inspect(data, { showHidden: true, depth: null }));
	
		SARAH.ScribeSpeak("Ok. Pour m'arrêter dites simplement " + SARAH.context.poil_au_doigt_scribe.Sarah_name + " je ne joue plus !", 
			function() {
			// on rallume le micro
			//SARAH.context.scribe.microON(SARAH);
			// on la rend sourde
			
			/*
			sarahConfig = SARAH.ConfigManager.getConfig().http;
			
			var url_client_sarah = sarahConfig.remote + "/?listen=false";
			var request = require('request');

			request(url_client_sarah, function(err, response) {
				if (err || response.statusCode != 200) {
					// juste pour info mais sinon on s'en fiche un peu ...
					res.write ("Erreur: " + err);
					callback({'tts':"Erreur lors de la connexion au client. Le jeu est annulé."});
				} else {*/
					// valeur initiale du compteur ...
				SARAH.context.scribe.SarahEcoute(false,function() {
					cpt_initial = SARAH.context.scribe.compteur;
					console.log(cpt_initial);
					token = setInterval(function() {checkScribe(SARAH)}, 100);
				});
			//});
			
			// on appelle le callback pour éviter le timeout entre le client et le serveur
			callback();
		});
	
}


exports.init = function(SARAH){
	custom='custom.ini';
	if (typeof Config === 'undefined') {
		//var SARAH = SARAH_local;
	} else custom='client/custom.ini';

	SARAH.context.poil_au_doigt_scribe = {
		'Sarah_name' : 'Sarah'
	};
	
	
	// nom réel de SARAH, repris du custom.ini
	var fs = require("fs");
	fs.readFileSync(custom).toString().split('\n').forEach(function (line) { 
		line = line.toString().replace(/[\n\r\t]/g, '');
		p = line.indexOf('name=');
		if (p === 0) {
			Sarah_ini = line.substr(5);
		}
	});
	
	SARAH.context.poil_au_doigt_scribe.Sarah_name = Sarah_ini;
}


function checkScribe(SARAH) {
	var new_cpt = SARAH.context.scribe.compteur;
	
	if (new_cpt != cpt_initial) {
		// Chrome a entendu quelque chose ...
		cpt_initial = new_cpt;
		
		phrase = SARAH.context.scribe.lastReco.toLowerCase();
		phrase = phrase.replace(/\./g,'');		// parfois on a un point final, autant le virer
		
		longest = -1;
		longest_idx = -1;
		
		for (i=0;i<sons_keys.length;i++) {
			txt = sons_keys[i];

			test_phrase(txt);
			test_phrase(txt+'nt');		// verbes au présent à la 3e personne du pluriel
			if (txt.slice(-1)=="a" || txt.slice(-1)=="i" || txt.slice(-1)=="u") test_phrase(txt+'t');		// verbes conjugués finissant par T et donc précédés de A, I ou U
			test_phrase(txt+'s');		// verbes conjugués finissant par T et pluriel en S
			if (txt.charAt(0)==' ') {
				// avec une apostrophe ?
				txt = txt.replace(' ',"'");
				test_phrase(txt);
				test_phrase(txt+'nt');
				if (txt.slice(-1)=="a" || txt.slice(-1)=="i" || txt.slice(-1)=="u") test_phrase(txt+'t');
				test_phrase(txt+'s');
				txt = txt.replace("'","-");
				test_phrase(txt);
				test_phrase(txt+'nt');
				if (txt.slice(-1)=="a" || txt.slice(-1)=="i" || txt.slice(-1)=="u") test_phrase(txt+'t');
				test_phrase(txt+'s');
			
			}
			

		}

		if (longest>0) {
			var l = poils[sons[sons_keys[longest_idx]]].length;
			var n = Math.floor(Math.random() * l);
			text = phrase + " ! Poil " + poils[sons[sons_keys[longest_idx]]][n] + " !";
			console.log(text);
		} else {
			var words = phrase.split(" ");
			text = "Quel dommage que je ne connaisse pas de partie du corps qui rime avec " + words[words.length - 1];
		}

		
		//SARAH.context.scribe.microOFF(SARAH, function(error) {
			SARAH.ScribeSpeak(text, function() {
				if (phrase.indexOf('je ne joue plus')>=0) {
					clearInterval(token);
					var l1 = poils["ette"].length;
					var n1 = Math.floor(Math.random() * l1);
					var l2 = poils["é"].length;
					var n2 = Math.floor(Math.random() * l2);

					SARAH.ScribeSpeak("D'accord j'arrête, poil " + poils["ette"][n1] + ", pas besoin de s'énerver, poil " + poils["é"][n2] + " !", function() {
						//SARAH.context.scribe.microON(SARAH);
						// on guérit Sarah de sa surdité
						SARAH.context.scribe.SarahEcoute(true);
						/*
						sarahConfig = SARAH.ConfigManager.getConfig().http;
						var url_client_sarah = sarahConfig.remote + "/?listen=true";
						var request = require('request');

						request(url_client_sarah, function(err, response) {
							if (err || response.statusCode != 200) {
								// juste pour info mais sinon on s'en fiche un peu ...
								res.write ("Erreur: " + err);
							}
						});				*/
					});
				} else {
					// rien d'autre ?
					//SARAH.context.scribe.microON(SARAH);
				}
			});
		//});
	}
}
					


function test_phrase(txt) {
	if (phrase.endsWith(txt)) {
		points = sons_keys[i].length;
		if (points>longest) {
			longest = points;
			longest_idx = i;
		}
		console.log("Match Key/value: " + sons_keys[i] + ' (' + txt + ')/' + sons[sons_keys[i]] + " -- " + points + " points.");
	}
}
