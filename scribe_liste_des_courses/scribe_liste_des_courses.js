var ScribeSpeak;
var token;
var TIME_ELAPSED;
var FULL_RECO;
var PARTIAL_RECO;
var fichierListe = __dirname + '/liste.txt';
var liste=[];

exports.action = function(data, callback, config, SARAH){
	/*if (typeof Config === 'undefined') {
		var Config = config_local;
		var SARAH = SARAH_local;
	}*/

	readListe();
	
	maConfig = config.modules.scribe_liste_des_courses;
	ScribeSpeak = SARAH.ScribeSpeak;
	
	FULL_RECO = SARAH.context.scribe.FULL_RECO;
	PARTIAL_RECO = SARAH.context.scribe.PARTIAL_RECO;
	TIME_ELAPSED = SARAH.context.scribe.TIME_ELAPSED;

	SARAH.context.scribe.activePlugin('Liste des courses');
	
	
	var util = require('util');
	console.log("LISTE_DES_COURSES_SCRIBE CALL LOG: " + util.inspect(data, { showHidden: true, depth: null }));

	if (data.action=='empty') {
		liste=[];
		writeListe();
		ScribeSpeak("J'ai vidé la liste des courses.", function() {
			return callback();
		})
		
	} else if (data.action=="del" || data.action=="achat") {
		SARAH.context.scribe.hook = function(event) {
			checkScribe(event, data.action, SARAH, callback); 
		};
		
		token = setTimeout(function(){
			SARAH.context.scribe.hook("TIME_ELAPSED");
		},maConfig.timeout_msec);
	} else if (data.action=="read") {
		msg = '';
		for (i=0;i<liste.length;i++) {
			if (msg!='' && i!=liste.length - 1) msg+= ', ';
			else if (i==liste.length-1 && liste.length>1) msg+= ', et ';
			msg+= liste[i];
		}
		if (msg=='') msg = 'La liste est vide.';
		else msg = "La liste contient " + msg + '.';
		ScribeSpeak(msg, function() {
			SARAH.context.scribe.activePlugin('aucun (Liste des courses)');
			return callback(); 
		});		
		
		
	}
}

function checkScribe(event, action, SARAH, callback) {
	if (event==FULL_RECO) {
		clearTimeout(token);
		SARAH.context.scribe.hook = undefined;
		// aurait-on trouvé ?
	
		decodeScribe(SARAH.context.scribe.lastReco, action, SARAH, callback);
	} else if (event==TIME_ELAPSED) {
		// timeout !
		SARAH.context.scribe.hook = undefined;
		// aurait-on compris autre chose ?
		if (SARAH.context.scribe.lastPartialConfidence >= 0.7 && 
			SARAH.context.scribe.compteurPartial>SARAH.context.scribe.compteur) 
			decodeScribe(SARAH.context.scribe.lastPartial, action, SARAH, callback);
		else {
			SARAH.context.scribe.activePlugin('aucun (Liste des courses)');
			ScribeSpeak("Désolé je n'ai pas compris. Merci de réessayer.", true);
			return callback();
		}
		
	} else {
		// pas traité
	}
}


function decodeScribe(phrase, action, SARAH, callback) {
	console.log ("Phrase: " + phrase);
	// SCRIBE retourne toute la phrase dite par l'utilisateur
	
	var rgxp = /.*acheter (.+)|.*n'ai plus d[e'](.+)|.*(supprimer?|retirer?|enlever|enlève) (.+) de la liste/i ;

	// on s'assure que Google a bien compris
	var match = phrase.match(rgxp);
	console.log("MATCH: " + match);
	if (!match || match.length <= 1){
		SARAH.context.scribe.activePlugin('aucun (Liste des courses)');
		ScribeSpeak("Désolé je n'ai pas compris. Merci de réessayer.", true);
		return callback();
	}
	
	// on peut maintenant s'occuper des mots qui sont recherchés
	if (typeof match[1] !== 'undefined') search = match[1].toLowerCase();
	else if (typeof match[2] !== 'undefined') search = match[2].toLowerCase();
	else search = match[4].toLowerCase();			// supprimer|retirer|enlever = 3e

	search = search.trim();
	
	if (action=="achat") {
		liste.push(search);

		ScribeSpeak("Tu veux acheter: " + search + ". La liste contient " + liste.length + " entrées.", function() {
			writeListe();
			SARAH.context.scribe.activePlugin('aucun (Liste des courses)');
			return callback(); 
		});
	} else {
		// supprimer ... on supprime l'article ...
		// on a voulu acheter du vin --> supprime LE vin
		// on a voulu acheter le journal --> supprimer LE journal
		// acheter des chips --> supprime LES chips
		// acheter de la viande --> supprime LA viande
		// acheter de nouvelles chaussures --> supprime LES (nouvelles) chaussures
		// acheter d'autres chaussures --> supprime LES (autres) chaussures
		// acheter une (nouvelle) veste (verte) --> supprime LA (nouvelle) veste (verte)
		// acheter deux billets de loto --> supprime les (deux) billets de loto
		
		t = 'le ';
		p = search.indexOf(t);
		if (p!=0) {t = 'la '; p = search.indexOf(t); }
		if (p!=0) {t = 'le '; p = search.indexOf(t); }
		if (p!=0) {t = 'les '; p = search.indexOf(t); }
		if (p!=0) {t = 'l\''; p = search.indexOf(t); }
		
		if (p==0) search2 = search.substr(p + t.length);
		else search2 = search;
		
//		console.log(search2);
		fnd = [];
		for (i=0;i<liste.length;i++) {
			if (liste[i].indexOf(search2)>=0) {
				fnd.push(i);
			}
		}

		if (fnd.length==0) {
			ScribeSpeak("Je n'ai pas trouvé " + search + " dans la liste.");
			return callback();
		} else {
			if (fnd.length==1) {
				liste.splice(fnd[0],1);
				ScribeSpeak("J'ai supprimé: " + search + ". Il reste " + liste.length + " entrées dans la liste.", function() {
					writeListe();
					SARAH.context.scribe.activePlugin('aucun (Liste des courses)');
					return callback(); 
				});
			} else {
				msg = '';
				for (i=0;i<fnd.length;i++) {
					if (msg!='' && i!=fnd.length - 1) msg+= ', ';
					else if (i==fnd.length-1) msg+= ', et ';
					msg+= liste[fnd[i]];
				}
				ScribeSpeak("Il faut être plus spécifique car j'ai retrouvé plusieurs fois " + search + " dans la liste. J'ai noté " + msg + '.', function() {
					SARAH.context.scribe.activePlugin('aucun (Liste des courses)');
					return callback(); 
				});
			}
			
		}
	}
}


function readListe() {
	var fs = require("fs");

	liste = [];
	fs.readFileSync(fichierListe).toString().split('\n').forEach(function (line) { 
		line = line.toString().trim().replace(/[\n\r\t]/g, '');
		if (line!='') liste.push(line);
	});
}

function writeListe() {
	var fs = require('fs');
	var stream = fs.createWriteStream(fichierListe);
	stream.once('open', function(fd) {
		for (i=0;i<liste.length;i++) {
			stream.write(liste[i] + '\r\n');
		}
		stream.end();
	});
}