# ID mapper: retrieving cross-database identifiers

## Context

You are given a list of identifiers from **different databases**, all supposed to represent *alanine* in different forms. The goal is to submit them to MetaNetX and observe how they are grouped. Use the MetaNetX ID-mapper available at [https://www.metanetx.org/map/ids](https://www.metanetx.org/map/ids).

## Input identifiers

- `chebi:16449`
- `chebi:32439`
- `chebi:66916`
- `chebi:143534`
- `chebi:132498`
- `chebi:32440`
- `hmdb:HMDB0062251`
- `keggC:C01401`

## SPARQL query - mapping to MetaNetX

Strategy: a single query using a `VALUES` block to inject all identifiers. MetaNetX stores cross-references via `mnx:chemXref`, where the external identifier is carried in its `rdfs:label`. This query can also be run in the SPARQL editor available at [https://rdf.metanetx.org/](https://rdf.metanetx.org/).

```turtle fixture=metanetx-ex1 title="Alanine (MetaNetX, real data extract)"
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

## Results

All 8 submitted identifiers resolve to the exact same `MNXM733981` set.

```note
Submitted identifiers: 8. Distinct MNX entities: 1.
```

### Reflection questions

1. How many distinct MetaNetX entities correspond to the 8 identifiers?
2. Several identifiers map to the **same MNX set** - which ones? What does this imply for a dataset that contains these identifiers as separate features?
3. Are the identifiers `chebi:66916` (*alanine zwitterion*) and `chebi:16449` (*alanine*) in the same set? Why or why not?
