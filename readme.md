PLUGIN: SCRIBE
==============
- Le plugin Scribe (pour Sarah) permet d'utiliser la reconnaissance vocale HTML5 de Google, à travers Google Chrome.
- Le plugin crée un serveur HTTPS **local** qui héberge une page liée au moteur de reconnaissance vocale HTML5 de Google et ouvre Google Chrome directement sur cette page
- Toute phrase prononcée dans le micro est à la fois interprétée par Sarah (et ses grammaires XML) et la page HTTPS.
- La page HTTPS envoie au plugin Scribe tout ce qu'elle reconnait comme mots (y compris durant la phase de reconnaissance "partielle").
- Le plugin Scribe offre des facilités pour utiliser ce que Google a reconnu comme phrase afin d'exploiter Google dans des plugins tiers.
- En bonus, le plugin Scribe permet d'écrire dans une zone de la page HTTPS quel est le plugin actif mais aussi ce que Sarah a dit en surlignant les mots qui sont prononcés au fur et à mesure (le timing de cette partie est à régler indépendamment et est totalement expérimental) et en animant un petit visage formé de smileys ... :-)

Versions
--------
#### Version 1.0 
- release initial

#### Version 1.1
- correction de quelques bugs
- enfin compatible avec la v4
- la v4 ne supporte pas qu'on rende Sarah sourde à tour de bras. Pour simuler cela, je change le `context` à `rien` (ceci se passe uniquement en v4, en v3 Sarah est bel et bien rendue sourde sans changer le contexte).
- rajout du paramètre de config `pause_minimale_avant_synthese`
- nouveau plugin Liste Des Courses ! (voir plus bas)

Prérequis
---------
- Sarah v3 OU v4
- Google Chrome en dernière version
- une connexion internet

Installation
------------
1. copiez le répertoire `scribe` dans le répertoire `plugins` de Sarah
2. installez éventuellement l'un ou l'autre plugin exemple (voir plus bas)
3. lancez Sarah (serveur+client)
4. Google Chrome s'ouvre sur la page `https://127.0.0.1:4300` (<-- HTTPS !!)
5. confirmez l'exception de sécurité
6. au besoin confirmez l'utilisation du micro (cette étape ne sera plus jamais demandée car on est en HTTPS)
7. dans Chrome, appuyez sur ALT-F pour ouvrir le menu de Chrome, puis choisissez `Paramètres` (5e avant la fin)
8. Dans la section "Au démarrage", choisissez "Ouvrir la page Nouvel Onglet" pour éviter d'avoir deux fois la page HTTPS ouverte entre deux redémarrages de Chrome.
9. Ensuite, allez tout en bas de la page des Paramètres et cliquez sur `Afficher les paramètres avancés`
10. cliquez sur le bouton `Gérer les certificats' dans la section HTTPS/SSL (vers la fin)
11. choisissez l'onglet `autorités de certification RACINES de confiance`
12. cliquez sur le bouton `importer` puis sur le bouton `suivant`, puis sur le bouton `parcourir`
13. dans la fenêtre qui s'ouvre choisissez `Certificats PKCS#7` dans la liste déroulante en bas à droite (au dessus du bouton `ouvrir`)
14. sélectionnez le fichier `sarah_chrome.p7b` qui est dans le répertoire du plugin et cliquez sur le bouton `ouvrir`
15. cliquez sur `suivant` deux fois, puis sur `terminer`

Les étapes 9 à 15 ne sont à effectuer qu'une seule fois et permettent que Chrome n'émette plus d'avertissement de sécurité (étape 5) la prochaine fois que vous lancerez Sarah

Plugins Exemples
----------------
Copiez les répertoires finissant par `_scribe` ou commençant par `scribe_` dans le répertoire `plugins` de Sarah pour bénéficier de plugins exemples utilisant le Scribe.

Pour tous les plugins exemple, n'hésitez pas à voir comment Google interprète ce que vous dites. Vous verrez également Sarah parler. :-)

A noter que la vraie Sarah est sourde pendant ces petits exemples afin d'éviter qu'elle n'enclenche ses grammaires XML classiques.

#### Animaux
Tout le plugin utilise strictement les fonctionnalités du Scribe (reconnaissance vocale Google), même pour les questions "oui/non"
- Dites: "Sarah devine à quel animal je pense" et Sarah va vous poser une série de questions pour essayer de le deviner.
  - Répondez aux questions par "oui" ou par "non". Mais vous pouvez également dire "c'est exact" ou "correct" ou "non, ce n'est pas ça" etc. 
  - Il n'y a pas vraiment de limites de phrase correspondant à "oui" ou "non".
  - Dès qu'une phrase contient: "oui", "exact", "correct", "juste", "accord" alors c'est considéré comme "oui"
  - Dès qu'une phrase contient: "non" ou "pas" ("il n'a PAS de trompe"), c'est considéré comme "non"
  - Dites "je ne joue plus" à tout moment pour arrêter le jeu
  - A un moment Sarah va vous demander s'il s'agit de tel ou tel animal
  - Si Sarah ne trouve pas votre animal, elle va vous demander une question permettant de différencier le vôtre et sa réponse à elle. 
  - Choisissez bien votre question et surtout **prononcez-la distinctement** car c'est la reconnaissance Google qui entre en jeu.
  - Sarah répète votre question et vous permet de la formuler autrement si Google n'a pas reconnu correctement ou si vous voulez en donner une autre.
  - Sarah retient alors votre question et a ainsi appris un nouvel animal
  
