var ScribeAskMe;
var ScribeSpeak;
var SarahEcoute;
var SCRIBE;

var token;
var TIME_ELAPSED;
var FULL_RECO;
var PARTIAL_RECO;

var maConfig;

var animaux=[];
var animalsFile = __dirname  + "/animaux.txt";
var max_number;
var animaux_cnt;

var unAnimal=[];

function hasNumbers(t) {
	return /\d/.test(t);
}

exports.action = function(data, callback, config, SARAH){
	/*if (typeof Config === 'undefined') {
		Config = config_local;
		SARAH = SARAH_local;
	}*/

	SCRIBE = SARAH.context.scribe;
	ScribeAskMe = SARAH.ScribeAskMe;
	ScribeSpeak = SARAH.ScribeSpeak;
	SarahEcoute = SARAH.SarahEcoute;
	FULL_RECO = SARAH.context.scribe.FULL_RECO;
	PARTIAL_RECO = SARAH.context.scribe.PARTIAL_RECO;
	TIME_ELAPSED = SARAH.context.scribe.TIME_ELAPSED;
	
	maConfig = config.modules.animaux_scribe;
	
	var util = require('util');
	console.log("animaux_SCRIBE CALL LOG: " + util.inspect(data, { showHidden: true, depth: null }));

	SCRIBE.activePlugin('Animaux');

	
	readAnimaux();

	if (data.action == 'encyclo' || data.action =='encyclo2') {
		SCRIBE.hook = function(event) {
			checkScribe(event, data.action, SARAH, callback); 
		};
		
		token = setTimeout(function(){
			SCRIBE.hook("TIME_ELAPSED");
		},5000);
	}
	else beginGame(SARAH, true);
	
	// on appelle le callback pour éviter le timeout entre le client et le serveur
	callback();
}

