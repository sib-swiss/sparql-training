# Relations isomères : du générique au spécifique

## Contexte

MetaNetX distingue les entités **génériques** (ex. *alanine* sans stéréochimie) des entités **stéréochimiquement spécifiques** (*L-alanine*, *D-alanine*). La relation `mnx:chemIsom` pointe d'un ensemble générique vers ses isomères spécifiques.

```note
Pourquoi c'est important pour la qualité des données ? Si votre jeu de données contient à la fois l'*alanine* générique et la *L-alanine* dans des colonnes séparées, vous avez potentiellement une redondance - mais ce ne sont pas non plus exactement le même composé. Il faut savoir lequel vous avez réellement mesuré.
```

Mappez la liste des identifiants d'alanine à l'aide du mappeur d'identifiants MetaNetX ou de l'éditeur SPARQL, puis examinez les résultats. Ensuite, récupérez les ensembles de référence MNX associés aux identifiants d'alanine et analysez leurs relations d'isomérie.

Dans le graphe de connaissances MetaNetX, les relations d'isomérie entre entités chimiques sont représentées par le prédicat `mnx:chemIsom`.

## Identifiants d'entrée - liste complète famille alanine

Alanine plate (générique) :

- `chebi:16449`, `chebi:32439`, `chebi:66916`, `chebi:143534`, `chebi:132498`, `chebi:32440`, `hmdb:HMDB0062251`, `keggC:C01401`

L-alanine :

- `chebi:16977`, `chebi:57972`, `chebi:229589`, `chebi:32431`, `chebi:76050`, `chebi:32432`, `keggD:D00012`, `keggC:C00041`, `biggM:ala__L`, `hmdb:HMDB0000161`, `sabiorkM:67`, `seedM:cpd00035`, `vmhM:ala_L`, `metacycM:L-ALPHA-ALANINE`

D-alanine :

- `chebi:57416`, `chebi:32435`, `chebi:15570`, `chebi:32436`, `biggM:ala__D`, `hmdb:HMDB0001310`, `sabiorkM:1940`, `keggC:C00133`, `seedM:cpd00117`, `vmhM:ala_D`, `metacycM:D-ALANINE`

## Requête SPARQL avec relation isomère

