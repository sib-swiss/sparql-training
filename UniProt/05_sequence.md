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

Both queries below use a `FILTER` *inside* an `OPTIONAL` block that depends on a value from a `BIND` &mdash; a combination [Comunica](https://comunica.dev/) (the engine running the examples on this site) can't plan when evaluating a query itself against a small local dataset, even though it's valid SPARQL. Sent whole to a real, conformant endpoint instead &mdash; which is exactly what happens below, since the query targets `sparql.uniprot.org` live, with no local fixture &mdash; that endpoint does its own native evaluation and there's no issue.

```sparql live="https://sparql.uniprot.org/sparql"
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
LIMIT 5
```

### The canonical isoform doesn't have to end in "-1"

`up:sequence` points at whichever isoform was chosen as canonical &mdash; usually `-1`, but not always. This query finds reviewed proteins where it isn't, ordered by the highest isoform number used as the canonical sequence. Like the query above, this one also mixes a `FILTER` inside an `OPTIONAL` with a `BIND`, so it runs live against `sparql.uniprot.org` rather than a local fixture.

```sparql live="https://sparql.uniprot.org/sparql"
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
LIMIT 5
```

## Initiator methionine

Translation always starts with a methionine, but that residue is often enzymatically removed afterwards. When UniProt has evidence for this, it's recorded as a `up:Initiator_Methionine_Annotation` &mdash; a single-residue [FALDO](https://link.springer.com/article/10.1186/s13326-016-0067-z) position (`faldo:begin` and `faldo:end` both point at the same spot) at the very start of the sequence. Below, human hemoglobin subunit alpha ([P69905](https://www.uniprot.org/uniprotkb/P69905)): the query looks up that position in the full (unprocessed) sequence to double-check it really is an "M".

```turtle fixture=seq-initiator-met
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix faldo: <http://biohackathon.org/resource/faldo#>
prefix isoform: <http://purl.uniprot.org/isoforms/>

<P69905> a up:Protein ;
  up:sequence isoform:P69905-1 ;
  up:annotation <P69905#InitMet> .

isoform:P69905-1 rdf:value "MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHGSAQVKGHGKKVADALTNAVAHVDDMPNALSALSDLHAHKLRVDPVNFKLLSHCLLVTLAAHLPAEFTPAVHASLDKFLASVSTVLTSKYR" .

<P69905#InitMet> a up:Initiator_Methionine_Annotation ;
  up:range <P69905#InitMet_range> .

<P69905#InitMet_range> faldo:begin <P69905#pos1> ;
  faldo:end <P69905#pos1> .

<P69905#pos1> faldo:position 1 ;
  faldo:reference isoform:P69905-1 .
```

```sparql fixture=seq-initiator-met
PREFIX faldo: <http://biohackathon.org/resource/faldo#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT
  ?protein
  ?removedResidue
WHERE {
  ?protein up:annotation ?met ;
    up:sequence ?sequence .
  ?met a up:Initiator_Methionine_Annotation ;
    up:range/faldo:begin ?begin .
  ?begin faldo:position ?position ;
    faldo:reference ?sequence .
  ?sequence rdf:value ?sequenceVal .
  BIND(SUBSTR(?sequenceVal, ?position, 1) AS ?removedResidue)
}
```

## Chains: the mature, processed protein

Once initiator methionines, signal peptides and other processing steps are accounted for, what's left is the *mature* protein &mdash; recorded as a `up:Chain_Annotation` with a `rdfs:comment` naming it and a range covering the residues it spans. Continuing the hemoglobin example: after the initiator methionine above is removed, the mature chain covers residues 2&ndash;142 of the same 142-residue sequence.

```turtle fixture=seq-chain
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix faldo: <http://biohackathon.org/resource/faldo#>
prefix isoform: <http://purl.uniprot.org/isoforms/>

<P69905> a up:Protein ;
  up:sequence isoform:P69905-1 ;
  up:annotation <P69905#Chain1> .

isoform:P69905-1 rdf:value "MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHGSAQVKGHGKKVADALTNAVAHVDDMPNALSALSDLHAHKLRVDPVNFKLLSHCLLVTLAAHLPAEFTPAVHASLDKFLASVSTVLTSKYR" .

<P69905#Chain1> a up:Chain_Annotation ;
  rdfs:comment "Hemoglobin subunit alpha" ;
  up:range <P69905#Chain1_range> .

<P69905#Chain1_range> faldo:begin <P69905#pos2> ;
  faldo:end <P69905#pos142> .

<P69905#pos2> faldo:position 2 ;
  faldo:reference isoform:P69905-1 .

<P69905#pos142> faldo:position 142 ;
  faldo:reference isoform:P69905-1 .
```

```sparql fixture=seq-chain
PREFIX faldo: <http://biohackathon.org/resource/faldo#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT
  ?protein
  ?description
  ?begin
  ?end
WHERE {
  ?protein up:annotation ?chain .
  ?chain a up:Chain_Annotation ;
    rdfs:comment ?description ;
    up:range ?range .
  ?range faldo:begin/faldo:position ?begin ;
    faldo:end/faldo:position ?end .
}
```

## Signal peptides

Secreted and membrane proteins carry a `up:Signal_Peptide_Annotation` at their N-terminus &mdash; a short stretch that targets the protein for translocation and is cleaved off before the mature chain begins, so it's never part of the functional protein. Below, the amyloid precursor protein ([P05067](https://www.uniprot.org/uniprotkb/P05067)) again, this time extracting the actual signal peptide sequence (residues 1&ndash;17) with `SUBSTR`.

```turtle fixture=seq-signal-peptide
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix faldo: <http://biohackathon.org/resource/faldo#>
prefix isoform: <http://purl.uniprot.org/isoforms/>

<P05067> a up:Protein ;
  up:sequence isoform:P05067-1 ;
  up:annotation <P05067#Signal1> .

isoform:P05067-1 rdf:value "MLPGLALLLLAAWTARALEVPTDGNAGLL" .

<P05067#Signal1> a up:Signal_Peptide_Annotation ;
  up:range <P05067#Signal1_range> .

<P05067#Signal1_range> faldo:begin <P05067#pos1> ;
  faldo:end <P05067#pos17> .

<P05067#pos1> faldo:position 1 ;
  faldo:reference isoform:P05067-1 .

<P05067#pos17> faldo:position 17 ;
  faldo:reference isoform:P05067-1 .
```

```sparql fixture=seq-signal-peptide
PREFIX faldo: <http://biohackathon.org/resource/faldo#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT
  ?protein
  ?signalPeptide
WHERE {
  ?protein up:annotation ?sp ;
    up:sequence ?sequence .
  ?sp a up:Signal_Peptide_Annotation ;
    up:range ?range .
  ?range faldo:begin/faldo:position ?begin ;
    faldo:end/faldo:position ?end .
  ?sequence rdf:value ?sequenceVal .
  BIND(SUBSTR(?sequenceVal, ?begin, ?end - ?begin + 1) AS ?signalPeptide)
}
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