Vous pouvez également demander à Sarah de vous en dire plus sur tel ou tel animal
- Dites: "Sarah que peux-tu me dire sur (animal)"
  - Sarah va alors parcourir sa base de connaissances pour ressortir tout ce qu'elle sait sur l'animal en question
  - Cette partie du plugin est capable de traiter les animaux au singulier et au pluriel.
  En effet, Sarah stocke le nom de l'animal au singulier (par ex: "un cheval"). Si vous lui demandez "Sarah que peux-tu me dire sur les chevaux", Sarah est capable d'identifier que le singulier de "chevaux" c'est cheval. Idem pour les animaux à noms composés ("les étoile**s** de mer", "les tortue**s** marine**s**", etc.)
  
Enfin, vous pouvez demander à Sarah si elle sait si tel ou tel animal a telle ou telle caractéristique. Par ex:
- Dites: "Sarah est-ce qu'un chien vit dans l'eau"
	- Sarah identifie l'animal (un chien) et recherche parmi ses questions une qui contient "vit dans l'eau"
	- elle cherche ensuite à savoir si la question se pose pour l'animal
- pour ce morceau de plugin, vous **devez** dire le nom de l'animal au singulier car sinon j'aurais du traiter la conjugaison des verbes ("est-ce que les chiens **vivent** dans l'eau ?").

#### AskMeTest
Il s'agit d'un petit plugin tout simple pour tester comment fonctionne le `AskMe` du Scribe. S'ensuit un petit dialogue.
Dites:
- Sarah demande-moi ma couleur préférée
  - Sarah vous pose la question
  - Vous pouvez répondre soit par votre couleur préférée soit par celle que vous n'aimez justement pas. Sarah essaye de trouver dans votre réponse (et surtout **réagit différemment !!**) les mots suivants:
	- "pas le (couleur)" ou "pas (couleur)" ou "pas la couleur (couleur)" (Ex: "je ne sais pas mais sûrement pas le noir !")
	- "le (couleur)" ou "la couleur (couleur)" (ex: "j'aime le bleu")
	- "aucune" ou "pas" (ex: "je n'en ai pas" ou "je n'en aime aucune")
	- "toutes" ou "tout" (ex: "j'aime un peu de tout" ou "toutes !")
- Sarah pose-moi des questions
	- Sarah vous demande votre prénom et vous salue, puis Sarah demande votre âge
	- du moment que votre réponse contient un nombre elle sera comprise par Sarah (ex: "22 ans" ou "je suis âgé de 22 ans" ou "j'ai 22 ans", "j'ai eu 22 ans hier", etc)
	
N'hésitez pas à lire le code source pour vous familiariser avec les possibilités du Scribe.
#### Poils aux doigts
Voici encore un plugin totalement inutile. 

Dites:
- Sarah poils aux doigts
	- A partir de ce moment Sarah va écouter tout ce que vous dites et essayer de trouver une rime qui correspond. 
	Ex: 
	  - Je me demande ce que je vais faire. 
	  - Poil aux artères !

#### Sale Gamine
Même principe que "Poil aux doigts" mais sans les rimes ..
Dites:
- Sarah sale gamine

et Sarah répète tout ce que vous dites comme une sale gamine ... :-)

#### Wikipedia
Dites:
- Sarah recherche (truc à rechercher) sur Wikipedia

et Sarah fait la recherche et vous lit le premier paragraphe wikipedia correspondant.

#### Liste des courses
Ce plugin gère une liste de courses simple.

Pour ajouter un article à la liste, dites:
- Sarah je veux acheter (quelque chose)
- Sarah je n'ai plus de (quelque chose)
- Sarah rappelle-moi d'acheter (quelque chose)

Pour supprimer un article, dites
- Sarah supprime (quelque chose) de la liste (des courses)
- Sarah retire (quelque chose) de la liste (des courses)
- Sarah enlève (quelque chose) de la liste (des courses)

Sarah refusera de supprimer les articles si vous n'êtes pas assez spécifique. Ce sera le cas si vous dites "Sarah supprime les chips de la liste" alors que la liste contient des "chips au sel" et des "chips au paprika".
	
