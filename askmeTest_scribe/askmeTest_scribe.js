var ScribeAskMe;
var ScribeSpeak;
var maConfig;

exports.action = function(data, callback, config, SARAH){
	/*if (typeof Config === "undefined" ) {
		var Config = config_local;
		var SARAH = SARAH_local;
	}*/

	ScribeAskMe = SARAH.ScribeAskMe;
	ScribeSpeak = SARAH.ScribeSpeak;
	
	maConfig = config.modules.askmeTest_scribe;


	if (data.action == "couleur") {
		askCouleur();
	} else if (data.action == 'questions') {
		askQuestions();
	}

	callback();
}

exports.init = function(SARAH) {
	/*if (typeof Config === "undefined" ) {
		var SARAH = SARAH_local;
	}*/
	
}

function askCouleur() {
	ScribeAskMe("Quelle est ta couleur préférée ?", [	
			{'regex': /(pas le (.\w+)|pas l'(.\w+)|pas la couleur (.\w+)|pas (.\w+))/,	'answer': 'neg'},
			{'regex': /(le (.\w+)|l'(.\w+)|la couleur (.\w+))/,							'answer': true},
			{'regex': /(pas|aucune)/g,													'answer': 'none'},
			{'regex': /(toutes|tout)/g,													'answer': 'all'}
			],function(answer,phrase,match, wholeMatch) {
				//console.log('Answer : ' + answer);
				//console.log('Phrase : ' + phrase);
				//console.log('match : ' + match);
				if (answer==true) ScribeSpeak("Tu as répondu " + match + ".");
				else if (answer=='none') ScribeSpeak("Tu n'as pas de couleur préférée ? Quel dommage !");
				else if (answer=='all')  {
					ScribeAskMe("Tu aimes toutes les couleurs, même le vert caca d'oie ?", [
						{'regex':/(oui)/,	answer:'oui'},
						{'regex':/(non)/,	answer:'non'}
						], function(answer, phrase, match, wholeMatch) {
							if (answer=='oui') ScribeSpeak("Tant mieux pour toi mais moi je n'aime pas le vert caca d'oie .");
							else if (answer=='non') ScribeSpeak("Moi non plus, le vert caca d'oie me dégoute .");
							else ScribeSpeak("Je ne suis pas sûr que tu aies répondu à ma question . Tant pis .");
						}, {'timeout': maConfig.timeout_msec, 'repeter':"Je t'ai demandé si tu aimais le vert caca d'oie. Alors ?", 
							'essais':2, waitForFinal: false, partialThreshold: 0.01 }
					);
				}
				else if (answer=='neg') {
					ScribeSpeak("Tu as répondu que tu n'aimais " + match + " ! mais je ne connais toujours pas ta couleur préférée.", function () {
						askCouleur();
					});
				}
				else if (answer==false) {
					ScribeSpeak("Je ne suis pas sûr que tu aies répondu à ma question !", function () {
						askCouleur();
					});
				}
				else ScribeSpeak("Tu n'as rien répondu. Tant pis.");
		}, {'timeout': maConfig.timeout_msec});
}


function askQuestions() {
	askPrenom();
}

function askPrenom(callback) {
	ScribeAskMe("Bonjour quel est ton prénom ?", [
		{'regex': /([A-Z\u00C0-\u00DD][A-Za-z\u00C0-\u017F-]*)/g, 'answer':'nom', 'removeMatch': /(^Je$)/ }
		], function(answer,phrase,match,wholeMatch) {
			if (answer=='nom') {
				ScribeSpeak("Bonjour à toi " + match + " !", function() {askAge(match, callback)});
				
			}
			else if (answer==false) {
				ScribeSpeak("Je ne suis pas sûr que tu aies répondu à ma question !", function () {
					askPrenom(callback);
				});
			}
			else ScribeSpeak("Tu n'as rien répondu. Tant pis.");
		}, {'timeout':maConfig.timeout_msec, 'retryIfNoMatch': "Je ne suis pas sûr d'avoir compris. Peux-tu répéter ? quel est ton prénom ?", 'essais': 2}
	);
}


function askAge(prenom, callback) {
	ScribeAskMe("Quel âge as-tu " + prenom + " ?", [
		{'regex': /(\d+)/, 'answer':'age' }
		], function(answer,phrase,match,wholeMatch) {
			if (answer=='age') {
				age = parseFloat(match);
				msg = age + " ans ! ";
				if (age < 5) msg += "Tu parles bien pour ton âge !";
				else if (age < 12) msg += "Tu es encore un enfant !";
				else if (age < 18) msg += "Tu es bientôt adulte !";
				else if (age < 25) msg += "Tu es un jeune adulte !";
				else if (age < 35) msg += "Tu es un adulte accompli !";
				else if (age < 40) msg += "Attention à la crise de la quarantaine !";
				else if (age < 60) msg += "Ah ! " + age + " ans ! l'âge de la maturité !";
				else if (age < 80) msg += "L'âge de la sagesse !";
				else if (age < 100) msg += "Quelle longévité !";
				else if (age < 120) msg += "Vraiment ? Je suis impressionée !";
				else msg += "Je crois que tu me fais une blague !";
				
				ScribeSpeak(msg, function() {callback(); });
				
			}
			else if (answer==false) {
				ScribeSpeak("Je ne suis pas sûr que tu aies répondu à ma question !", function () {
					askAge(prenom,callback);
				});
			}
			else ScribeSpeak("Tu n'as rien répondu. Tant pis.");
		}, {'timeout':maConfig.timeout_msec, 'retryIfNoMatch': "Je ne suis pas sûr d'avoir compris. Peux-tu répéter ? quel est ton âge ?", 'essais': 2}
	);
}