```turtle fixture=metanetx-ex2 title="Alanine et glucose 6-phosphate (MetaNetX, extrait de données réelles)"
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix mnx: <https://rdf.metanetx.org/schema/> .
@prefix chem: <https://rdf.metanetx.org/chem/> .
@prefix obo: <http://purl.obolibrary.org/obo/> .
@prefix bigg: <http://bigg.ucsd.edu/universal/metabolites/> .
@prefix hmdb: <https://identifiers.org/hmdb:> .
@prefix vmh: <https://vmh.life/#metabolite/> .
@prefix keggc: <https://www.genome.jp/kegg/> .
@prefix keggd: <https://www.genome.jp/kegg/drug/> .
@prefix seed: <https://modelseed.org/biochem/compounds/> .

# - - - - - - - - - - - - - - - - - - - - - - - - - - -
# Alanine : un ensemble générique, deux isomères stéréospécifiques
# - - - - - - - - - - - - - - - - - - - - - - - - - - -

chem:MNXM733981
	rdfs:label "MNXM733981" ;
	rdfs:comment "alanine" ;
	mnx:inchikey "QNAYBMKLOCPYGJ-UHFFFAOYSA-N" ;
	mnx:chemXref obo:CHEBI_16449, obo:CHEBI_32439, obo:CHEBI_32440, obo:CHEBI_66916,
		obo:CHEBI_132498, obo:CHEBI_143534, hmdb:HMDB0062251, keggc:C01401 ;
	mnx:chemIsom chem:MNXM1105731, chem:MNXM1105732 .

chem:MNXM1105731
	rdfs:label "MNXM1105731" ;
	rdfs:comment "D-alanine" ;
	mnx:inchikey "QNAYBMKLOCPYGJ-UWTATZPHSA-N" ;
	mnx:chemXref obo:CHEBI_15570, obo:CHEBI_32435, obo:CHEBI_32436, obo:CHEBI_57416,
		bigg:ala__D, vmh:ala_D, hmdb:HMDB0001310, keggc:C00133, seed:cpd00117,
		<https://biocyc.org/compound?id=D-ALANINE>, <https://sabiork.h-its.org/newSearch?q=1940> .

chem:MNXM1105732
	rdfs:label "MNXM1105732" ;
	rdfs:comment "L-alanine" ;
	mnx:inchikey "QNAYBMKLOCPYGJ-REOHCLBHSA-N" ;
	mnx:chemXref obo:CHEBI_16977, obo:CHEBI_32431, obo:CHEBI_32432, obo:CHEBI_57972,
		obo:CHEBI_76050, obo:CHEBI_229589, bigg:ala__L, vmh:ala_L, hmdb:HMDB0000161,
		keggc:C00041, keggd:D00012, seed:cpd00035,
		<https://biocyc.org/compound?id=L-ALPHA-ALANINE>, <https://sabiork.h-its.org/newSearch?q=67> .

obo:CHEBI_15570 rdfs:label "chebi:15570" .
obo:CHEBI_16449 rdfs:label "chebi:16449" .
obo:CHEBI_16977 rdfs:label "chebi:16977" .
obo:CHEBI_32431 rdfs:label "chebi:32431" .
obo:CHEBI_32432 rdfs:label "chebi:32432" .
obo:CHEBI_32435 rdfs:label "chebi:32435" .
obo:CHEBI_32436 rdfs:label "chebi:32436" .
obo:CHEBI_32439 rdfs:label "chebi:32439" .
obo:CHEBI_32440 rdfs:label "chebi:32440" .
obo:CHEBI_57416 rdfs:label "chebi:57416" .
obo:CHEBI_57972 rdfs:label "chebi:57972" .
obo:CHEBI_66916 rdfs:label "chebi:66916" .
obo:CHEBI_76050 rdfs:label "chebi:76050" .
obo:CHEBI_132498 rdfs:label "chebi:132498" .
obo:CHEBI_143534 rdfs:label "chebi:143534" .
obo:CHEBI_229589 rdfs:label "chebi:229589" .
bigg:ala__D rdfs:label "biggM:ala__D" .
bigg:ala__L rdfs:label "biggM:ala__L" .
vmh:ala_D rdfs:label "vmhM:ala_D" .
vmh:ala_L rdfs:label "vmhM:ala_L" .
hmdb:HMDB0000161 rdfs:label "hmdb:HMDB0000161" .
hmdb:HMDB0001310 rdfs:label "hmdb:HMDB0001310" .
hmdb:HMDB0062251 rdfs:label "hmdb:HMDB0062251" .
keggc:C00041 rdfs:label "keggC:C00041" .
keggc:C00133 rdfs:label "keggC:C00133" .
keggc:C01401 rdfs:label "keggC:C01401" .
keggd:D00012 rdfs:label "keggD:D00012" .
seed:cpd00035 rdfs:label "seedM:cpd00035" .
seed:cpd00117 rdfs:label "seedM:cpd00117" .
<https://biocyc.org/compound?id=D-ALANINE> rdfs:label "metacycM:D-ALANINE" .
<https://biocyc.org/compound?id=L-ALPHA-ALANINE> rdfs:label "metacycM:L-ALPHA-ALANINE" .
<https://sabiork.h-its.org/newSearch?q=67> rdfs:label "sabiorkM:67" .
<https://sabiork.h-its.org/newSearch?q=1940> rdfs:label "sabiorkM:1940" .

# - - - - - - - - - - - - - - - - - - - - - - - - - - -
# Glucose 6-phosphate : une famille plus dense - anomères et
# états de protonation, pas une simple paire générique/spécifique
# - - - - - - - - - - - - - - - - - - - - - - - - - - -

chem:MNXM10656
	rdfs:label "MNXM10656" ;
	rdfs:comment "alpha-D-Hexose 6-phosphate" ;
	mnx:chemXref obo:CHEBI_178383 ;
	mnx:chemIsom chem:MNXM1103987, chem:MNXM1105855, chem:MNXM1364108 .

chem:MNXM729664
	rdfs:label "MNXM729664" ;
	rdfs:comment "D-hexopyranose 6-phosphate" ;
	mnx:chemXref obo:CHEBI_61567 ;
	mnx:chemIsom chem:MNXM1103551, chem:MNXM1103987, chem:MNXM1364108, chem:MNXM1364111,
		chem:MNXM16292, chem:MNXM729665 .

chem:MNXM1364111
	rdfs:label "MNXM1364111" ;
	rdfs:comment "D-glucose 6-phosphate" ;
	mnx:chemXref obo:CHEBI_61548 ;
	mnx:chemIsom chem:MNXM1105855, chem:MNXM1105856 .

chem:MNXM1103987 rdfs:label "MNXM1103987" ; rdfs:comment "alpha-D-galactose 6-phosphate" ; mnx:chemXref obo:CHEBI_47944 .
chem:MNXM1105855 rdfs:label "MNXM1105855" ; rdfs:comment "alpha-D-glucose 6-phosphate" ; mnx:chemXref obo:CHEBI_58225 .
chem:MNXM1105856 rdfs:label "MNXM1105856" ; rdfs:comment "beta-D-glucose 6-phosphate" ; mnx:chemXref obo:CHEBI_58247 .
chem:MNXM1364108 rdfs:label "MNXM1364108" ; rdfs:comment "alpha-D-mannose 6-phosphate" ; mnx:chemXref obo:CHEBI_60332 .
chem:MNXM1103551 rdfs:label "MNXM1103551" ; rdfs:comment "beta-D-mannose 6-phosphate" ; mnx:chemXref obo:CHEBI_49728 .
chem:MNXM16292 rdfs:label "MNXM16292" ; rdfs:comment "beta-D-galactose 6-phosphate" ; mnx:chemXref obo:CHEBI_41076 .
chem:MNXM729665 rdfs:label "MNXM729665" ; rdfs:comment "D-Allose 6-phosphate" ; mnx:chemXref keggc:C02962 .

obo:CHEBI_41076 rdfs:label "chebi:41076" .
obo:CHEBI_47944 rdfs:label "chebi:47944" .
obo:CHEBI_49728 rdfs:label "chebi:49728" .
obo:CHEBI_58225 rdfs:label "chebi:58225" .
obo:CHEBI_58247 rdfs:label "chebi:58247" .
obo:CHEBI_60332 rdfs:label "chebi:60332" .
obo:CHEBI_61548 rdfs:label "chebi:61548" .
obo:CHEBI_61567 rdfs:label "chebi:61567" .
obo:CHEBI_178383 rdfs:label "chebi:178383" .
keggc:C02962 rdfs:label "keggC:C02962" .
```

