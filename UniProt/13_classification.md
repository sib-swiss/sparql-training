# GO terms & keywords

UniProt classifies proteins two ways with the same predicate, `up:classifiedWith`: against [Gene Ontology (GO)](https://geneontology.org/) terms, and against UniProt's own controlled-vocabulary [keywords](https://www.uniprot.org/keywords/). Both kinds of term end up as objects of the very same triple pattern, so queries that only want one or the other need to filter by which namespace the term's IRI belongs to &mdash; GO terms live under `http://purl.obolibrary.org/obo/GO_`, UniProt keywords under `http://purl.uniprot.org/keywords/`. Or that GO terms are [owl classes](http://www.w3.org/2002/07/owl#Class) and Keywords a `up:Concept`.

The queries on this page are adapted from the [sparql-examples](https://github.com/sib-swiss/sparql-examples) collection of real, curated UniProt SPARQL queries.

## GO term labels for a protein, grouped by category

GO terms themselves form a hierarchy with three top-level branches: `GO:0008150` (biological_process), `GO:0005575` (cellular_component) and `GO:0003674` (molecular_function). Given a couple of accessions, this groups each protein's GO terms into those three categories using `rdfs:subClassOf` and `OPTIONAL`, then `GROUP_CONCAT`s the labels in each category together.

```turtle fixture=go-categories
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix GO: <http://purl.obolibrary.org/obo/GO_>
prefix owl: <http://www.w3.org/2002/07/owl#>

<Q6GZX4> a up:Protein ;
  up:classifiedWith GO:0046782, GO:0016032 .

<Q96375> a up:Protein ;
  up:classifiedWith GO:0005634, GO:0003677 .

GO:0008150 a owl:Class ; rdfs:label "biological_process" .
GO:0005575 a owl:Class ; rdfs:label "cellular_component" .
GO:0003674 a owl:Class ; rdfs:label "molecular_function" .

GO:0046782 a owl:Class ;
  rdfs:subClassOf GO:0008150 ;
  rdfs:label "regulation of viral transcription" .
GO:0016032 a owl:Class ;
  rdfs:subClassOf GO:0008150 ;
  rdfs:label "viral process" .
GO:0005634 a owl:Class ;
  rdfs:subClassOf GO:0005575 ;
  rdfs:label "nucleus" .
GO:0003677 a owl:Class ;
  rdfs:subClassOf GO:0003674 ;
  rdfs:label "DNA binding" .
```

```sparql fixture=go-categories
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX GO:<http://purl.obolibrary.org/obo/GO_>

SELECT
    (CONCAT(SUBSTR(STR(?protein), 33)) AS ?uniprot)
    (GROUP_CONCAT(?celtype; separator=";") AS ?celtypes)
    (GROUP_CONCAT(?biotype; separator=";") AS ?biotypes)
    (GROUP_CONCAT(?moltype; separator=";") AS ?moltypes)
WHERE
{
    VALUES (?ac) {("Q6GZX4") ("Q96375")}
    BIND (IRI(CONCAT("http://purl.uniprot.org/uniprot/",?ac)) AS ?protein)
    ?protein a up:Protein .
    ?protein up:classifiedWith ?goTerm .
    #Determine if the type is biological_process
    OPTIONAL {
        ?goTerm rdfs:subClassOf GO:0008150 .
        ?goTerm rdfs:label ?biotype .
    }
    #Determine if the type is cellular_component
    OPTIONAL {
        ?goTerm rdfs:subClassOf GO:0005575 .
        ?goTerm rdfs:label ?celtype .
    }
    #Determine if the type is molecular_function
    OPTIONAL {
        ?goTerm rdfs:subClassOf GO:0003674 .
        ?goTerm rdfs:label ?moltype .
    }
    #Filter out the uniprot keywords
    FILTER(bound(?biotype) || bound(?celtype) || bound(?moltype))
} GROUP BY ?protein
```

The `SUBSTR(STR(?protein), 33)` trick turns the full protein IRI back into a bare accession for display &mdash; `http://purl.uniprot.org/uniprot/` is exactly 32 characters long, so character 33 onward is the accession.

## Reviewed human proteins for a GO term

The reverse direction: given a GO term, find every reviewed human protein annotated with it &mdash; the classic starting point for building an enrichment-analysis gene set.

```turtle fixture=go-reverse-lookup
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix taxon: <http://purl.uniprot.org/taxonomy/>
prefix GO: <http://purl.obolibrary.org/obo/GO_>

<P05067> a up:Protein ;
  up:organism taxon:9606 ;
  up:reviewed true ;
  up:classifiedWith GO:0006915 .

<Q07812> a up:Protein ;
  up:organism taxon:9606 ;
  up:reviewed true ;
  up:classifiedWith GO:0006915 .

<A0A024R000> a up:Protein ;
  up:organism taxon:9606 ;
  up:reviewed false ;
  up:classifiedWith GO:0006915 .
```

```sparql fixture=go-reverse-lookup
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>
PREFIX GO: <http://purl.obolibrary.org/obo/GO_>

SELECT ?protein
WHERE {
  # GO:0006915 is "apoptotic process"
  ?protein a up:Protein ;
    up:organism taxon:9606 ;
    up:reviewed true ;
    up:classifiedWith GO:0006915 .
}
```

Notice the unreviewed (TrEMBL) entry doesn't show up &mdash; `up:reviewed true` restricts this to UniProtKB/Swiss-Prot only.

## Batch GO annotation lookup by mnemonic

A common pattern: you have a batch of UniProt mnemonic identifiers (entry names, e.g. `MTMR1_HUMAN`) rather than accessions, and want each one's GO annotations in a single round trip &mdash; the SPARQL equivalent of a biomaRt batch lookup, using `VALUES` instead of `getBM()`.

```turtle fixture=go-batch-mnemonic
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix GO: <http://purl.obolibrary.org/obo/GO_>
prefix keywords: <http://purl.uniprot.org/keywords/>

<P17706> a up:Protein ;
  up:mnemonic "MTMR1_HUMAN" ;
  up:classifiedWith GO:0004725, keywords:686 .

<P04637> a up:Protein ;
  up:mnemonic "P53_HUMAN" ;
  up:classifiedWith GO:0006915 .

<P01308> a up:Protein ;
  up:mnemonic "INS_HUMAN" ;
  up:classifiedWith GO:0005179 .

GO:0004725 rdfs:label "protein tyrosine phosphatase activity" .
GO:0006915 rdfs:label "apoptotic process" .
GO:0005179 rdfs:label "hormone activity" .
```

```sparql fixture=go-batch-mnemonic
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX GO: <http://purl.obolibrary.org/obo/GO_>

SELECT ?mnemonic ?protein ?goTerm ?goLabel
WHERE {
  VALUES ?mnemonic { "MTMR1_HUMAN" "P53_HUMAN" "INS_HUMAN" }
  ?protein up:mnemonic ?mnemonic ;
    up:classifiedWith ?goTerm .
  ?goTerm rdfs:label ?goLabel .
  FILTER(STRSTARTS(STR(?goTerm), STR(GO:)))
}
```

`MTMR1_HUMAN` is also classified with a UniProt keyword (`keywords:686`) in the example data above &mdash; the `FILTER(STRSTARTS(...))` is what keeps that keyword out of the results, leaving only GO terms. Drop the filter and re-run the query to see the keyword come back.

## Counting proteins by keyword

UniProt keywords are a controlled vocabulary, so they catch every protein classified that way &mdash; including ones whose name uses a different word for the same thing. Counting proteins reviewed and classified with the keyword `keywords:418` (Kinase) finds every kinase, even one whose name only says "phosphotransferase" (Kinase's own `skos:altLabel`), something a free-text search over names would miss.

```turtle fixture=keyword-count
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix keywords: <http://purl.uniprot.org/keywords/>

<P17706> a up:Protein ;
  up:reviewed true ;
  up:classifiedWith keywords:418 .

<P04637> a up:Protein ;
  up:reviewed true ;
  up:classifiedWith keywords:418 .

<P01308> a up:Protein ;
  up:reviewed false ;
  up:classifiedWith keywords:418 .

keywords:418 a up:Concept .
```

```sparql fixture=keyword-count
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX keywords: <http://purl.uniprot.org/keywords/>

SELECT
  (COUNT(DISTINCT ?protein) AS ?count)
WHERE {
  ?protein up:reviewed true ;
    up:classifiedWith keywords:418 .
}
```
