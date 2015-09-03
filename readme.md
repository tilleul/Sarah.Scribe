PLUGIN: SCRIBE
==============
- Le plugin Scribe (pour Sarah) permet d'utiliser la reconnaissance vocale HTML5 de Google, à travers Google Chrome.
- Le plugin crée un serveur HTTPS **local** qui héberge une page liée au moteur de reconnaissance vocale HTML5 de Google et ouvre Google Chrome directement sur cette page
- Toute phrase prononcée dans le micro est à la fois interprétée par Sarah (et ses grammaires XML) et la page HTTPS.
- La page HTTPS envoie au plugin Scribe tout ce qu'elle reconnait comme mots (y compris durant la phase de reconnaissance "partielle").
- Le plugin Scribe offre des facilités pour utiliser ce que Google a reconnu comme phrase afin d'exploiter Google dans des plugins tiers.
- En bonus, le plugin Scribe écrit dans une zone de la page HTTPS quel est le plugin actif mais aussi ce que Sarah a dit en surlignant les mots qui sont prononcés au fur et à mesure (le timing de cette partie est à régler indépendamment et est totalement expérimental) et en animant un petit visage formé de smileys ... :-)

Prérequis
---------
- Sarah v3 (j'ai mis du code compatible v4 mais je n'ai pas testé)
- Google Chrome en dernière version

Installation
------------
1. copiez le répertoire `scribe` dans le répertoire `plugins` de Sarah
2. installez éventuellement l'un ou l'autre plugin exemple (voir plus bas)
3. lancez Sarah (serveur+client)
4. Google Chrome s'ouvre sur la page `https://127.0.0.1:4300` (<-- HTTPS !!)
5. confirmez l'exception de sécurité
6. au besoin confirmez l'utilisation du micro (cette étape ne sera plus jamais demandée car on est en HTTPS)
7. dans Chrome, appuyez sur ALT-F pour ouvrir le menu de Chrome, puis choisissez `Paramètres` (5e avant la fin)
8. allez tout en bas de la page des Paramètres et cliquez sur `Afficher les paramètres avancés`
9. cliquez sur le bouton `Gérer les certificats' dans la section HTTPS/SSL (vers la fin)
10. choisissez l'onglet `autorités de certification RACINES de confiance`
11. cliquez sur le bouton `importer` puis sur le bouton `suivant`, puis sur le bouton `parcourir`
12. dans la fenêtre qui s'ouvre choisissez `Certificats PKCS#7` dans la liste déroulante en bas à droite (au dessus du bouton `ouvrir`)
13. sélectionnez le fichier `sarah_chrome.p7b` qui est dans le répertoire du plugin et cliquez sur le bouton `ouvrir`
14. cliquez sur `suivant` deux fois, puis sur `terminer`

Les étapes 7 à 14 ne sont à effectuer qu'une seule fois et permettent que Chrome n'émette plus d'avertissement de sécurité (étape 5) la prochaine fois que vous lancerez Sarah

Fonctionnalités
---------------
Le plugin Scribe est composé d'une partie NodeJS et d'une page web HTTPS. La page web HTTPS discute avec Sarah/NodeJS de manière bidirectionelle:
- elle renvoie à Sarah/NodeJS ce que Google a pu déchiffrer, ainsi que l'indice de confiance de la reconnaissance Google
- elle reçoit de Sarah les phrases qu'elle est en train de prononcer et surligne les mots qu'elle prononce. En même temps un petit visage constitué de smileys s'anime

Quand vous dites une phrase, vous pouvez voir dans Chrome le moteur de Google chercher la meilleure correspondance (=reconnaissance **PARTIELLE**) jusqu'à ce que le moteur considère que la reconnaissance est terminée, auquel cas il renvoie une reconnaissance **COMPLETE** (qui s'affiche sur fond noir).