```sparql fixture=metanetx-ex2
PREFIX mnx:  <https://rdf.metanetx.org/schema/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT
  ?query_id ?mnx_id ?name
  ?chem_Isom_id ?chem_Isom_name
  ?inchikey
WHERE {
  VALUES ?query_id {
    # alanine plate (générique)
    "chebi:16449" "chebi:32439" "chebi:66916" "chebi:143534"
    "chebi:132498" "chebi:32440" "hmdb:HMDB0062251" "keggC:C01401"
    # L-alanine
    "chebi:16977" "chebi:57972" "chebi:229589" "chebi:32431"
    "chebi:76050" "chebi:32432" "keggD:D00012" "keggC:C00041"
    "biggM:ala__L" "hmdb:HMDB0000161" "sabiorkM:67" "seedM:cpd00035"
    "vmhM:ala_L" "metacycM:L-ALPHA-ALANINE"
    # D-alanine
    "chebi:57416" "chebi:32435" "chebi:15570" "chebi:32436"
    "biggM:ala__D" "hmdb:HMDB0001310" "sabiorkM:1940"
    "keggC:C00133" "seedM:cpd00117" "vmhM:ala_D" "metacycM:D-ALANINE"
  }

  ?mnx_chem mnx:chemXref ?xref .
  ?xref     rdfs:label   ?query_id .
  ?mnx_chem rdfs:label   ?mnx_id .

  OPTIONAL { ?mnx_chem rdfs:comment  ?name     . }
  OPTIONAL { ?mnx_chem mnx:inchikey  ?inchikey . }

  OPTIONAL {
    ?mnx_chem   mnx:chemIsom  ?chem_Isom .
    ?chem_Isom  rdfs:label    ?chem_Isom_id .
    OPTIONAL { ?chem_Isom rdfs:comment ?chem_Isom_name . }
  }
}
ORDER BY ?query_id
```

Les 31 identifiants ne résolvent qu'en 3 ensembles `MNXM` : l'alanine générique, la L-alanine et la D-alanine. Chaque ligne pour un identifiant de l'alanine générique porte aussi les deux isomères dans `chem_Isom_id` - c'est `mnx:chemIsom` qui fait son travail, en pointant de l'ensemble générique vers chacun des isomères spécifiques.

## Détection de collisions générique / spécifique

