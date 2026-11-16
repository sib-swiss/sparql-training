# ID Mapper : retrouver les identifiants cross-base

## Contexte

Vous disposez d'une liste d'identifiants provenant de **bases de données différentes**, tous censés désigner de l'*alanine* sous différentes formes. L'objectif est de les soumettre à MetaNetX pour voir comment ils sont regroupés. Pour cela, vous pouvez utiliser l'ID-mapper disponible sur le site web [https://www.metanetx.org/map/ids](https://www.metanetx.org/map/ids).

## Identifiants d'entrée

- `chebi:16449` (alanine, générique)
- `chebi:32439` (alaninate)
- `chebi:66916` (alanine zwitterion)
- `chebi:143534` (alanine, autre entrée ChEBI)
- `chebi:132498` (alanine, autre entrée ChEBI)
- `chebi:32440` (alaninium)
- `hmdb:HMDB0062251` (alanine, HMDB)
- `keggC:C01401` (alanine, KEGG générique)

## Requête SPARQL - mapping vers MetaNetX

La stratégie : un seul appel avec un bloc `VALUES` qui injecte tous les identifiants. MetaNetX stocke les références croisées via `mnx:chemXref`, dont l'objet porte l'identifiant externe dans son `rdfs:label`. Cette requête peut aussi être soumise dans l'éditeur SPARQL disponible sur le site web [https://rdf.metanetx.org/](https://rdf.metanetx.org/).

```turtle fixture=metanetx-ex1 title="Alanine (MetaNetX, extrait de données réelles)"
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix mnx: <https://rdf.metanetx.org/schema/> .
@prefix chem: <https://rdf.metanetx.org/chem/> .
@prefix obo: <http://purl.obolibrary.org/obo/> .
@prefix hmdb: <https://identifiers.org/hmdb:> .
@prefix keggc: <https://www.genome.jp/kegg/> .

chem:MNXM733981
	rdfs:label "MNXM733981" ;
	rdfs:comment "alanine" ;
	mnx:inchikey "QNAYBMKLOCPYGJ-UHFFFAOYSA-N" ;
	mnx:chemXref obo:CHEBI_16449, obo:CHEBI_32439, obo:CHEBI_32440, obo:CHEBI_66916,
		obo:CHEBI_132498, obo:CHEBI_143534, hmdb:HMDB0062251, keggc:C01401 .

obo:CHEBI_16449 rdfs:label "chebi:16449" .
obo:CHEBI_32439 rdfs:label "chebi:32439" .
obo:CHEBI_32440 rdfs:label "chebi:32440" .
obo:CHEBI_66916 rdfs:label "chebi:66916" .
obo:CHEBI_132498 rdfs:label "chebi:132498" .
obo:CHEBI_143534 rdfs:label "chebi:143534" .
hmdb:HMDB0062251 rdfs:label "hmdb:HMDB0062251" .
keggc:C01401 rdfs:label "keggC:C01401" .
```

```sparql fixture=metanetx-ex1
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

## Résultats

Les 8 identifiants soumis pointent tous vers le même ensemble `MNXM733981`.

```note
Identifiants soumis : 8. Entités MNX distinctes : 1.
```

### Questions de réflexion

1. Combien d'entités MetaNetX distinctes correspondent aux 8 identifiants ?
2. Plusieurs identifiants pointent vers le **même ensemble MNX** - lesquels ? Qu'est-ce que cela implique pour un jeu de données qui contiendrait ces deux identifiants comme features séparées ?
3. L'identifiant `chebi:66916` (*alanine zwitterion*) et `chebi:16449` (*alanine*) sont-ils dans le même ensemble ? Pourquoi ou pourquoi pas ?
