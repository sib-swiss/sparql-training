# Application sur des données réelles

## Contexte

Vous disposez d'un fichier de features métabolomiques ([`Features_METABOLOMICS.xlsx`](https://github.com/sib-swiss/MetaNetX_metabolites_tutorial/blob/master/Features_METABOLOMICS.xlsx)). Il contient des colonnes `HMDB`, `KEGG` et `chebi_id`. L'objectif est de détecter **4 types de problèmes de qualité** fréquents en métabolomique :

| Type | Problème | Exemple dans le fichier |
|------|----------|------------------------|
| **1** | Identifiant invalide / mal formaté -> non mappé dans MNX | `Glucose_bad_id` (`HMDB00122`), `Pyruvate_typo` (`HMDB000243` + ChEBI inexistant) |
| **2** | Doublon exact : même entité MNX, annotation différente | `Ala` vs `Ala_2` |
| **3** | HMDB != KEGG -> deux entités MNX distinctes (KEGG trop générique) | `lysoPC a C16:0`, `C16:1`... partagent `C04230` |
| **4** | Générique / spécifique (relation parent-enfant via `mnx:chemIsom+`) | `Carnitine_DL` vs `C0` (L-Carnitine) |

```note
La version originale de cet exercice joint ce tableau au fichier complet ci-dessus avec un pipeline R/tidyverse complet - voir le [tutoriel original](https://github.com/sib-swiss/MetaNetX_metabolites_tutorial) pour cela. Le TYPE 4, démontré ci-dessous, est celui des quatre qui est purement SPARQL : `Carnitine_DL` et `C0` (L-carnitine) apparaissent tous deux dans ce fichier, partageant l'identifiant KEGG `C00487`.
```

## TYPE 1 - Identifiants invalides (non mappés dans MetaNetX)

```note
Un identifiant mal formaté (mauvais nombre de chiffres, préfixe incorrect, ID inexistant) ne trouve aucune correspondance dans MetaNetX. C'est la détection la plus simple, mais aussi la plus facile à corriger.
```

## TYPE 2 - Doublons exacts (même entité MNX, noms différents)

```note
Deux features sont des doublons si elles partagent le même identifiant MNX via n'importe quelle source (HMDB, KEGG ou ChEBI). Cela peut arriver quand une base de données interne contient plusieurs entrées pour le même composé avec des noms légèrement différents.
```

## TYPE 3 - Incohérences entre bases de données (entités MNX distinctes)

```note
Une feature est incohérente si deux identifiants issus de bases de données différentes (ici HMDB et KEGG) pointent vers des entités MNX différentes. Cause fréquente : le KEGG utilisé est un identifiant de classe générique (ex. `C04230` = toutes les lysophosphatidylcholines) alors que l'HMDB est spécifique à une espèce moléculaire précise.
```

## TYPE 4 - Relations parent-enfant (générique / spécifique via `mnx:chemIsom+`)

```note
Le problème le plus subtil : deux features peuvent pointer vers des entités MNX distinctes (pas de doublon direct), mais l'une est le parent générique de l'autre via la relation `mnx:chemIsom+`. Exemples typiques : *DL-carnitine* (générique) et *L-carnitine* (spécifique) ; *DL-leucine* et *L-leucine*.

La requête utilise `mnx:chemIsom+` (chemin transitif) pour détecter aussi les relations à plusieurs niveaux de profondeur.
```

```turtle fixture=metanetx-ex3 title="Carnitine (MetaNetX, extrait de données réelles)"
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix mnx: <https://rdf.metanetx.org/schema/> .
@prefix chem: <https://rdf.metanetx.org/chem/> .
@prefix obo: <http://purl.obolibrary.org/obo/> .
@prefix keggc: <https://www.genome.jp/kegg/> .

chem:MNXM731667
	rdfs:label "MNXM731667" ;
	rdfs:comment "carnitine" ;
	mnx:chemXref keggc:C00487 ;
	mnx:chemIsom chem:MNXM1105737 .

chem:MNXM1105737 rdfs:label "MNXM1105737" ; rdfs:comment "(R)-carnitine" ; mnx:chemXref obo:CHEBI_16347 .

keggc:C00487 rdfs:label "keggC:C00487" .
obo:CHEBI_16347 rdfs:label "chebi:16347" .
```

```sparql fixture=metanetx-ex3
PREFIX mnx:  <https://rdf.metanetx.org/schema/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?parent_id ?parent_name ?child_id ?child_name
WHERE {
  # Représente ici "tous les identifiants de votre jeu de données" - comparé à lui-même
  VALUES ?chem_parent { "keggC:C00487" "chebi:16347" }
  VALUES ?chem_child  { "keggC:C00487" "chebi:16347" }

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

`Carnitine_DL` (`keggC:C00487`, *carnitine* générique) et `C0` (`chebi:16347`, l'isomère spécifique étiqueté *(R)-carnitine* dans MetaNetX - la L-carnitine en clinique) sont dans des ensembles MNX différents, liés par `mnx:chemIsom+` : exactement une relation de TYPE 4.

### Questions de réflexion

1. **TYPE 1** - `HMDB00122` est mal formaté. Quel est le bon identifiant ? Comment éviter ce type d'erreur lors de la construction d'une base de données interne ?
2. **TYPE 2** - `Ala` et `Ala_2` pointent vers la même entité MNX. Comment ce doublon pourrait-il biaiser une analyse différentielle si on ne le détecte pas ?
3. **TYPE 3** - Plusieurs lysoPC partagent le KEGG `C04230`. Pourquoi KEGG utilise-t-il un seul identifiant pour toutes ces espèces ? Quelle base de données (HMDB ou KEGG) est préférable pour les lipides complexes ?
4. **TYPE 4** - `Carnitine_DL` et `C0` (L-Carnitine) ont le même KEGG `C00487`. Après le mapping MetaNetX, sont-ils dans le même ensemble MNX ou dans des ensembles liés par `chemIsom+` ? Quelle différence cela fait-il pour une analyse biologique ?

## Synthèse - bonnes pratiques d'identification

D'après les slides du cours (Florence Mehl / SIB) et les exercices :

1. **Distinguer le métabolite (ensemble) de la molécule chimique (individu).** Un métabolite dans un réseau métabolique est un *ensemble* de molécules - ne pas confondre avec un composé chimique individuel (ex. un étalon de laboratoire).
2. **N'utiliser que des identifiants où nom et structure sont cohérents.** Vérifier la stéréochimie. Préférer des bases qui fournissent les deux.
3. **Spécifier le contexte de validité.** Un identifiant est valide pour une méthode analytique, un organisme, un biofluide donnés.
4. **Désigner un identifiant de référence et le ranger par confiance.** Ne pas fournir un sac d'identifiants imprécis : une courte liste ordonnée vaut mieux.
5. **Ne pas utiliser les identifiants MNXM comme identifiants stables.** Ils ne sont pas stables entre releases. Utiliser les représentants des ensembles (ChEBI, HMDB...).
6. **Ne jamais mélanger entités génériques et isomères spécifiques.** `chebi:16449` (alanine) != `chebi:16977` (L-alanine) - même s'ils partagent un parent MNX.

## Documentation

1. [Introduction à SPARQL](https://sib-swiss.github.io/SPARQL_course/)
2. [Publications MetaNetX](https://www.metanetx.org/mnxdoc/cite.html)
3. Ce tutoriel est adapté de l'atelier R/Quarto original de Florence Mehl (SIB) : [MetaNetX_metabolites_tutorial](https://github.com/sib-swiss/MetaNetX_metabolites_tutorial)
