# Sequences & isoforms

This page shows you how UniProtKB stores **protein sequences** and their **isoforms**. These queries are adapted from the [SIB SPARQL examples](https://github.com/sib-swiss/sparql-examples) collection for UniProt.

A UniProt entry points at its sequence(s) through the `up:sequence` property, and, when a computational mapping exists, through `up:potentialSequence` as well. Each sequence is its own resource &mdash; typically an isoform, identified by an IRI like `http://purl.uniprot.org/isoforms/P05067-1` &mdash; carrying the residues themselves in `rdf:value`. A sequence resource is typed `up:Simple_Sequence` when UniProt maintains it directly, or `up:External_Sequence` when it comes from an external isoform mapping.

## Retrieving sequences for an organism

Select UniProtKB entries and their amino acid sequences (including isoforms) for *E. coli* K12 and all its strains.

```turtle fixture=seq-organism
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix taxon: <http://purl.uniprot.org/taxonomy/>
prefix isoform: <http://purl.uniprot.org/isoforms/>

taxon:511145 rdfs:label "Escherichia coli str. K-12 substr. MG1655" ;
             rdfs:subClassOf taxon:83333 .

<P0A877> a up:Protein ;
  up:organism taxon:511145 ;
  up:sequence isoform:P0A877-1 .

isoform:P0A877-1 rdf:value "MTEQAPAHWDIKDFAKVDQKALTHSVRKVASQVLGISPD" .
```

```sparql fixture=seq-organism
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT ?protein ?organism ?isoform ?sequence
WHERE
{
    ?protein a up:Protein .
    ?protein up:organism ?organism .
    # Taxon subclasses are materialized, do not use rdfs:subClassOf+
    ?organism rdfs:subClassOf taxon:83333 .
    ?protein up:sequence ?isoform .
    ?isoform rdf:value ?sequence .
}
```

## Computationally mapped isoforms

Some isoforms aren't asserted directly by UniProt curators, but computationally mapped instead, through `up:potentialSequence`. On the real endpoint, sequence queries are often scoped to the `http://sparql.uniprot.org/uniprot` named graph, so they don't also match data living in the separate UniParc graph. A single in-page example dataset has only one graph to begin with, so that wrapper can simply be dropped.

```turtle fixture=seq-potential
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix taxon: <http://purl.uniprot.org/taxonomy/>
prefix isoform: <http://purl.uniprot.org/isoforms/>

<P05067> a up:Protein ;
  up:organism taxon:9606 ;
  up:potentialSequence isoform:P05067-11 .

isoform:P05067-11 a up:External_Sequence .
```

```sparql fixture=seq-potential
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT ?entry ?sequence
WHERE {
  ?entry a up:Protein ;
    up:organism taxon:9606 ;
    up:potentialSequence ?sequence .
}
```

## Which sequence is canonical?

A UniProt entry can have several isoforms, but `up:sequence` always points at whichever one is *canonical*. This query marks each sequence as canonical or not: a `Simple_Sequence` is likely canonical, unless it's *also* an `External_Sequence` whose IRI doesn't correspond to the entry's own accession (an external isoform mapped in from elsewhere).

Both queries below use a `FILTER` *inside* an `OPTIONAL` block that depends on a value from a `BIND` &mdash; a combination [Comunica](https://comunica.dev/) (the engine running the examples on this site) can't currently plan, even though it's valid SPARQL that real endpoints like UniProt's run fine. That's a genuine engine limitation, not a problem with the query or the data, so these two stay reference-only rather than being forced into a rewrite that might quietly change what they mean. Copy them into a full SPARQL implementation (or run them directly at [sparql.uniprot.org](https://sparql.uniprot.org/sparql)) to see them work.

```sparql reference="FILTER inside OPTIONAL depending on a BIND — not supported by this site's in-browser engine"
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT ?entry ?sequence ?isCanonical
WHERE {
  GRAPH <http://sparql.uniprot.org/uniprot> {
      ?entry a up:Protein ;
	up:organism taxon:9606 ;
      	up:sequence ?sequence .
      # If the sequence is a "Simple_Sequence" it is likely to be the
      # cannonical sequence
      OPTIONAL {
       	?sequence a up:Simple_Sequence .
        BIND(true AS ?likelyIsCanonical)
      }
      # unless we are dealing with an external isoform
      # see https://www.uniprot.org/help/canonical_and_isoforms
      OPTIONAL {
       	FILTER(?likelyIsCanonical)
        ?sequence a up:External_Sequence .
        BIND(true AS ?isComplicated)
      }
      # If it is an external isoform it's id would not match the
      # entry primary accession. We test that the variable is bound
      # else an UNDEF might fail the query from working
      BIND(IF(BOUND(?isComplicated), STRENDS(STR(?entry), STRBEFORE(SUBSTR(STR(?sequence), 34),'-')),?likelyIsCanonical) AS ?isCanonical)
  }
}
```

### The canonical isoform doesn't have to end in "-1"

`up:sequence` points at whichever isoform was chosen as canonical &mdash; usually `-1`, but not always. This query finds reviewed proteins where it isn't, ordered by the highest isoform number used as the canonical sequence.

```sparql reference="FILTER inside OPTIONAL depending on a BIND — not supported by this site's in-browser engine"
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX uniprotkb: <http://purl.uniprot.org/uniprot/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT
  ?protein
  (?sequence AS ?canonicalIsoform)
  ?isoformCount
WHERE
{
    ?protein up:reviewed true .
    ?protein up:sequence ?sequence .
    ?sequence a up:Simple_Sequence .
    OPTIONAL {
      ?sequence a up:External_Sequence .
      BIND(true AS ?isExternalSequence)
      BIND(SUBSTR(STR(?protein), STRLEN(STR(uniprotkb:))) AS ?proteinAc)
      FILTER(CONTAINS(STR(?sequence), ?proteinAc))
    }
    FILTER(?isExternalSequence || !BOUND(?isExternalSequence))
  BIND(xsd:int(STRAFTER(STR(?sequence), "-")) AS ?isoformCount)
} ORDER BY DESC(?isoformCount)
```

## Fragmented sequences

Not every sequence is complete: `up:fragment` marks a sequence as being composed of fragments.

```turtle fixture=seq-fragment
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix isoform: <http://purl.uniprot.org/isoforms/>

<P0A877> a up:Protein ;
  up:sequence isoform:P0A877-1 .
isoform:P0A877-1 up:fragment [ a up:Fragment ] .

<P05067> a up:Protein ;
  up:sequence isoform:P05067-1 .
isoform:P05067-1 rdf:value "MTEQAP" .
```

```sparql fixture=seq-fragment
PREFIX up: <http://purl.uniprot.org/core/>

SELECT DISTINCT
  ?protein
WHERE {
  ?protein a up:Protein ;
    up:sequence ?sequence .
  ?sequence up:fragment [] .
}
```

## Mass spectrometry measurements

Some entries carry an experimentally measured mass, recorded as a `up:Mass_Spectrometry_Annotation` with a `up:measuredValue` and, where known, a `up:measuredError` margin.

```turtle fixture=seq-mass-spec
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix xsd: <http://www.w3.org/2001/XMLSchema#>

<P05067> a up:Protein ;
  up:annotation <P05067#MS1> .
<P05067#MS1> a up:Mass_Spectrometry_Annotation ;
  up:measuredValue "79924.5"^^xsd:double ;
  up:measuredError "50.0"^^xsd:double .

<P0A877> a up:Protein ;
  up:annotation <P0A877#MS1> .
<P0A877#MS1> a up:Mass_Spectrometry_Annotation ;
  up:measuredValue "55000.0"^^xsd:double .
```

```sparql fixture=seq-mass-spec
PREFIX up: <http://purl.uniprot.org/core/>

SELECT
  ?protein
  ?annotation
  ?measuredValue
  ?measuredError
WHERE {
  ?protein a up:Protein ;
    up:annotation ?annotation .
  ?annotation a up:Mass_Spectrometry_Annotation ;
    up:measuredValue ?measuredValue .
  OPTIONAL { ?annotation up:measuredError ?measuredError }
}
```
