var token;
var cpt_initial;

exports.action = function(data, callback, config, SARAH){
	/*if (typeof Config === 'undefined') {
		var Config = config_local;
		var SARAH = SARAH_local;
	}*/

/*
	SARAH.speak("bonjour à vous", function() {
		callback({'tts':''});		
	});
	return;*/
//return callback({'tts':"bonjour les gars"});
	
	maConfig = config.modules.salegamine_scribe;
	
	var util = require('util');
	console.log("SaleGamine_SCRIBE CALL LOG: " + util.inspect(data, { showHidden: true, depth: null }));

	SARAH.ScribeSpeak("Ok je vais répéter tout ce que vous dites. Pour m'arrêter dites simplement " + SARAH.context.salegamine_scribe.Sarah_name + " je ne joue plus !", 
		function() {
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
			SARAH.context.scribe.SarahEcoute(false, function()  {
				cpt_initial = SARAH.context.scribe.compteur;
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

	SARAH.context.salegamine_scribe = {
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
	
	SARAH.context.salegamine_scribe.Sarah_name = Sarah_ini;
}


function checkScribe(SARAH) {
	var new_cpt = SARAH.context.scribe.compteur;
	
	if (new_cpt != cpt_initial) {
		// Chrome a entendu quelque chose ...
		cpt_initial = new_cpt;
		
		var text = SARAH.context.scribe.lastReco;
		SARAH.ScribeSpeak(text, function() {
			if (text.toLowerCase() == SARAH.context.salegamine_scribe.Sarah_name.toLowerCase() + ' je ne joue plus') {
				clearInterval(token);
				SARAH.ScribeSpeak("D'accord j'arrête, pas besoin de s'énerver !", function() {
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
				// rien ?
			}
		});
	}
}