Les deux types de reconnaissance sont envoyés à Sarah, ce qui lui permet de réagir beaucoup plus vite que s'il fallait attendre la reconnaissance complète. Cette fonctionnalité est très utile car Google peut parfois mettre plusieurs secondes à reconnaitre une phrase simple ("oui", "non", "Sarah allume la lumière"). La reconnaissance partielle permet au plugins basés sur Scribe de réagir beaucoup plus vite. Ainsi, dès que la reconnaissance partielle à identifié "oui", "non" ou "allum*" (à rechercher avec un Regex par ex.), on pourrait utiliser ce résultat plutôt que d'attendre la reconnaissance complète. Bien entendu ce mécanisme est optionnel et vous n'êtes pas obligé de l'utiliser systématiquement.

Le plugin Scribe expose de nouveaux objets JavaScript exploitables dans vos plugins, à travers l'objet `SARAH.context.scribe`.

- `compteur`: il s'agit d'un compteur de phrases reconnues entièrement par Google. A chaque fois qu'une phrase est reconnue COMPLETEMENT, ce compteur est incrémenté de 1. Ce mécanisme permet de s'assurer très rapidement qu'une nouvelle phrase a été prononcée dans le micro simplement en comparant une valeur mémorisée du compteur avec l'actuelle valeur.
- `compteurPartial`: il s'agit d'un compteur de phrases reconnues PARTIELLEMENT par Google. A chaque fois qu'une phrase est reconnue PARTIELLEMENT, ce compteur est incrémenté de 1. Dès que la phrase est reconnue entièrement, `compteurPartial` reprend la même valeur que `compteur`. Si on utilise la reconnaissance partielle, il faut mettre soi-même ce compteur à la même valeur que `compteur` sous peine de mal identifier les reconnaissances partielles suivantes.
- `lastReco`: contient la dernière phrase reconnue COMPLETEMENT par Google.
- `lastPartial`: contient la dernière phrase reconnue PARTIELLEMENT par Google.
- `lastConfidence`: contient la valeur de confiance de la dernière reconnaissance COMPLETE
- `lastPartialConfidence`: idem pour la dernière reconnaissance PARTIELLE
- `lastX`: contient un objet `[{compteur: ..., reco: ..., confidence: ...}, {}, ...]` des X dernières reconnaissances complètes. La dernière phrase reconnue est toujours en `[0]`
- `microOFF()`: fonction appelant `nircmd` pour éteindre le micro. C'est notamment utile pendant que Sarah parle afin que Google n'interprète pas ce que dit Sarah. Cette fonction est déjà appelée par `ScribeSpeak  et `ScribeAskMe`, il n'est donc pas nécessaire de l'appeler lorsqu'on utilise ces deux fonctions-là.
- `microON()`: fonction appelant `nircmd` pour allumer le micro.
- `SarahEcoute(true|false)`: cette fonction permet de rendre sourde Sarah si on passe `false` en paramètre. Pour rétablir l'écoute de Sarah, on passe `true`. Cette fonction est très utile quand on désire ne traiter QUE la reconnaissance Google tout en empêchant Sarah d'exécuter la moindre grammaire. Cette fonction est déjà appelée par `ScribeAskMe`.
- `hook()`: ceci permet d'appeler une fonction `callback` dès que Chrome a reconnu partiellement ou complètement une phrase. La fonction `callback` prend en argument un `event` indiquant si la reconnaissance est partielle, complète ou si il y a eu un time-out.
Exemple de code:
```javascript
	SARAH.context.scribe.hook = function(event) {
		if (event==SARAH.context.scribe.FULLRECO) {
			// ... traiter la reconnaissance complète
		} else if (event==SARAH.context.scribe.PARTIALRECO) {
			// ... traiter la reconnaissance partielle
		} else if (event==SARAH.context.scribe.TIME_ELAPSED) {
			// ... traiter le time out
		}
	};
