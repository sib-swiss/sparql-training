# Identification des métabolites avec MetaNetX

Les bases de données métaboliques décrivent les métabolites comme des substrats et des produits de réactions biochimiques, mais une même molécule réelle peut se retrouver sous des dizaines d'identifiants différents selon la base de données qui l'a produite. [MetaNetX](https://www.metanetx.org/) remet de l'ordre dans tout ça : il regroupe les identifiants de KEGG, ChEBI, HMDB, BiGG, SEED, VMH, MetaCyc, Rhea et SABIO-RK en **ensembles** d'entités chimiques équivalentes, sur la base de la structure, du contexte réactionnel, des références croisées et des noms. Chaque ensemble reçoit un identifiant `MNXM`.

```note
Les identifiants `MNXM` sont utiles pour la curation, mais ils ne sont **pas stables** d'une version de MetaNetX à l'autre - ne les utilisez pas comme identifiant persistant dans vos propres données. Gardez l'identifiant de la base source (ChEBI, HMDB, ...) comme ce que vous stockez réellement, et utilisez MetaNetX pour faire la réconciliation à la demande.
```

## Les données d'exemple

Chaque requête de cette page s'exécute sur le jeu de données ci-dessous - un petit extrait réel de trois familles tirées directement du graphe de production de MetaNetX : l'alanine, le glucose 6-phosphate et la carnitine, chacune avec juste assez de ses références croisées et de ses relations `mnx:chemIsom` pour que chaque requête ci-dessous renvoie exactement ce qu'elle renverrait sur les données réelles. Il est modifiable : changez-le, puis relancez n'importe quelle requête plus bas sur la page. Si vous préférez exécuter ces requêtes sur le jeu de données complet et réel de MetaNetX, son point d'accès SPARQL public est [rdf.metanetx.org/sparql](https://rdf.metanetx.org/sparql).

```turtle fixture=metanetx title="Alanine, glucose 6-phosphate et carnitine (MetaNetX, extrait de données réelles)"
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

# - - - - - - - - - - - - - - - - - - - - - - - - - - -
# Carnitine : une paire générique/spécifique, utilisée plus bas pour
# montrer comment ce motif apparaît comme une collision dans une liste de features
# - - - - - - - - - - - - - - - - - - - - - - - - - - -

chem:MNXM731667
	rdfs:label "MNXM731667" ;
	rdfs:comment "carnitine" ;
	mnx:chemXref obo:CHEBI_17126 ;
	mnx:chemIsom chem:MNXM1105737 .

chem:MNXM1105737 rdfs:label "MNXM1105737" ; rdfs:comment "(R)-carnitine" ; mnx:chemXref obo:CHEBI_16347 .

obo:CHEBI_16347 rdfs:label "chebi:16347" .
obo:CHEBI_17126 rdfs:label "chebi:17126" .
```

## Faire correspondre des identifiants entre bases de données

Au sein d'un ensemble, les entités chimiques reliées par `mnx:chemXref` sont considérées comme équivalentes - une réaction spontanée comme un équilibre acido-basique ou une tautomérie pourrait les interconvertir en solution. MetaNetX stocke chaque identifiant externe comme le `rdfs:label` d'un petit nœud de référence croisée (`mnx:chemXref`), qui pointe en retour vers l'entité `MNXM` à laquelle il appartient.

Imaginez qu'on vous donne une liste d'identifiants provenant de différentes bases de données, tous censés représenter de l'*alanine* sous une forme ou une autre. Une seule requête avec un bloc `VALUES` peut les soumettre tous en une fois et montrer comment MetaNetX les regroupe réellement - exactement ce que fait l'[ID mapper de MetaNetX](https://www.metanetx.org/map/ids) via un formulaire web.

```sparql fixture=metanetx
PREFIX mnx:  <https://rdf.metanetx.org/schema/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?query_id ?mnx_id ?name ?inchikey
WHERE {
  VALUES ?query_id {
    "chebi:16449"
    "chebi:32439"
    "chebi:66916"
    "chebi:143534"
    "chebi:132498"
    "chebi:32440"
    "hmdb:HMDB0062251"
    "keggC:C01401"
  }

  ?mnx_chem mnx:chemXref ?xref .
  ?xref     rdfs:label   ?query_id .
  ?mnx_chem rdfs:label   ?mnx_id .

  OPTIONAL { ?mnx_chem rdfs:comment  ?name     . }
  OPTIONAL { ?mnx_chem mnx:inchikey  ?inchikey . }
}
ORDER BY ?mnx_id
```

Les 8 identifiants - 6 termes ChEBI, un terme HMDB et un terme KEGG - convergent tous vers le même ensemble `MNXM733981`. Si un jeu de données les traitait comme 8 features distinctes au lieu de reconnaître qu'il s'agit d'un seul métabolite, toute analyse comptant ou comparant des métabolites serait fausse avant même d'avoir commencé.

## Entités génériques et leurs stéréoisomères

MetaNetX distingue les entités **génériques** (l'*alanine* simple, sans stéréochimie précisée) des entités **stéréochimiquement spécifiques** (*L-alanine*, *D-alanine*). Cette relation est portée par un autre prédicat, `mnx:chemIsom`, qui pointe d'un ensemble générique vers chacun de ses isomères spécifiques.

C'est important pour la qualité des données : si un jeu de données contient à la fois l'*alanine* générique et la *L-alanine* comme features séparées, ce n'est pas exactement un doublon - elles sont liées, mais pas identiques - et il importe de savoir laquelle a réellement été mesurée. En étendant la liste d'identifiants ci-dessus à toute la famille alanine (générique, L- et D-) et en suivant `mnx:chemIsom` en plus de `mnx:chemXref`, on voit directement la relation :

```sparql fixture=metanetx
PREFIX mnx:  <https://rdf.metanetx.org/schema/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT
  ?query_id ?mnx_id ?name
  ?chem_Isom_id ?chem_Isom_name
  ?inchikey
WHERE {
  VALUES ?query_id {
    # alanine, sans stéréochimie (générique)
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

### Un cas plus dense : le glucose 6-phosphate

Le glucose 6-phosphate (G6P) illustre bien pourquoi ce n'est pas toujours une simple paire générique/spécifique. En LC-MS classique, les anomères alpha et bêta ne sont généralement pas distingués, donc une mesure correspond en réalité à un signal générique - mais MetaNetX suit en plus plusieurs états de protonation, ce qui fait que le graphe de relations réel de cette famille est plus dense qu'une simple arête générique-vers-isomère.

Suivre `mnx:chemIsom` dans les deux directions avec un chemin de propriété ("property path") permet d'extraire toute cette composante connexe en une seule requête, en partant juste des identifiants qu'on a sous la main :

```sparql fixture=metanetx
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

  # Ancrage : entités MNX correspondant aux identifiants soumis
  ?anchor mnx:chemXref ?xref .
  ?xref   rdfs:label   ?query_id .

  # Parcourt mnx:chemIsom dans les deux directions pour atteindre toute la famille
  ?anchor (mnx:chemIsom|^mnx:chemIsom)* ?node .

  # Puis liste chaque arête chemIsom sortant de chaque nœud ainsi atteint
  ?node mnx:chemIsom ?target .

  ?node   rdfs:label ?from_id .
  ?target rdfs:label ?to_id .

  OPTIONAL { ?node   rdfs:comment ?from_name . }
  OPTIONAL { ?target rdfs:comment ?to_name   . }
}
ORDER BY ?from_id ?to_id
```

```note
`(mnx:chemIsom|^mnx:chemIsom)*` est un chemin de propriété : `^` inverse le sens d'un prédicat, `|` signifie "ou bien", et `*` signifie "zéro étape ou plus". Ensemble, ils permettent de partir de n'importe quel nœud de départ et d'atteindre tous les autres nœuds reliés à lui par des arêtes `chemIsom`, dans les deux sens - c'est exactement comme ça qu'on atteint des "cousins" ou des "frères", pas seulement les parents ou enfants directs.
```

Le résultat est un petit graphe, pas une simple ligne : le `D-glucose 6-phosphate` se trouve entre un niveau générique (`alpha-D-hexose 6-phosphate`/`D-hexopyranose 6-phosphate`) au-dessus de lui, et ses propres anomères `alpha-` et `beta-` en dessous. Si une analyse annote par défaut tout signal de G6P comme l'anomère alpha simplement parce que c'est l'identifiant qu'on avait sous la main, elle efface silencieusement le fait que la mesure ne pouvait en réalité pas distinguer les anomères.

## Les collisions générique/spécifique se cachent dans de vraies listes de features

La même relation `mnx:chemIsom` permet aussi de détecter un problème de qualité des données bien précis dans vos propres listes d'identifiants : un jeu de données qui liste à la fois une entité générique et l'un de ses isomères spécifiques comme s'il s'agissait de deux métabolites indépendants. `mnx:chemIsom+` (un ou plusieurs niveaux, pour attraper aussi les relations à plusieurs niveaux de profondeur) trouve exactement ces paires, à partir des identifiants effectivement présents dans un jeu de données :

```sparql fixture=metanetx
PREFIX mnx:  <https://rdf.metanetx.org/schema/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?parent_id ?parent_name ?child_id ?child_name
WHERE {
  # Représente ici "tous les identifiants de votre jeu de données" - comparé à lui-même
  VALUES ?chem_parent { "chebi:17126" "chebi:16347" }
  VALUES ?chem_child  { "chebi:17126" "chebi:16347" }

  ?mnxm_parent mnx:chemXref/rdfs:label ?chem_parent .
  ?mnxm_child  mnx:chemXref/rdfs:label ?chem_child .
  ?mnxm_parent mnx:chemIsom+ ?mnxm_child .

  ?mnxm_parent rdfs:label ?parent_id .
  ?mnxm_child  rdfs:label ?child_id .
  FILTER(?parent_id != ?child_id)

  OPTIONAL { ?mnxm_parent rdfs:comment ?parent_name }
  OPTIONAL { ?mnxm_child  rdfs:comment ?child_name }
}
```

`chebi:17126` est la *carnitine* générique, et `chebi:16347` est l'un de ses isomères spécifiques - donc une table de features qui contient les deux sous des noms différents a en réalité une mesure générique et une mesure spécifique, pas deux métabolites indépendants. Appliquez les deux mêmes listes `VALUES` à toutes les paires d'identifiants d'une vraie table de features, et c'est exactement comme ça qu'on fait émerger cette classe de problème à grande échelle - la même méthode que les ateliers MetaNetX ont utilisée sur de vraies listes de features de métabolomique non ciblée.

```note
Une vraie table de features fait apparaître plus que ce seul motif. Autres problèmes courants : des identifiants simplement malformés ou absents de MetaNetX, des doublons exacts où deux features pointent vers le même ensemble `MNXM` sous des noms différents, et des désaccords où deux colonnes d'identifiants pour une même feature (disons HMDB et KEGG) résolvent vers deux ensembles *différents* - souvent parce que l'identifiant KEGG désigne une classe plus large que l'identifiant HMDB. Tous ces cas sont des variantes de la même jointure montrée ci-dessus : faire correspondre chaque identifiant à son ensemble `MNXM`, puis comparer les ensembles plutôt que les identifiants bruts.
```

## Bonnes pratiques pour l'identification des métabolites

Quelques habitudes font la différence entre des identifiants qui tiennent la route et d'autres qui corrompent silencieusement une analyse plus tard :

1. Un métabolite est un **ensemble** d'entités chimiques équivalentes, pas un composé physique unique - ne le confondez pas avec un simple étalon de laboratoire.
2. Vérifiez la stéréochimie avant de faire confiance à une correspondance d'identifiants ; préférez les bases sources qui l'enregistrent explicitement.
3. La validité d'un identifiant dépend du contexte : la méthode analytique, l'organisme, le biofluide.
4. Gardez un seul identifiant de référence, classé par confiance, plutôt qu'un sac d'identifiants vaguement liés.
5. Ne faites pas des identifiants `MNXM` des clés stables - ils peuvent changer d'une version de MetaNetX à l'autre.
6. Ne fusionnez jamais silencieusement une entité générique avec l'un de ses isomères spécifiques, même s'ils partagent un même parent `MNXM` via `mnx:chemIsom`.

## Pour aller plus loin

- [MetaNetX](https://www.metanetx.org/), son [point d'accès SPARQL](https://rdf.metanetx.org/) et son [ID mapper](https://www.metanetx.org/map/ids)
- [Publications MetaNetX](https://www.metanetx.org/mnxdoc/cite.html)
- [Introduction à SPARQL](https://sib-swiss.github.io/SPARQL_course/)
- Cette page est adaptée d'un atelier R/Quarto plus complet de Florence Mehl (SIB), qui va aussi plus loin en l'appliquant à un vrai fichier de features de métabolomique - voir le [tutoriel original](https://github.com/sib-swiss/MetaNetX_metabolites_tutorial/blob/master/MetaNetX_metabolites_fr.qmd)