```note
Si votre jeu de données contient à la fois une entité générique (qui a des isomères) et l'un de ses isomères spécifiques, vous mélangez des niveaux de précision différents. MetaNetX permet de détecter cela automatiquement.
```

C'est exactement ce que fait la liste d'entrée ci-dessus : elle soumet les identifiants de l'alanine générique *et* ceux de la L-alanine et de la D-alanine ensemble. Vérifier cela sur les résultats le confirme - des entités génériques et leurs isomères spécifiques sont simultanément présents dans la liste d'entrée, exactement la collision que ce contrôle est censé détecter.

## Un cas plus complexe : la famille glucose 6-phosphate

Le **glucose 6-phosphate** (G6P) est un métabolite-clé de la glycolyse. En LC-MS classique, on ne distingue généralement **pas** les anomères alpha et bêta - la mesure correspond donc à un signal "générique" qu'il faut annoter prudemment. MetaNetX modélise cette famille avec plusieurs niveaux de stéréochimie **et** plusieurs états de protonation, ce qui donne un graphe nettement plus dense que celui de l'alanine.

### Identifiants d'entrée - famille G6P

- `chebi:61548`
- `chebi:58225`
- `chebi:178383`
- `chebi:47944`
- `chebi:60332`
- `chebi:61567`
- `chebi:49728`
- `chebi:41076`
- `keggC:C02962`
- `chebi:58247`

### Requête SPARQL et récupération des relations

Suivre `mnx:chemIsom` dans les deux sens à l'aide d'un chemin de propriété ("property path") permet d'extraire toute cette composante connexe en une seule requête, en partant juste des identifiants soumis ci-dessus :

```sparql fixture=metanetx-ex2
PREFIX mnx:  <https://rdf.metanetx.org/schema/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?from_id ?from_name ?to_id ?to_name
WHERE {
  VALUES ?query_id {
    "chebi:61548"
    "chebi:58225"
    "chebi:178383"
    "chebi:47944"
    "chebi:60332"
    "chebi:61567"
    "chebi:49728"
    "chebi:41076"
    "keggC:C02962"
    "chebi:58247"
  }

  # 1. Ancrage : entités MNX correspondant aux IDs soumis
  ?anchor mnx:chemXref ?xref .
  ?xref   rdfs:label   ?query_id .

  # 2. Extension transitive dans les DEUX sens (ascendants + descendants)
  ?anchor (mnx:chemIsom|^mnx:chemIsom)* ?node .

  # 3. Récupère toutes les arêtes chemIsom sortant des nœuds atteints
  ?node mnx:chemIsom ?target .

  ?node   rdfs:label ?from_id .
  ?target rdfs:label ?to_id .

  OPTIONAL { ?node   rdfs:comment ?from_name . }
  OPTIONAL { ?target rdfs:comment ?to_name   . }
}
ORDER BY ?from_id ?to_id
```

```note
`(mnx:chemIsom|^mnx:chemIsom)*` est un chemin de propriété : `^` inverse le sens d'un prédicat, `|` signifie "ou bien", et `*` signifie "zéro étape ou plus".
```

### Résultats

Le résultat est un petit graphe, pas une simple ligne : le `D-glucose 6-phosphate` se trouve entre un niveau générique (`alpha-D-hexose 6-phosphate`/`D-hexopyranose 6-phosphate`) au-dessus de lui, et ses propres anomères `alpha-` et `beta-` en dessous. Plusieurs niveaux coexistent : anomères (alpha/bêta) et états de protonation.

### Questions de réflexion

1. Combien d'entités MNX distinctes sont identifiées pour les 31 identifiants d'entrée de la famille **alanine** ?
2. Quelles entités sont **génériques** et quelles entités sont des **isomères spécifiques** ?
3. Regardez le graphe alanine : l'entité *alanine zwitterion* est-elle générique ou spécifique ?
4. Dans un jeu de données de métabolomique, si vous avez une feature annotée `chebi:16449` (alanine) et une autre `keggC:C00041` (L-alanine), quel problème cela pose-t-il ?
5. Le graphe **G6P** est nettement plus dense que celui de l'alanine - pourquoi ? À quoi correspondent les niveaux multiples observés (anomères x protonation) ?
6. En LC-MS sans dérivatisation, on annote en général un signal de G6P comme **générique** plutôt que comme alpha-D-G6P ou bêta-D-G6P. Quelle est la conséquence si l'analyste choisit par défaut `keggC:C00668` (alpha) au lieu du générique `keggC:C00092` ?