```
- `ScribeSpeak(tts, callback)`: remplace la fonction `SARAH.speak()` avec en paramètre:
  - `tts`: le texte à dire. Ce texte peut être une chaîne de caractères classiques, ou un array (ex: `['bonjour','salut',ça ca']`) ou une chaine de caractères spéraées par des `|` (ex: `"Bonjour|Salut|ça va"`). Dans les deux derniers cas, le Scribe fera dire à Sarah **au hasard** une des phrases de l'array ou une des phrases séparées par `|` (ex: Sarah dira "bonjour" ou "salut" ou "ça va").
  - `callback`: Peut être
    - une fonction `callback()` classique (comme `SARAH.speak()`) 
	- à `true` afin de forcer la synchronisation
	- à `false` ou êtes omis pour fonctionner en asynchrone (le code principal continue de s'exécuter sans attendre la fin de la vocalisation)

  `ScribeSpeak` n'est pas qu'un simple remplacement de `SARAH.speak()` car en plus,
    - il arrête la reconnaissance Google le temps de la vocalisation
    - il coupe le micro avant vocalisation afin d'éviter que Google n'interprête ce que Sarah dit comme étant quelque chose qu'un humain aurait dit
	- il surligne au fur et à mesure, sur la page web HTTPS, les mots que Sarah prononce et demande à la page web d'animer le visage
    - il rétablit le micro après la vocalisation
  Exemple: 
  ```javascript
  ScribeSpeak("Bonjour je m'appelle Sarah et " + 
			  "les mots de cette phrase sont surlignés au fur et à mesure.", function() {
				// fonction callback appelée une fois que la vocalisation est terminée
  })
  ```
  
- `ScribeAskMe(question, reponses, callback, options)`: remplace la fonction `SARAH.askme()`. Paramètres:
  - `question`: la question a poser (chaine de caractères)
  - `reponses`: un array de la forme `[{'regex': regexp, 'match_number': number, 'answer': object}, {...}]`. 
    - Les phrases reconnues par Google sont comparées avec une expression **regex** en utilisant la méthode JS **match()**. 
	- L'expression regex se place dans le paramètre `regex`, 
	- le n° de l'item à **matcher** se place dans `match_number` (la fonction `match()` peut renvoyer plusieurs résultats sous forme d'un array, `match_number` contient le n° de l'item à considérer). Par défaut, vaut `0`.
	- s'il y a un match, le Scribe renverra l'objet associé à `answer` ou, s'il n'a pas été défini, il renverra le n° de la place dans l'array **+ 1**
  - `callback` est la fonction `callback` de rappel sous la forme `callback(answer,phrase,match,wholeMatch)`. Avec
    - `answer`: l'objet définit dans `reponses` s'il y a eu un match (ou bien un numéro correspondant à l'indice de la a réponse reçue **+ 1** -- voir juste avant), ou bien `false` si il n'y a pas eu de match ou bien `undefined` s'il n'y a pas eu de réponse
	- `phrase`: la phrase reconnue par Google et qui a servi au traitement regex `match()`
	- `match`: le bout de phrase qui a été trouvé par le regex
	- `wholeMatch`: l'array match complet qui a été renvoyée par le regex
  - `options`: un objet `{}` comprenant les paramètres optionnels suivants:
     - `timeout`: nombre de millisecondes avant de considérer qu'on n'a pas répondu à la question. 10000 par défaut.
	 - `essais`: nombre d'essais autorisés en cas de timeout ou en cas de réponse ne contenant pas ce qu'on cherche (si l'option `retryIfNoMatch` est à `true`). Par défaut égal à 1.
	 - `repeter`: s'il nous reste des essais et **qu'on a atteint le timout**, on a la possibilité de faire répéter la question ou de la formuler autrement. Vaut `true` par défaut. Valeurs autorisées:
	   - `true` alors, s'il nous reste des essais, la `question` est répétée quand on atteint le timeout 
	   - `false`: la question n'est pas répétee
	   - Si contient une chaine de caractères, alors cette chaine est vocalisée plutôt que de répéter la question
	 - 'retryIfNoMatch`: s'il nous reste des essais et qu'une phrase a été reconnue mais qu'on n'a pas trouvé de match, on a la possibilité de faire répéter la question ou de la formuler autrement. Cette option est similaire à `repeter` mais intervient uniquement en cas de non-match. Vaut `false` par défaut. Valeurs autorisées:
	   - `true`: la `question` originale est répétée  
	   - `false`: la question n'est pas répétée
	   - Si contient une chaine de caractères, alors cette chaine est vocalisée pluttôt que de répéter la question
	 - `waitForFinal`: Si `true` alors seule une reconnaissance **complète** est autorisée. Si `false` alors on peut utiliser une reconnaissance **partielle**. Vaut `true` par défaut.
	 - `usePartialAfterTimeout`: Si `true` alors, en cas de timeout parce qu'il n'y a pas de phrase reconnue **complètement**, on autorise l'utilisation des bribes de phrase reconnues **partiellement** (c'est un peu l'option de la dernière chance). Si `false` alors on ne donne pas la possibilité d'utiliser ce qui a été reconnu **partiellement** en cas de timeout. Vaut `true` par défaut
	 - `partialThreshold`: flottant indiquant l'indice de confiance minimum à considérer si `waitForFinal` est égal à `false` ou que `usePartialAfterTimeout` est `true` et que donc on utilise la reconnaissance partielle. Vaut 0.8 par défaut.
  
  Exemple:
  ```javascript
  q = "Est-ce que l'animal auquel tu penses possède des ailes ?";
  ScribeAskMe(q, [
				// le regex suivant permet de dire "sarah je ne joue pas" ou "je ne joue plus"
				 {'regex': /(joue plus|joue pas)/i, 'answer':'stop'},
				 // le regex suivant permet de dire "oui","d'accord","correct","ok","exact","juste"
				 // et sera considéré comme équivalent à "oui"
				 {'regex': /(oui|correct|juste|exact|accord|ok)/, 'answer':'oui'},
				 // le regex suivant permet de réagir à "non" ou à "il n'a PAS d'ailes"
				 {'regex': /(non|pas)/, 'answer':'non'}
				], function(answer,phrase,match,wholeMatch) {
						if (answer=='oui') {
							// traiter le fait qu'on a répondu oui
						} else if (answer=='non') {
							// traiter le fait qu'on a répondu non
						} else if (answer=="stop") {
							// traiter le fait qu'on a demandé d'arrêter de jouer
						} else if (answer==false) {
							// si on arrive ici c'est qu'on a répondu quelque chose 
							// qui n'a pas été compris par le scribe/google
						} else {
							// si on arrive ici c'est qu'on n'a rien répondu
							// car en fait (typeof answer === 'undefined')
						}
				}, 
			{'timeout':15000, 	// on demande 15 sec de timeout
			// si on n'a pas répondu, on explique puis on répète la question
			'retryIfNoMatch': "Je ne suis pas sûr d'avoir compris. Peux-tu répéter ? " + q, 
			'essais': 2, 		// on a droit à deux essais
			waitForFinal: false, 		// on autorise le traitement des réponses partielles
										// avec un taux de confidence de 1% ! 
			partialThreshold: 0.01 		// (c'est le plus bas possible !)
			}
	);
  ```
  

Avantages
---------
- PLUS DE LIMITATION A 50 UTILISATIONS !!
- Plus besoin de créer une clé Google API (dont le principe d'inscription change tout le temps)
- vous pouvez utiliser le même principe (sans nécessairement Garbage) pour récupérer ce que Chrome a compris A TOUT INSTANT ! Par ex:
  - votre grammaire contient "Sarah allume la lumière du salon" et "Sarah allume la lumière de la cuisine"
  - anciennement il fallait passer en argument (action/data) le mot "salon" ou "cuisine" si on voulait que Sarah réponde "j'ai allumé la lumière de la cuisine/salon"
  - vous pouvez à présent utiliser la dernière phrase reconnue par Google pour savoir quelle lumière vous avez demandé en dernier !
- Pour certains mots, Chrome est beaucoup plus précis au niveau de la reconnaissance. C'est notamment le cas pour tous les mots en anglais mais aussi pour les nombres.
  

Inconvénients
-------------
- tributaire de Google Chrome (plantages ? comment les détecter, relancer Chrome, etc)
- dépend de la qualité de la connexion (vitesse, stabilité, disponibilité des serveurs Google etc)
- Chrome peut entendre la réponse de Sarah ou d'autres bruits et donc renvoyer quelques chose d'erroné (solution ? couper le micro ?)
- il faut (légèrement) réécrire les plugins qui utiliseraient la règle GARBAGE si on veut utiliser ce principe (il faut aussi réécrire le code de speech_test.js pour qu'il utilise un certificat SSL qui ne change pas à chaque lancement ... mais bon c'est une autre histoire)