exports.init = function(SARAH){
	custom='custom.ini';
	if (typeof Config === 'undefined') {
		//var SARAH = SARAH_local;
	} else custom='client/custom.ini';

	SARAH.context.animaux_scribe = {
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
	
	SARAH.context.animaux_scribe.Sarah_name = Sarah_ini;
}

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

function readAnimaux() {
	max_number = -1;
	animaux_cnt = 0;
	var fs = require("fs");

	fs.readFileSync(animalsFile).toString().split('\n').forEach(function (line) { 
		line = line.toString().trim().toLowerCase().replace(/[\n\r\t]/g, '');
		
		if (line.charAt(0)=='q' || line.charAt(0)=='y' || line.charAt(0)=='n') {
			p = line.indexOf(':');
			if (p>0) {
				key = line.substring(0,p);
				value = line.substr(p+1).trim();
				number = parseInt(key.substr(1));
//				console.log(key + ' - ' + value + ' - ' + number);
				
				if (!isNaN(number)) {
					animaux[key] = value;
					if (number > max_number) max_number = number;
//					console.log(max_number);
//					console.log(isNaN(value.charAt(1)));
					if (key.charAt(0)!='q' && isNaN(value.charAt(1))) animaux_cnt++;
				}
				
			}
		}
	});

	// todo : vérifier la consistence des données collectées:
	// - il faut Q1
	// et pour chaque Qx il faut un Yx et un Nx
	// et pour chaque valeur de Yx ou Nx avec un Qy, il faut un Qy
	
//console.log(animaux);
}

function writeAnimaux() {
	var fs = require('fs');
	var stream = fs.createWriteStream(animalsFile);
	stream.once('open', function(fd) {
		for (i=1;i<=max_number;i++) {
			y = animaux["y" + i];
			n = animaux["n" + i];
			if (!isNaN(y.slice(-1))) y = y.toUpperCase();
			if (!isNaN(n.slice(-1))) n = n.toUpperCase();
			
			stream.write("Q" + i + ": " + animaux["q" + i] + '\r\n');
			stream.write("Y" + i + ": " + y + '\r\n');
			stream.write("N" + i + ": " + n + '\r\n');
		}
		stream.end();
	});
}
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

function checkScribe(event, action, SARAH, callback) {
	if (event==FULL_RECO) {
		clearTimeout(token);
		SARAH.context.scribe.hook = undefined;
		// aurait-on trouvé ?
		
		if (action=="encyclo") decodeScribe(SARAH.context.scribe.lastReco, callback);
		else decodeScribe2(SARAH.context.scribe.lastReco, callback);
	} else if (event==TIME_ELAPSED) {
		// timeout !
		SARAH.context.scribe.hook = undefined;
		// aurait-on compris autre chose ?
		if (SARAH.context.scribe.lastPartialConfidence >= 0.7 && 
			SARAH.context.scribe.compteurPartial>SARAH.context.scribe.compteur) 
			if (action=="encyclo") decodeScribe(SARAH.context.scribe.lastPartial, callback);
			else decodeScribe2(SARAH.context.scribe.lastPartial, callback);
		else {
			SARAH.context.scribe.activePlugin('aucun (Wikiepedia)');
			ScribeSpeak("Désolé je n'ai pas compris. Merci de réessayer.", true);
			return callback();
		}
		
	} else {
		// pas traité
	}
}

function decodeScribe2(phrase, callback) {
	console.log ("Phrase: " + phrase);
	// SCRIBE retourne toute la phrase dite par l'utilisateur
	var rgxp = /.*est-ce[- ]qu['e ](.\w+ .\w+) (.+)|.*je voudrais savoir si (.\w+ .\w+) (.+)/i ;	
	

	// on s'assure que Google a bien compris
	var match = phrase.match(rgxp);
	console.log("MATCH: " + match);
	if (!match || (match.length != 3 && match.length!=5)){
		SCRIBE.activePlugin('aucun (Animaux)');
		ScribeSpeak("Désolé je n'ai pas compris. Merci de réessayer.", true);
		return callback();
	}
	
	offset = 0;
	if (typeof match[1] === 'undefined') offset = 2;
	animal = match[1+offset].toLowerCase().trim();
	quoi = match[2+offset].toLowerCase().trim();
	// à ce stade-ci on devrait avoir un animal et une question 
	// mais il se peut qu'on ait une partie du nom de l'animal dans "quoi" (par ex: une étoile/de mer a des tentacules)
	// on va donc retrouver l'animal en prenant des morceaux de "quoi" par la fin
	// ex: une étoile de mer a des/tentacules -- une étoile de mer a/des tentacules -- etc

	quoi2 = quoi;
	theKey = '';
	
	do {
		var lastIndex = quoi2.lastIndexOf(" ");
		if (lastIndex<0) quoi2="";
		else quoi2 = quoi2.substr(0,lastIndex);
//console.log(animal + "|" + quoi2 + "|");
		animal2 = animal + (quoi2=='' ? '' :' ') + quoi2;
	
		for (var key in animaux) {
			var value = animaux[key];
			if (value==animal2) {
				theKey = key;
				break;
			}
		}
		if (theKey!='') break;
		
	} while (lastIndex>=0)
	
	if (quoi2!='') quoi2 = quoi.slice(quoi2.length + 1);
	else quoi2 = quoi;
//console.log("|" + quoi2 + "|");						
	
	if (quoi2.charAt(0)=='à') {
		// probablement une erreur de Google ...
		quoi2 = 'a' + quoi2.slice(1);
	}
	
	
	// on va chercher l'animal et remonter l'encyclo
	// si on trouve une question qui contient "quoi", alors on pourra dire si oui ou non
	// sinon on dit "je ne sais pas si" animal quoi 
	
	if (theKey!='') return remonteEncyclo2(animal2, quoi2, theKey, callback);
	
	
	ScribeSpeak("Désolé, je ne sais pas si  " + animal + ' ' + quoi, function() {
		SCRIBE.activePlugin('aucun (Animaux)');
		return callback(); 
	});
}


function remonteEncyclo2(animal, quoi, index, callback) {
	number = index.substr(1);
	y = index.charAt(0);		// 'y' ou 'n';
	q = animaux["q" +  number];
//console.log(q);
	if (typeof q !== 'undefined') {
		// si la question commence par un verbe ("mange-t-il des graines"), on vire le -il
		t = "-t-il";
		p = q.indexOf(t);
		if (p==-1) {
			// ex: mangent-ils des graines
			t = "-ils";
			p = q.indexOf(t);
		}
		if (p>0) {
			q = q.substring(0,p) + q.substr(p+t.length);
		}
		
		if (q.indexOf(quoi) >= 0) {
			// on a trouvé
			phrase = quoi;
//console.log("|" + phrase + "|");
			if (y=='n') {
				p = phrase.indexOf("c'est")
				if (p==0) {
					phrase = "ce n'est pas" + phrase.substr(p+5);
				} else {
					// le premier mot est le verbe, donc on cherche l'espace juste après
					p = phrase.indexOf(" ");
//console.log("|" + phrase + "|");					
					if (p>0) {
						verbe = phrase.substring(0,p);
						if (isVowelEx(verbe.charAt(0))) verbe = "n'" + verbe;
						else verbe = "ne " + verbe;
						phrase = verbe + ' pas ' + phrase.substr(p+1);
					}
				}
			}
//console.log(phrase);
			t = "n'a pas des ";
			if (phrase.indexOf(t)==-1) t = "n'a pas un ";
			if (phrase.indexOf(t)==-1) t = "n'a pas une ";
			if (phrase.indexOf(t)==0) {
				phrase = phrase.slice(t.length);
				if (isVowelEx(phrase.charAt(0))) t= "n'a pas d'";
				else t = "n'a pas de ";
				phrase = t + phrase;
			}
			
			ScribeSpeak((y=='y' ? 'Oui, ': 'Non, ') + animal + ' ' + phrase, function() {
				return callback();
			});
		
			
		} else {
			// pas trouvé, donc on recherche la question d'avant
			for (var key in animaux) {
				var value = animaux[key];
//console.log(value);
				if (value=="q" + number) {
					remonteEncyclo2(animal, quoi, key, callback);
					// on a trouvé ca suffit non ?
					return;
				}	
			}
			ScribeSpeak("Désolé, je ne sais pas si  " + animal + ' ' + quoi, function() {
				SCRIBE.activePlugin('aucun (Animaux)');
				return callback(); 
			});		
		}
	} else {
		return callback();
	}

	
}



function remonteEncyclo(animal, index, callback) {
	number = index.substr(1);
	y = index.charAt(0);		// 'y' ou 'n';
	q = animaux["q" +  number];

//console.log("index: " + index + " - number: " + number + ' y: ' + y + ' - q: ' + q);
	
	if (typeof q !== 'undefined') {
		// Cas pris en compte:
		// 1- la question commence par "est-ce qu'il" ou "est-ce que cet animal" ou "est-ce que l'animal" (ex: est-ce qu'il vole ?), donc on vire "est-ce qu....."
		// 2- la question commence par "est-ce que" (ex: est-ce que c'est le mâle qui couve les oeufs) --> on vire "est-ce que"
		// 3- la question commence par un verbe ex: "utilise-t-il ses ailes pour voler", "mange-t-il des graines" --> on vire "-t-il"
		//    on se retrouve avec "utilise ses ailes pour voler"
		// 4- la question commence par "est-ce" mais n'est pas ni du cas 1, ni du 2 ("est-ce un carnivore"). On supprime le "est-ce" et on écrit "est "
		
		// ensuite il faut traiter la négation
		// à ce stade, soit le premier mot est le verbe et donc on peut l'entourer de "ne" (ou <n'> si voyelle) et de "pas" --> "n'utilise pas"
		// où alors ca commence par "c'est " et dans ce cas on le remplace par "ce n'est pas"
		// il reste à déterminer si le mot après "c'est" est différent de "un" ou "une" (c'est un carnivore) et on ajoute "chez" devant notre animal
		// --> chez un hippocampe c'est le mâle qui porte les oeufs
		
		chez = animal;
		phrase = '';
//console.log("question: " + q);
		// cas 1
		t = "est-ce qu'il ";
		p = q.indexOf(t);
		if (p!=0) {
			t = "est-ce que cet animal ";
			p = q.indexOf(t);
			if (p!=0) {
				t = "est-ce que l'animal ";
				p = q.indexOf(t);	
			}
		}
			
		if (p==0) {
			phrase = q.substr(t.length);
//console.log("CAS 1: "+ phrase);			
		} else {
			t = "est-ce que ";
			p = q.indexOf(t);
			if (p==0) {
				// cas 2
				phrase = q.substr(t.length);
//console.log("CAS 2: "+ phrase);
				if (phrase.indexOf("c'est un")!=0) chez = 'chez ' + animal;
			} else {
				// cas 3 a priori ...
				t = "-t-il";
				p = q.indexOf(t);
				if (p==-1) {
					// ex: mangent-ils des graines
					t = "-ils";
					p = q.indexOf(t);
				}
				if (p>0) {
					// cas 3 donc ...
					phrase = q.substring(0,p) + q.substr(p+t.length);
//console.log("CAS 3: "+ phrase);					
				} else {
					// cas 4: "est-ce xxx" ?
					t = "est-ce ";
					p = q.indexOf(t);
					if (p==0) {
						phrase = "est " + q.substr(t.length);
//console.log("CAS 4: "+ phrase);																
					} else {
						// pas trouvé ... tant pis ?
						phrase = q;
console.log("CAS pas traitable");					
					}
				}
			}
		}
		
		if (phrase!='') {
			if (y=='n') {
				p = phrase.indexOf("c'est")
				if (p==0) {
					phrase = "ce n'est pas" + phrase.substr(p+5);
				} else {
					// le premier mot est le verbe, donc on cherche l'espace juste après
					p = phrase.indexOf(" ");
					if (p>0) {
						verbe = phrase.substring(0,p);
						if (isVowelEx(verbe.charAt(0))) verbe = "n'" + verbe;
						else verbe = "ne " + verbe;
						phrase = verbe + ' pas ' + phrase.substr(p+1);
					}
				}
			}
		}
		
		t = "n'a pas des ";
		if (phrase.indexOf(t)==-1) t = "n'a pas un ";
		if (phrase.indexOf(t)==-1) t = "n'a pas une ";
		if (phrase.indexOf(t)==0) {
			phrase = phrase.slice(t.length);
			if (isVowelEx(phrase.charAt(0))) t= "n'a pas d'";
			else t = "n'a pas de ";
			phrase = t + phrase;
		}
		
		// on retire le ? final et on ajoute un ' '
		phrase = ' ' + phrase.substring(0, phrase.length-1);
		
		ScribeSpeak(chez + phrase, function(){
			for (var key in animaux) {
				var value = animaux[key];
				if (value=="q" + number) {
					remonteEncyclo(animal, key, callback);		
					return;
				}	
			}
			
		});
	} else {
		return callback();
	}
	
}


function decodeScribe(phrase, callback) {
	console.log ("Phrase: " + phrase);
	// SCRIBE retourne toute la phrase dite par l'utilisateur
	
	var rgxp = /.*sur (.+)|.*dire (.+)|.*parle-moi (.+)|.*sais-tu de (.+)/i ;

	// on s'assure que Google a bien compris
	var match = phrase.match(rgxp);
	console.log("MATCH: " + match);

	if (!match || match.length <= 1){
		SCRIBE.activePlugin('aucun (Animaux)');
		ScribeSpeak("Désolé je n'ai pas compris. Merci de réessayer.", true);
		return callback();
	}
	
	// on peut maintenant s'occuper des mots qui sont recherchés
	n=1;
	m = match[n];
	
	while (typeof m === 'undefined') {
		if (n<match.length) {
			n++;
			m = match[n];		
		} else break;
	}

	if (typeof m === 'undefined') {
		ScribeSpeak("Désolé, je n'ai pas compris ce que tu veux dire par " + search, function() {
			SCRIBE.activePlugin('aucun (Animaux)');
			return callback(); 
		});
	}
	
	search = m.toLowerCase();
//console.log(search);
	// a priori search contient le nom d'un animal sous un de ces formes
	// "des chiens", "les chiens", "un chien", "une fourmi"
	
	unAnimal=[];
	fnd=true;
	pluriel = false;
	
	p = search.indexOf("des ");
	if (p==-1) {
		p = search.indexOf("les ");	
		if (p==-1) {
			p = search.indexOf("un ");	
			if (p==-1) {
				p = search.indexOf("une ");
				if (p == -1) {
					p = search.indexOf("le ");
					if (p==-1) {
						p = search.indexOf("la ");
						if(p==-1) {
							p = search.indexOf("l'");
							if (p==-1) {
								p = search.indexOf("du "); // du babouin
								if (p==-1) {
									p = search.indexOf("de ");
									if (p==-1) {
										fnd = false;
										ScribeSpeak("Désolé, je n'ai pas compris ce que tu veux dire par " + search, function() {
										SCRIBE.activePlugin('aucun (Animaux)');
										return callback(); 
										});
									} else {
										// ceci est un cas très particulier quand Google comprend "de" au lieu de "des"
										pluriel = true; 
										p--;
										}
								} else {
									bete = search.substr(p+2);
									unAnimal.push("un " + bete);
									unAnimal.push("une " + bete);
								}
							} else {
								bete = search.substr(p+2);
								unAnimal.push("un " + bete);
								unAnimal.push("une " + bete);
							}
						} else search = "une " + search.substr(p+3);
					} else search = "un " + search.substr(p+3);
				}
			}
		} else pluriel=true;
	} else pluriel=true;
	
	if (fnd) {
		if (!pluriel) unAnimal.push(search);
		else {
			bete = search.substr(p+4);
			// peu de chance que le pluriel s'écrive comme le singulier, mais bon ...
			//unAnimal.push("un " + bete);
			//unAnimal.push("une " + bete);
			
			var ani = singuliers_possibles(bete);
			for (i=0;i<ani.length;i++) {
				unAnimal.push("un " + ani[i]);
				unAnimal.push("une " + ani[i]);
			}
		}
		
//console.log(unAnimal);
		// à ce stade on a un array avec au moins un des items qui est notre animal ... reste à trouver où il est ..
		
		for (var key in animaux) {
			var value = animaux[key];
//console.log(value);
			var n = unAnimal.indexOf(value);
			if (n>-1) {
				monAnimal = unAnimal[n];
				remonteEncyclo(monAnimal, key, callback);
			
				// on a trouvé ca suffit non ?
				return;
			}	
		}
		
		
		
		
		
		ScribeSpeak("Désolé, je ne sais rien sur: " + search, function() {
			SCRIBE.activePlugin('aucun (Animaux)');
			return callback(); 
		});
	}
}

function singuliers_possibles(bete) {
	// on va reconstituer toutes les combinaisons possibles en virant les pluriels
	// "étoileS de mer"-->"étoile de mer" 
	// "tortueS marineS"-->"tortue marines", "tortues marine", "tortue marine"
	// "chevaux sauvages"-->"chevau sauvages", "cheval sauvages", "chevaux sauvage", "cheval sauvage"
	var ani=[];
if (bete=='') return [""];	
	
	var mots = bete.split(" ");
	
	var mot = mots[0];
	var esp = (mots.length>1 ? ' ': '');
	var reste_bete = bete.substr((mot + esp).length) ;	

//console.log("mot:" + mot + '-reste:' + reste_bete);
	
	//ani.push(mot + esp + reste_bete);
	sp = singuliers_possibles(reste_bete);
//console.log('mot: ' + mot + ' -SP: ' + sp);
	for (i=0;i<sp.length;i++) {
		ani.push(mot + esp + sp[i]);
	}
	
	if (mot.slice(-1)=='s') {
		//ani.push(mot.slice(0,-1) + esp + reste_bete);
		for (i=0;i<sp.length;i++) {
			ani.push(mot.slice(0,-1) + esp + sp[i]);
		}	
		
	} else if (mot.slice(-1)=='aux') {
		// pluriel potentiel aux->al ou aux->ail ou x->""
		for (i=0;i<sp.length;i++) {
			ani.push(mot.slice(0,-3) + "al" + esp + sp[i]);
		}
		for (i=0;i<sp.length;i++) {
			ani.push(mot.slice(0,-3) + "ail" + esp + sp[i]);
		}
		for (i=0;i<sp.length;i++) {
			ani.push(mot.slice(0,-1) + esp + sp[i]);
		}
		
		
	} else if (mot.slice(-1)=='x') {
		// pluriel en x mais pas en aux
		for (i=0;i<sp.length;i++) {
			ani.push(mot.slice(0,-1) + esp + sp[i]);
		}
		
	} else {
		// a priori mot au singulier
		
	}

	return ani;
}


////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////



function beginGame(SARAH, firstTime) {
	ScribeSpeak(( firstTime ? "D'accord. Je suis très douée à ce jeu car" : "") + " je connais " + animaux_cnt + " animaux différents ! " + 
				"Répondez à mes questions par oui ou par non . " +
	     		"Pour arrêter de jouer dites simplement " + SARAH.context.animaux_scribe.Sarah_name + " je ne joue plus !", 
		function() {
			askQuestion("q1");
	});

}

function askOuiNonStop(q, callback) {
	ScribeAskMe(q, [
		{'regex': /(joue plus|joue pas)/i, 'answer':'stop'},
		{'regex': /(oui|correct|juste|exact|accord|ok)/, 'answer':'oui'},
		{'regex': /(non|pas)/, 'answer':'non'}
	], function(answer,phrase,match,wholeMatch) {
		callback(answer,phrase,match,wholeMatch);
	}, {'timeout':maConfig.timeout_msec, 'retryIfNoMatch': "Je ne suis pas sûr d'avoir compris. Peux-tu répéter ? " + q, 'essais': 2, 
			waitForFinal: false, partialThreshold: 0.01 }
	);
}

function askQuestion(q) {
	askOuiNonStop(animaux[q], 
		function(answer,phrase,match,wholeMatch) {
			if (answer=='oui' || answer=='non') {
				number = q.substr(1);
				key = (answer=='oui' ? 'y' : 'n') + number;
				next = animaux[key];
				if (!isNaN(next.charAt(1))) {
					// question suivante ...
					askQuestion(next);
				} else {
					// proposition ...
					propose(next, key, number);
				}
			} else if (answer=='stop') {
				ScribeSpeak("D'accord, on arrête de jouer pour le moment.", true);
			} else if (answer==false) {
				ScribeSpeak("Je ne suis pas sûr que tu aies répondu à ma question !", function () {
					askQuestion(q);
				});
			}
			else ScribeSpeak("Tu n'as rien répondu. Tant pis. Arrêtons ici.", true);
		}
	);
}

function propose(animal, key, number) {
	askOuiNonStop("Est-ce que c'est " + animal + " ?",
		function(answer,phrase,match,wholeMatch) {
			if (answer=='oui') {
				ScribeSpeak("Youpie ! J'ai gagné !", function() {
					askPlayAgain();
				});
			} else if (answer=='non') {
				ScribeSpeak("Ah zut ! J'ai perdu !", function() {
					perdu(animal, key, number);					
				})
			} else if (answer=='stop') {
				ScribeSpeak("D'accord, on arrête de jouer pour le moment. Dommage, je ne saurai jamais si j'ai gagné ou pas !", true);
			} else if (answer==false) {
				ScribeSpeak("Je ne suis pas sûr que tu aies répondu à ma question !", function () {
					propose(animal, key ,number);
				});
			}
			else ScribeSpeak("Tu n'as rien répondu. Tant pis. Arrêtons ici.", true);
		}
	);				
}

function perdu(old_animal, key, number) {
	ScribeAskMe("A quel animal pensais-tu ?", [
		{'regex': /((un|une) (.+))/, 'answer':'animal'},
		{'regex': /(joue plus)/i, 'answer':'stop'}
		], function(answer,phrase,match,wholeMatch) {
			if (answer=='animal') {
				animal = match;
				console.log("ANIMAL: " + match);
				confirmer("Donc tu pensais à " + animal + ". Est-ce correct ?", function(reponse) {
					if (reponse=='non') {
						ScribeSpeak("Désolé, j'ai du mal comprendre, ça m'arrive parfois.", function() {
							perdu(old_animal, key, number);					
						});
					} else {
						ScribeSpeak("Ok.", function() {
							questionNewAnimal(animal, old_animal, key, number);
						});
					}
				});

			} else if (answer=='stop') {
				ScribeSpeak("D'accord, on arrête de jouer pour le moment.", true);
			} else if (answer==false) {
				ScribeSpeak("Je ne suis pas sûr que tu aies répondu à ma question !", function () {
					perdu(old_animal,key,number);
				});
			}
			else ScribeSpeak("Tu n'as rien répondu. Tant pis. Arrêtons ici.", true);
	}, {'timeout':maConfig.timeout_msec, 'retryIfNoMatch': "Je ne suis pas sûr d'avoir compris. Peux-tu répéter ? A quel animal pensais-tu ?", 'essais': 2}
	);
}

function questionNewAnimal(animal, old_animal, key, number) {
	q = "Quelle bonne question faut-il poser pour différencier " + animal + " et " + old_animal + " ?";
	ScribeAskMe(q, [
		{'regex': /(.+)/, 'answer':'question'},
		{'regex': /(joue plus)/i, 'answer':'stop'}
		], function(answer,phrase,match,wholeMatch) {
			if (answer=='question') {
				question = match + " ?";
				confirmer("Ta question est: \"" + question + "\" Est-ce correct ?", function(reponse) {
					if (reponse=='non') {
						ScribeSpeak("Désolé, j'ai du mal comprendre, ça m'arrive parfois.", function() {
							questionNewAnimal(animal, old_animal, key, number);					
						});
					} else {
						ScribeSpeak("Ok.", function() {
							reponseNewAnimal(question, animal, old_animal, key, number);
						});
					}
				})

			} else if (answer=='stop') {
				ScribeSpeak("D'accord, on arrête de jouer pour le moment.", true);
			} else if (answer==false) {
				ScribeSpeak("Je ne suis pas sûr que tu aies répondu à ma question !", function () {
					questionNewAnimal(animal, old_animal, key, number);					
				});
			}
			else ScribeSpeak("Tu n'as rien répondu. Tant pis. Arrêtons ici.", true);
	}, {'timeout':maConfig.timeout_msec, 'retryIfNoMatch': "Je ne suis pas sûr d'avoir compris. Peux-tu répéter ? " + q, 'essais': 2}
	);
}

function reponseNewAnimal(question, animal, old_animal, key, number) {
	q = "A la question \"" + question + "\" Faut-il répondre oui ou non pour deviner " + animal + " ?";
	askOuiNonStop(q,
		function(answer,phrase,match,wholeMatch) {
			if (answer=='oui' || answer=='non') {
				max_number++;
				animaux_cnt++;
				animaux[key] = "q" + max_number;
				animaux["q" + max_number] = question;
				animaux["y" + max_number] = (answer=='oui' ? animal : old_animal);
				animaux["n" + max_number] = (answer=='non' ? animal : old_animal);
				writeAnimaux();
				ScribeSpeak("Super ! Je connais à présent " + animaux_cnt + " animaux !",function() {
					askPlayAgain();
				});
			} else if (answer=='stop') {
				ScribeSpeak("D'accord, on arrête de jouer pour le moment.", true);
			} else if (answer==false) {
				ScribeSpeak("Je ne suis pas sûr que tu aies répondu à ma question !", function () {
					reponseNewAnimal(question,animal, old_animal, key, number);					
				});
			}
			else ScribeSpeak("Tu n'as rien répondu. Tant pis. Arrêtons ici.", true);
	}, {'timeout':maConfig.timeout_msec, 'retryIfNoMatch': "Je ne suis pas sûr d'avoir compris. Peux-tu répéter ? " + q, 'essais': 2}
	);
}

function askPlayAgain() {
	confirmer("Veux-tu faire une nouvelle partie ?", 
		function(reponse) {
			if (reponse=='oui') {
				ScribeSpeak("D'accord ! Pense à un animal, je vais essayer de le deviner !", function() {
					askQuestion("q1");
				})
			}
			else ScribeSpeak("Ok. Arrêtons ici.", true);
		}
	);
}


function confirmer(q, callback) {
	askOuiNonStop(q, 
		function(answer,phrase,match,wholeMatch) {
			if (answer=='oui') {
				callback('oui');
			} else if ( answer=='non') {
				callback('non');
			} else if (answer=='stop') {
				ScribeSpeak("D'accord, on arrête de jouer pour le moment.", true);
			} else if (answer==false) {
				ScribeSpeak("Je ne suis pas sûr que tu aies répondu à ma question !", function () {
					confirmer(q);
				});
			}
			else ScribeSpeak("Tu n'as rien répondu. Tant pis. Arrêtons ici.", true);
		}
	);
}


function isVowel(c) {
    return ['a', 'e', 'i', 'o', 'u'].indexOf(c.toLowerCase()) !== -1
}

function isVowelEx(c) {
    return ['a', 'e', 'i', 'o', 'u', 'à', 'â', 'é', 'è', 'ê', 'î', 'ô', 'û'].indexOf(c.toLowerCase()) !== -1
}