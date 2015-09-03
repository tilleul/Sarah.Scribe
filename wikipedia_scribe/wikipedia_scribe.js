var ScribeSpeak;
var token;
var TIME_ELAPSED;
var FULL_RECO;
var PARTIAL_RECO;

exports.action = function(data, callback, config_local, SARAH_local){
	if (typeof SARAH_local != 'undefined') {
		Config = config_local;
		SARAH = SARAH_local;
	}
	
	maConfig = Config.modules.wikipedia_scribe;
	ScribeSpeak = SARAH.ScribeSpeak;

	FULL_RECO = SARAH.context.scribe.FULL_RECO;
	PARTIAL_RECO = SARAH.context.scribe.PARTIAL_RECO;
	TIME_ELAPSED = SARAH.context.scribe.TIME_ELAPSED;

	SARAH.context.scribe.activePlugin('Wikipedia');

	var util = require('util');
	console.log("WIKIPEDIA_SCRIBE CALL LOG: " + util.inspect(data, { showHidden: true, depth: null }));

	SARAH.context.scribe.hook = function(event) {
		checkScribe(event, data.action, SARAH, callback); 
	};
	
	token = setTimeout(function(){
		SARAH.context.scribe.hook("TIME_ELAPSED");
	},maConfig.timeout_msec);

}

function checkScribe(event, action, SARAH, callback) {
	if (event==FULL_RECO) {
		clearTimeout(token);
		SARAH.context.scribe.hook = undefined;
		// aurait-on trouvé ?
		
		
		decodeScribe(SARAH.context.scribe.lastReco, callback);
	} else if (event==TIME_ELAPSED) {
		// timeout !
		SARAH.context.scribe.hook = undefined;
		// aurait-on compris autre chose ?
		if (SARAH.context.scribe.lastPartialConfidence >= 0.7 && 
			SARAH.context.scribe.compteurPartial>SARAH.context.scribe.compteur) 
			decodeScribe(SARAH.context.scribe.lastPartial, callback);
		else {
			SARAH.context.scribe.activePlugin('aucun (Liste des courses)');
			ScribeSpeak("Désolé je n'ai pas compris. Merci de réessayer.", true);
			return callback();
		}
		
	} else {
		// pas traité
	}
}


function decodeScribe(phrase, callback) {
	console.log ("Phrase: " + phrase);
	// le code qui suit vient directement de la doc wiki de JPEncausse

	// SCRIBE retourne toute la phrase dite par l'utilisateur
	// dans cette phrase, le premier mot est le nom donné à Sarah (Jarvis, etc.) donc on l'ignore et on recherche
	// ce qui se cache entre "recherche" et "sur wikipedia"
	var rgxp = /recherche (.+) sur Wikipédia/i;

	// on s'assure que Google a bien compris
	var match = phrase.match(rgxp);
	console.log("MATCH: " + match);
	if (!match || match.length <= 1){
		SARAH.context.scribe.activePlugin('aucun (Wikipedia)');
		ScribeSpeak("Désolé je n'ai pas compris. Merci de réessayer.", true);
		return callback();
	}

	// on peut maintenant s'occuper des mots qui sont recherchés
	search = match[1];
	return query_wikipedia(search, callback);
}




////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
// le code de récupération wikipedia a été écrit par JP Encausse
// https://github.com/JpEncausse/SARAH-Plugin-Dictionary/blob/master/dictionary.js
var re = /^(.*?)[.?!]\s*/
var rp = /<\/?[^>]+(>|$)/g
var ex = /^REDIRECT (\w+)\s*/g
var query_wikipedia = function(search, callback){
	
	console.log("Query Wikipedia: " + search);
	
	var url = 'https://fr.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&titles='+search+'&format=json';
	var request = require('request');
	request({ 'uri' : url, 'json' : true }, function (err, response, body){
		if (err || response.statusCode != 200) {
			ScribeSpeak("La requête vers Wikipédia a échoué");
			callback();
			return;
		}

		var extract = '';
		try {
			extract = getFirst(body.query.pages).extract;
			extract = extract.replace(rp, "");
			
			extract = re.exec(extract)[1];
		} catch (e){}


		var redirect = ex.exec(extract); 
		if (redirect && redirect.length > 0){
			console.log('<'+redirect[1]+'>');
			return wikipedia_query(redirect[1], callback);
		}
		extract += '.';
		console.log (extract);
		if (extract =='.' || extract=='undefined.') {
			SARAH.context.scribe.activePlugin('aucun (Wikipedia)');
			ScribeSpeak("Wikipédia ne m'a pas renvoyé de résumé à propos de: " + search);
			callback();
		}
		else {
			ScribeSpeak(extract, function(){ SARAH.context.scribe.activePlugin('aucun (Wikipedia)'); } );
			callback();
		}
	});
}

var getFirst = function(obj){
  return obj[Object.keys(obj)[0]]
}