Pour vider toute la liste, dites
- Sarah vide (toute) la liste (des courses)
- Sarah nettoie (toute) la liste (des courses)
- Sarah supprime (toute) la liste (des courses)

Pour savoir ce qu'il y a dans la liste, dites
- Sarah qu'y a t-il dans la liste ?
	

La liste est stockée dans un simple fichier texte avec une entrée par ligne.
	
Fonctionnalités
---------------
Le plugin Scribe est composé d'une partie NodeJS et d'une page web HTTPS. La page web HTTPS discute avec Sarah/NodeJS de manière bidirectionelle:
- elle renvoie à Sarah/NodeJS ce que Google a pu déchiffrer, ainsi que l'indice de confiance de la reconnaissance Google
- elle reçoit de Sarah les phrases qu'elle est en train de prononcer et surligne les mots qu'elle prononce. En même temps un petit visage constitué de smileys s'anime.

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
- `microOFF(callback)`: fonction appelant `nircmd` pour éteindre le micro. C'est notamment utile pendant que Sarah parle afin que Google n'interprète pas ce que dit Sarah. Cette fonction est déjà appelée par `ScribeSpeak  et `ScribeAskMe`, il n'est donc pas nécessaire de l'appeler lorsqu'on utilise ces deux fonctions-là. Peut appeler une fonction `callback` (optionelle).
- `microON(callback)`: fonction appelant `nircmd` pour allumer le micro. Fonction `callback` en option.
- `SarahEcoute(true|false, callback)`: cette fonction permet de rendre sourde Sarah si on passe `false` en paramètre. Pour rétablir l'écoute de Sarah, on passe `true`. Cette fonction est très utile quand on désire ne traiter QUE la reconnaissance Google tout en empêchant Sarah d'exécuter la moindre grammaire. Cette fonction est déjà appelée par `ScribeAskMe`. Fonction `callback` en option.
**Attention** en v4, cette fonction ne rend pas réellement Sarah sourde, mais change le `context` des grammaires à `rien` pour éviter qu'elle ne réagisse aux grammaires, puis à `default` pour rétablir son écoute. Cela signifie donc qu'on dépend aussi du `ctxTimeOut` dans le `custom.ini`
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

Options de configuration du plugin
----------------------------------
Depuis l'interface serveur de Sarah
- `ports_https`: Choix du port https (par défaut 4300)
- `autorun_browser`: Permet de lancer Chrome automatiquement au démarrage de Sarah sur la page du serveur
- `kill_broswer_on_startup`: Si `autorun_browser` est `true`, ce paramètre permet de tuer toute autre fenêtre Chrome déjà ouverte
- `maxReco`: nombre de reconnaissances vocales à stocker dans le paramètre `lastX` du Scribe (voir plus haut)
- `speak_surcharge`: `true` ou `false` (défaut). Permet de surcharger la fonction `SARAH.speak()` pour qu'elle utilise systématiquement les fonctionnalités de `ScribeSpeak()`. Expérimental. Plus vraiment testé/vérifié depuis un bail. De toutes façons la surcharge ne fonctionne pas avec les `out.action._attributes.tts` qui sont dans les grammaires XML donc ca reste bancal.

Les paramètres suivants permettent de régler le temps en millisecondes qu'il faut à Sarah pour prononcer une lettre ou un chiffre, le temps de pause qu'elle met après une virgule, un point d'interrogation, etc. A régler selon la voix que vous utilisez. Les préréglages fonctionnent de manière satisfaisante avec la voix de Hortense (Microsoft):
- `pause_par_lettre`: 56
- `pause_virgule`: 500
- `pause_exclamation`: 600
- `pause_interrogation": 600
- `pause_point_virgule`: 250
- `pause_deux_points`: 250
- `pause_trois_petits_points`: 0
- `pause_point`: 1250
- `pause_par_chiffre`: 300
- `pause_minimale_avant_synthese`: 800

Enfin, ce dernier paramètre permet de faire dire à Sarah toute une série de phrase au démarrage pour vous aider à régler les différents timings précédemment cités.
- `tests_vocaux`: `false` (défaut) ou `true`


Créer un plugin qui utilise les fonctionnalités du Scribe
---------------------------------------------------------
Utilisez `ScribeSpeak()` et `ScribeAskMe()` pour vocaliser et attendre des réponses tout en rendant Sarah sourde et en coupant le micro au bon moment.

N'utilisez donc plus `SARAH.speak()` sinon Google vous entendra (ou alors utilisez `microOFF()` pour couper le micro).

N'utilisez plus non plus `callback({tts: 'texte à dire'})` car cela ne coupe pas le micro. Utilisez plutôt:
```javascript
ScribeSpeak("texte à dire", function() {
	callback();
});
```

Evitez le tts directement dans la grammaire XML (`out.action._attributes.tts`) puisqu'à nouveau c'est Sarah qui parle directement sans couper le micro.