# Metabolism & Rhea

UniProt cross-references the chemical reactions an enzyme catalyzes to [Rhea](https://www.rhea-db.org/), and classifies enzymes with [EC (Enzyme Commission) numbers](https://iubmb.qmul.ac.uk/enzyme/index.html). This page shows how to query that from the UniProt side - starting at a protein and reaching into Rhea and the enzyme classification hierarchy - plus how UniProt links a protein to the biological pathway(s) it's part of.

For queries that start on the *Rhea* side instead (reactions, chemical participants, cross-species comparisons), see the [Rhea metabolism tutorial](../Rhea/rhea.html).

## Catalytic activity, with its supporting evidence

A `Catalytic_Activity_Annotation` links a protein to the Rhea reaction it catalyzes. UniProt also lets you trace *why* that link is asserted: the statement itself can be described with an [RDF reification](https://www.w3.org/TR/rdf-schema/#ch_reificationvocab) (a resource describing a `rdf:subject`/`rdf:predicate`/`rdf:object` triple), which is in turn attributed to evidence - here, [ECO:0000269](http://purl.obolibrary.org/obo/ECO_0000269), "experimental evidence".

```turtle fixture=catalytic-activity
base <http://purl.uniprot.org/uniprot/>
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix up: <http://purl.uniprot.org/core/>
prefix rh: <http://rdf.rhea-db.org/>
prefix eco: <http://purl.obolibrary.org/obo/ECO_>

<P00918> up:reviewed true ;
  up:annotation <P00918#CA> ;
  up:attribution <P00918#attribution1> .

<P00918#CA> a up:Catalytic_Activity_Annotation ;
  up:catalyticActivity <P00918#CA_ca> .

<P00918#CA_ca> up:catalyzedReaction rh:10748 .

[] rdf:subject <P00918#CA> ;
   rdf:predicate up:catalyticActivity ;
   rdf:object <P00918#CA_ca> ;
   up:attribution <P00918#attribution1> .

<P00918#attribution1> up:evidence eco:0000269 .
```

Adapted from [sparql-examples/UniProt 39](https://sib-swiss.github.io/sparql-examples/examples/UniProt/39_experimental_catalytic_activities_in_swissprot)

```sparql fixture=catalytic-activity
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT
  ?protein
  ?rhea
WHERE {
  # ECO 269 is experimental evidence
  BIND (<http://purl.obolibrary.org/obo/ECO_0000269> as ?evidence)
  ?protein up:reviewed true ;
    up:annotation ?a ;
    up:attribution ?attribution  .

  ?a a up:Catalytic_Activity_Annotation ;
    up:catalyticActivity ?ca .
  ?ca up:catalyzedReaction ?rhea .

  [] rdf:subject ?a ;
    rdf:predicate up:catalyticActivity ;
    rdf:object ?ca ;
    up:attribution ?attribution .

  ?attribution up:evidence ?evidence .
}
```

## Enzyme (EC) classification

Enzymes are classified with EC numbers, organized as a hierarchy of four numbers (e.g. `1.1.1.1`); UniProt materializes the top-level classes (`ec:1.-.-.-` through `ec:7.-.-.-`) as `rdfs:subClassOf` targets. An enzyme's EC number can sit on the protein itself, or on one of its `domain`s or `component`s (for polyproteins that get cleaved into several functional pieces).

```turtle fixture=ec-classification
base <http://purl.uniprot.org/uniprot/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix up: <http://purl.uniprot.org/core/>
prefix ec: <http://purl.uniprot.org/enzyme/>

ec:1.1.1.1 rdfs:subClassOf ec:1.-.-.- .
ec:3.1.3.1 rdfs:subClassOf ec:3.-.-.- .

<P00330> up:enzyme ec:1.1.1.1 .

<P05067> up:domain <P05067#domain1> .
<P05067#domain1> up:enzyme ec:3.1.3.1 .
```

Adapted from [sparql-examples/UniProt 18](https://sib-swiss.github.io/sparql-examples/examples/UniProt/18_top_level_ec_classification_group_by_count)

```sparql fixture=ec-classification
PREFIX ec: <http://purl.uniprot.org/enzyme/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT ?ecClass (COUNT(?protein) as ?size)
WHERE
{
    VALUES (?ecClass) {(ec:1.-.-.-) (ec:2.-.-.-) (ec:3.-.-.-) (ec:4.-.-.-) (ec:5.-.-.-) (ec:6.-.-.-) (ec:7.-.-.-)} .
    ?protein ( up:enzyme | up:domain/up:enzyme | up:component/up:enzyme ) ?enzyme .
    # Enzyme subclasses are materialized, do not use rdfs:subClassOf+
    ?enzyme rdfs:subClassOf ?ecClass .
}
GROUP BY ?ecClass ORDER BY ?ecClass
```

## Rhea reactions, with and without an EC number

Not every Rhea reaction UniProt cites has an EC number attached, some catalytic activities are only described by their Rhea reaction. The `up:enzymeClass` property links a `Catalytic_Activity` directly to its EC number, when there is one.

```turtle fixture=rhea-ec-links
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix rh: <http://rdf.rhea-db.org/>
prefix ec: <http://purl.uniprot.org/enzyme/>

<P00918#CA_ca> up:catalyzedReaction rh:10748 ;
  up:enzymeClass ec:4.2.1.1 .

<P00330#CA_ca> up:catalyzedReaction rh:15561 .
```

```sparql fixture=rhea-ec-links
PREFIX up: <http://purl.uniprot.org/core/>

SELECT
  ?rhea
  ?EC
WHERE {
  ?CatalyticActivity  up:catalyzedReaction   ?rhea ;
    up:enzymeClass         ?EC .
}
```

The `MINUS` version below finds the reactions with no `up:enzymeClass` at all - `?EC` in the `SELECT` stays unbound for every row, which is the point: it's the complement of the query above.

Adapted from [sparql-examples/UniProt 83](https://sib-swiss.github.io/sparql-examples/examples/UniProt/83_rhea_reactions_not_associated_with_ec_in_uniprotkb)

```sparql fixture=rhea-ec-links
PREFIX up: <http://purl.uniprot.org/core/>

SELECT
  ?rhea
  ?EC
WHERE {
  ?CatalyticActivity up:catalyzedReaction ?rhea .
  MINUS {
    ?CatalyticActivity up:enzymeClass ?EC .
  }
}
```

## Gene &rarr; protein &rarr; reaction sets

A common systems-biology need: for a given organism, connect each gene to the protein it encodes and every reaction that protein catalyzes, by following UniProt's own cross-reference to Ensembl.

```turtle fixture=gene-protein-reaction
base <http://purl.uniprot.org/uniprot/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix up: <http://purl.uniprot.org/core/>
prefix taxon: <http://purl.uniprot.org/taxonomy/>
prefix rh: <http://rdf.rhea-db.org/>
prefix ensembl: <http://purl.uniprot.org/ensembl/>

<P00918> up:reviewed true ;
  up:organism taxon:9606 ;
  up:annotation <P00918#CA> ;
  rdfs:seeAlso ensembl:ENST00000000233 .

<P00918#CA> up:catalyticActivity <P00918#CA_ca> .
<P00918#CA_ca> up:catalyzedReaction rh:10748 .

ensembl:ENST00000000233 up:database <http://purl.uniprot.org/database/Ensembl> ;
  up:transcribedFrom ensembl:ENSG00000000000 .
```

Adapted from [sparql-examples/UniProt 61](https://sib-swiss.github.io/sparql-examples/examples/UniProt/61_Gene_Protein_Reaction_sets)

```sparql fixture=gene-protein-reaction
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT
  DISTINCT # Distinct because there might be more than one transcript for a gene leading to duplicates
    ?ensemblGene
    ?protein
    ?rhea
WHERE {
  ?protein up:reviewed true ;
           up:organism taxon:9606 .
  ?protein up:annotation ?caa ;
           rdfs:seeAlso ?ensemblTranscript .
  ?ensemblTranscript up:database <http://purl.uniprot.org/database/Ensembl> .
	?caa up:catalyticActivity ?ca .
  ?ca up:catalyzedReaction ?rhea .
  ?ensemblTranscript up:transcribedFrom ?ensemblGene
}
```

## Pathway cross-references

UniProt cross-references proteins to pathway resources like [Reactome](https://reactome.org/); the pathway's own human-readable name is available right on the cross-reference, as `rdfs:comment`.

```turtle fixture=cancer-pathway
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix taxon: <http://purl.uniprot.org/taxonomy/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix reactome: <http://purl.uniprot.org/reactome/>

<Q96EL1> a up:Protein ;
  up:organism taxon:9606 ;
  up:reviewed true ;
  rdfs:seeAlso reactome:R-HSA-0000001 .

reactome:R-HSA-0000001 up:database <http://purl.uniprot.org/database/Reactome> ;
  rdfs:comment "Signaling by FGFR in Cancer" .
```

Adapted from [sparql-examples/UniProt 217](https://sib-swiss.github.io/sparql-examples/examples/UniProt/217_proteins_in_a_cancer_pathway)

```sparql fixture=cancer-pathway
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT
  ?protein
  ?pathway
  ?pathwayName
WHERE {
  ?protein a up:Protein ;
    up:organism taxon:9606 ;
    up:reviewed true ;
    rdfs:seeAlso ?pathway .
  ?pathway up:database <http://purl.uniprot.org/database/Reactome> ;
    rdfs:comment ?pathwayName .
  FILTER(CONTAINS(?pathwayName, "Cancer"))
}
```
