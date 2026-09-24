# Rhea metabolism tutorial (SWAT4HCLS 2019)

A hands-on introduction to querying metabolism-related data across multiple resources with SPARQL.

| Source | Description | Web site | SPARQL endpoint |
|--------|--------------|----------|------------------|
| Rhea | chemical reactions | <https://www.rhea-db.org/> | <https://sparql.rhea-db.org/sparql> |
| UniProt | protein sequences and annotations | <https://www.uniprot.org/> | <https://sparql.uniprot.org/sparql> |
| Bgee | expression data | <https://bgee.org/> | hosted by <http://biosoda.expasy.org/> |
| MetaNetX | reconciled metabolic networks | <https://www.metanetx.org/> | <https://rdf.metanetx.org/> |
| bioSODA | federated template search over biological databases | | <http://biosoda.expasy.org/> |

Several of the original queries in this tutorial combine two or three of these endpoints in a single query using SPARQL's `SERVICE` keyword &mdash; that's the whole point of a federated query: reach across databases without copying data around. That doesn't work against a single in-browser example dataset, though (there is nothing to federate with), so for each such query this page shows two versions:

- A **runnable** version against a small combined example dataset, with the `SERVICE` wrapper removed (since everything already lives in one place, there's nothing left to federate).
- A **reference** version, unmodified, showing the real query you can paste into the live endpoint listed above to run it for real, across the real databases.

Queries that reach into a third, more specialized service (Bgee/bioSODA expression data, MetaNetX, or the IDSM/Sachem chemical substructure search) aren't things a small fixture can honestly stand in for, so those stay as reference-only queries with an explanation of why.

## Q1: Retrieve all Rhea reactions (approved or preliminary) and their chemical equations

```turtle fixture=q1-reactions
prefix rh: <http://rdf.rhea-db.org/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>

rh:11375 rdfs:subClassOf rh:Reaction ;
  rh:status rh:Approved ;
  rh:equation "hexadecanoate + ATP + CoA = hexadecanoyl-CoA + AMP + diphosphate" .

rh:15561 rdfs:subClassOf rh:Reaction ;
  rh:status rh:Preliminary ;
  rh:equation "L-glutamate + NAD+ + H2O = 2-oxoglutarate + NH4+ + NADH + H+" .

rh:20736 rdfs:subClassOf rh:Reaction ;
  rh:status rh:Approved ;
  rh:equation "beta-D-glucose + ATP = beta-D-glucose 6-phosphate + ADP + H+" .
```

```sparql fixture=q1-reactions
PREFIX rh: <http://rdf.rhea-db.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?reaction ?reactionEquation
WHERE {
  ?reaction rdfs:subClassOf rh:Reaction .
  ?reaction rh:status ?status .
  VALUES ?status { rh:Approved rh:Preliminary }
  ?reaction rh:equation ?reactionEquation .
}
ORDER BY ?reaction
```

## Q2: Retrieve approved reactions using L-glutamate (CHEBI:29985) AND L-glutamine (CHEBI:58359) on opposite sides

A Rhea reaction is split into two `side`s; each side `contains` participants, each participant has a `compound`, and each compound is cross-referenced to ChEBI. `transformableTo` links the side a compound starts on to the side it ends up on.

```turtle fixture=q2-glutamate-glutamine
prefix rh: <http://rdf.rhea-db.org/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix ch: <http://purl.obolibrary.org/obo/>

rh:15561 rdfs:subClassOf rh:Reaction ;
  rh:status rh:Approved ;
  rh:side rh:15561_L, rh:15561_R .

rh:15561_L rh:contains rh:15561_L_1 ;
  rh:transformableTo rh:15561_R .

rh:15561_R rh:contains rh:15561_R_1 .

rh:15561_L_1 rh:compound rh:Compound_29985 .
rh:15561_R_1 rh:compound rh:Compound_58359 .

rh:Compound_29985 rh:chebi ch:CHEBI_29985 .
rh:Compound_58359 rh:chebi ch:CHEBI_58359 .
```

```sparql fixture=q2-glutamate-glutamine
PREFIX rh: <http://rdf.rhea-db.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX ch: <http://purl.obolibrary.org/obo/>

SELECT ?reaction WHERE {
  ?reaction rdfs:subClassOf rh:Reaction .
  ?reaction rh:status rh:Approved .

  ?reaction rh:side ?reactionSide1 .
  ?reactionSide1 rh:contains ?participant1 .
  ?participant1 rh:compound ?compound1 .
  ?compound1 rh:chebi ch:CHEBI_29985 .

  ?reaction rh:side ?reactionSide2 .
  ?reactionSide2 rh:contains ?participant2 .
  ?participant2 rh:compound ?compound2 .
  ?compound2 rh:chebi ch:CHEBI_58359 .

  ?reactionSide1 rh:transformableTo ?reactionSide2 .
}
```

## Q3: Select approved reactions with CHEBI:17815 (a 1,2-diacyl-sn-glycerol) or one of its descendants

ChEBI is itself a hierarchy, so `rdfs:subClassOf*` (the Kleene-star property path) matches the term itself or any of its descendants, however deep.

```turtle fixture=q3-diacylglycerol
prefix rh: <http://rdf.rhea-db.org/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix ch: <http://purl.obolibrary.org/obo/>
prefix up: <http://purl.uniprot.org/core/>

ch:CHEBI_17815 up:name "1,2-diacyl-sn-glycerol" .
ch:CHEBI_75542 rdfs:subClassOf ch:CHEBI_17815 ;
  up:name "1,2-dioleoyl-sn-glycerol" .

rh:32964 rdfs:subClassOf rh:Reaction ;
  rh:status rh:Approved ;
  rh:equation "1,2-dioleoyl-sn-glycerol + H2O = oleate + 2-oleoyl-sn-glycerol + H+" ;
  rh:side rh:32964_L .

rh:32964_L rh:contains rh:32964_L_1 .
rh:32964_L_1 rh:compound rh:Compound_75542 .
rh:Compound_75542 rh:chebi ch:CHEBI_75542 .
```

```sparql fixture=q3-diacylglycerol
PREFIX rh: <http://rdf.rhea-db.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX ch: <http://purl.obolibrary.org/obo/>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT DISTINCT ?chebi ?chebiUniprotName ?reaction ?reactionEquation
WHERE {
  ?reaction rdfs:subClassOf rh:Reaction .
  ?reaction rh:status rh:Approved .
  ?reaction rh:equation ?reactionEquation .
  ?reaction rh:side ?reactionSide .
  ?reactionSide rh:contains ?participant .
  ?participant rh:compound ?compound .
  ?compound rh:chebi ?chebi .
  ?chebi rdfs:subClassOf* ch:CHEBI_17815 .
  ?chebi up:name ?chebiUniprotName .
}
ORDER BY ?chebi
```

## Q4: Retrieve Rhea reactions that involve cholesterol using its InChIKey

Chemical compounds can also be looked up by an exact structural identifier, such as an InChIKey, rather than by ChEBI accession.

```turtle fixture=q4-cholesterol-inchikey
prefix rh: <http://rdf.rhea-db.org/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix ch3: <http://purl.obolibrary.org/obo/chebi/>
prefix ch: <http://purl.obolibrary.org/obo/>
prefix up: <http://purl.uniprot.org/core/>

ch:CHEBI_16113 up:name "cholesterol" ;
  ch3:inchikey "HVYWMOMLDIMFJA-DPAQBDIFSA-N" .

rh:10743 rdfs:subClassOf rh:Reaction ;
  rh:status rh:Approved ;
  rh:equation "cholesterol + O2 + 2 reduced [adrenodoxin] + 2 H+ = pregnenolone + 4-methylpentanal + 2 oxidized [adrenodoxin] + H2O" ;
  rh:side rh:10743_L .

rh:10743_L rh:contains rh:10743_L_1 .
rh:10743_L_1 rh:compound rh:Compound_16113 .
rh:Compound_16113 rh:chebi ch:CHEBI_16113 .
```

```sparql fixture=q4-cholesterol-inchikey
PREFIX rh: <http://rdf.rhea-db.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX ch3: <http://purl.obolibrary.org/obo/chebi/>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT DISTINCT ?chebi ?chebiUniprotName ?reaction ?reactionEquation
WHERE {
  ?reaction rdfs:subClassOf rh:Reaction .
  ?reaction rh:status ?status .
  VALUES ?status { rh:Approved rh:Preliminary }
  ?reaction rh:equation ?reactionEquation .
  ?reaction rh:side ?reactionSide .
  ?reactionSide rh:contains ?participant .
  ?participant rh:compound ?compound .
  ?compound rh:chebi ?chebi .
  ?chebi up:name ?chebiUniprotName .
  ?chebi ch3:inchikey ?inchikey .
  VALUES ?inchikey { "HVYWMOMLDIMFJA-DPAQBDIFSA-N" }
}
ORDER BY ?reaction
```

## Q5: Distribution of Rhea reactions by top-level IUBMB enzyme classification

Rhea links reactions to enzyme (EC) numbers; the enzyme classification hierarchy (which EC number rolls up to which top-level class) is UniProt data. On the live endpoints this is one federated query; combined into a single example dataset, the `SERVICE` wrapper simply disappears.

```turtle fixture=q5-ec-distribution
prefix rh: <http://rdf.rhea-db.org/>
prefix ec: <http://purl.uniprot.org/enzyme/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix skos: <http://www.w3.org/2004/02/skos/core#>

ec:1.-.-.- skos:prefLabel "Oxidoreductases" .
ec:2.-.-.- skos:prefLabel "Transferases" .
ec:3.-.-.- skos:prefLabel "Hydrolases" .

ec:1.1.1.1 rdfs:subClassOf ec:1.-.-.- .
ec:2.7.1.1 rdfs:subClassOf ec:2.-.-.- .
ec:3.1.3.1 rdfs:subClassOf ec:3.-.-.- .

rh:11372 rh:ec ec:1.1.1.1 .
rh:11376 rh:ec ec:1.1.1.1 .
rh:14709 rh:ec ec:2.7.1.1 .
rh:10736 rh:ec ec:3.1.3.1 .
```

```sparql fixture=q5-ec-distribution
PREFIX rh: <http://rdf.rhea-db.org/>
PREFIX ec: <http://purl.uniprot.org/enzyme/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT ?ecClass ?ecClassName (COUNT(?reaction) AS ?reactionCount)
WHERE {
  ?ec rdfs:subClassOf ?ecClass .
  ?ecClass skos:prefLabel ?ecClassName .
  VALUES ?ecClass { ec:1.-.-.- ec:2.-.-.- ec:3.-.-.- }
  ?reaction rh:ec ?ec .
}
GROUP BY ?ecClass ?ecClassName
ORDER BY ?ecClass
```

```sparql reference="Real federated version to run at https://sparql.rhea-db.org/sparql"
PREFIX rh: <http://rdf.rhea-db.org/>
PREFIX ec: <http://purl.uniprot.org/enzyme/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT ?ecClass ?ecClassName (count(?reaction) as ?reactionCount)
WHERE
{
  SERVICE <http://sparql.uniprot.org/sparql> {
    ?ec rdfs:subClassOf ?ecClass .
    ?ecClass skos:prefLabel ?ecClassName .
    VALUES (?ecClass) { (ec:1.-.-.-) (ec:2.-.-.-) (ec:3.-.-.-)
                        (ec:4.-.-.-) (ec:5.-.-.-) (ec:6.-.-.-)
                        (ec:7.-.-.-) }
  }
  ?reaction rh:ec ?ec .
}
ORDER BY ?ecClass
```

## Q6: Retrieve human enzymes metabolizing cholesterol and the reactions they catalyze

```turtle fixture=q6-cholesterol-enzymes
base <http://purl.uniprot.org/uniprot/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix up: <http://purl.uniprot.org/core/>
prefix taxon: <http://purl.uniprot.org/taxonomy/>
prefix rh: <http://rdf.rhea-db.org/>
prefix ch: <http://purl.obolibrary.org/obo/>

rh:10743 rdfs:subClassOf rh:Reaction ;
  rh:equation "cholesterol + O2 + 2 reduced [adrenodoxin] + 2 H+ = pregnenolone + 4-methylpentanal + 2 oxidized [adrenodoxin] + H2O" ;
  rh:side rh:10743_L .
rh:10743_L rh:contains rh:10743_L_1 .
rh:10743_L_1 rh:compound rh:Compound_16113 .
rh:Compound_16113 rh:chebi ch:CHEBI_16113 .

<Q07973> up:mnemonic "CP7A1_HUMAN" ;
  up:organism taxon:9606 ;
  up:recommendedName <Q07973#RN> ;
  up:annotation <Q07973#CA> .
<Q07973#RN> up:fullName "Cholesterol 7-alpha-monooxygenase" .
<Q07973#CA> a up:Catalytic_Activity_Annotation ;
  up:catalyticActivity <Q07973#CAca> .
<Q07973#CAca> up:catalyzedReaction rh:10743 .
```

```sparql fixture=q6-cholesterol-enzymes
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>
PREFIX rh: <http://rdf.rhea-db.org/>
PREFIX ch: <http://purl.obolibrary.org/obo/>

SELECT DISTINCT ?protein ?proteinId ?proteinName ?reaction ?reactionEquation
WHERE {
  ?reaction rdfs:subClassOf rh:Reaction .
  ?reaction rh:side ?reactionSide .
  ?reactionSide rh:contains ?participant .
  ?participant rh:compound ?compound .
  ?compound rh:chebi ch:CHEBI_16113 .
  ?reaction rh:equation ?reactionEquation .

  ?protein up:mnemonic ?proteinId .
  ?protein up:recommendedName ?rn .
  ?rn up:fullName ?proteinName .
  ?protein up:organism taxon:9606 .
  ?protein up:annotation ?a1 .
  ?a1 a up:Catalytic_Activity_Annotation .
  ?a1 up:catalyticActivity ?ca .
  ?ca up:catalyzedReaction ?reaction .
}
ORDER BY ?proteinName
```

```sparql reference="Real federated version to run at https://sparql.rhea-db.org/sparql"
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>
PREFIX rh: <http://rdf.rhea-db.org/>
PREFIX ch: <http://purl.obolibrary.org/obo/>

SELECT DISTINCT ?protein ?proteinId ?proteinName ?reaction ?reactionEquation
WHERE {
  ?reaction rdfs:subClassOf rh:Reaction .
  ?reaction rh:side ?reactionSide .
  ?reactionSide rh:contains ?participant .
  ?participant rh:compound ?compound .
  ?compound rh:chebi ch:CHEBI_16113 .
  ?reaction rh:equation ?reactionEquation .

  SERVICE <https://sparql.uniprot.org/sparql/> {
    ?protein up:mnemonic ?proteinId .
    ?protein up:recommendedName ?rn .
    ?rn up:fullName ?proteinName .
    ?protein up:organism taxon:9606 .
    ?protein up:annotation ?a1 .
    ?a1 a up:Catalytic_Activity_Annotation .
    ?a1 up:catalyticActivity ?ca .
    ?ca up:catalyzedReaction ?reaction .
  }
}
ORDER BY ?proteinName
```

## Q7: Ask whether there is a fungal UniProtKB/Swiss-Prot protein metabolizing cholesterol

`ASK` queries return a plain boolean: whether the pattern matches at all, without listing bindings. This is handy as a fast quality-control check.

```turtle fixture=q7-fungal-cholesterol
base <http://purl.uniprot.org/uniprot/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix up: <http://purl.uniprot.org/core/>
prefix taxon: <http://purl.uniprot.org/taxonomy/>
prefix rh: <http://rdf.rhea-db.org/>
prefix ch: <http://purl.obolibrary.org/obo/>

taxon:5062 rdfs:subClassOf taxon:4751 .

rh:10743 rdfs:subClassOf rh:Reaction ;
  rh:status rh:Approved ;
  rh:side rh:10743_L .
rh:10743_L rh:contains rh:10743_L_1 .
rh:10743_L_1 rh:compound rh:Compound_16113 .
rh:Compound_16113 rh:chebi ch:CHEBI_16113 .

<Q9Y7X1> up:organism taxon:5062 ;
  up:annotation <Q9Y7X1#CA> .
<Q9Y7X1#CA> up:catalyticActivity <Q9Y7X1#CAca> .
<Q9Y7X1#CAca> up:catalyzedReaction rh:10743 .
```

```sparql fixture=q7-fungal-cholesterol
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>
PREFIX rh: <http://rdf.rhea-db.org/>
PREFIX ch: <http://purl.obolibrary.org/obo/>

ASK {
  ?reaction rdfs:subClassOf rh:Reaction .
  ?reaction rh:status ?status .
  VALUES ?status { rh:Approved rh:Preliminary }
  ?reaction rh:side ?reactionSide .
  ?reactionSide rh:contains ?participant .
  ?participant rh:compound ?compound .
  ?compound rh:chebi ch:CHEBI_16113 .

  ?protein up:annotation/up:catalyticActivity/up:catalyzedReaction ?reaction .
  ?protein up:organism/rdfs:subClassOf taxon:4751 .
}
```

```sparql reference="Real federated version to run at https://sparql.uniprot.org/sparql"
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX rh: <http://rdf.rhea-db.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>
PREFIX ch: <http://purl.obolibrary.org/obo/>

ASK {
  SERVICE <https://sparql.rhea-db.org/sparql> {
    ?reaction rdfs:subClassOf rh:Reaction .
    ?reaction rh:status ?status .
    VALUES (?status) {(rh:Approved) (rh:Preliminary)}
    ?reaction rh:side ?reactionSide .
    ?reactionSide rh:contains ?participant .
    ?participant rh:compound ?compound .
    ?compound rh:chebi ch:CHEBI_16113 .
  }
  ?protein up:annotation/up:catalyticActivity/up:catalyzedReaction ?reaction .
  ?protein up:organism/rdfs:subClassOf taxon:4751 .
}
```

## Q8: Where are the human enzymes metabolizing cholesterol located in the cell?

Retrieve the UniProt proteins, their catalyzed reactions, and their subcellular location(s), both as a UniProt location term and as the equivalent Gene Ontology Cellular Component ID.

```turtle fixture=q8-cholesterol-location
base <http://purl.uniprot.org/uniprot/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix up: <http://purl.uniprot.org/core/>
prefix taxon: <http://purl.uniprot.org/taxonomy/>
prefix rh: <http://rdf.rhea-db.org/>
prefix ch: <http://purl.obolibrary.org/obo/>
prefix skos: <http://www.w3.org/2004/02/skos/core#>
prefix location: <http://purl.uniprot.org/locations/>

rh:10743 rdfs:subClassOf rh:Reaction ;
  rh:status rh:Approved ;
  rh:equation "cholesterol + O2 + 2 reduced [adrenodoxin] + 2 H+ = pregnenolone + 4-methylpentanal + 2 oxidized [adrenodoxin] + H2O" ;
  rh:side rh:10743_L .
rh:10743_L rh:contains rh:10743_L_1 .
rh:10743_L_1 rh:compound rh:Compound_16113 .
rh:Compound_16113 rh:chebi ch:CHEBI_16113 .

<Q07973> up:organism taxon:9606 ;
  up:annotation <Q07973#CA>, <Q07973#SL> .
<Q07973#CA> a up:Catalytic_Activity_Annotation ;
  up:catalyticActivity <Q07973#CAca> .
<Q07973#CAca> up:catalyzedReaction rh:10743 .
<Q07973#SL> a up:Subcellular_Location_Annotation ;
  up:locatedIn <Q07973#SLin> .
<Q07973#SLin> up:cellularComponent location:Endoplasmic_reticulum_membrane .
location:Endoplasmic_reticulum_membrane skos:prefLabel "Endoplasmic reticulum membrane" ;
  skos:exactMatch <http://purl.obolibrary.org/obo/GO_0005789> .
```

```sparql fixture=q8-cholesterol-location
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>
PREFIX rh: <http://rdf.rhea-db.org/>
PREFIX ch: <http://purl.obolibrary.org/obo/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT DISTINCT ?protein ?reaction ?upLocation ?upLocationLabel ?goId
WHERE {
  ?reaction rdfs:subClassOf rh:Reaction .
  ?reaction rh:status rh:Approved .
  ?reaction rh:equation ?reactionEquation .
  ?reaction rh:side ?reactionSide .
  ?reactionSide rh:contains ?participant .
  ?participant rh:compound ?compound .
  # compound constraint
  ?compound rh:chebi ch:CHEBI_16113 .

  # taxonomy constraint
  ?protein up:organism taxon:9606 .
  # Rhea catalyzed reactions
  ?protein up:annotation ?a1 .
  ?a1 a up:Catalytic_Activity_Annotation .
  ?a1 up:catalyticActivity ?ca .
  ?ca up:catalyzedReaction ?reaction .
  # UniProt cellular components
  ?protein up:annotation ?a2 .
  ?a2 a up:Subcellular_Location_Annotation .
  ?a2 up:locatedIn ?lIn .
  ?lIn up:cellularComponent ?upLocation .
  ?upLocation skos:prefLabel ?upLocationLabel .
  ?upLocation skos:exactMatch ?goId .
}
```

```sparql reference="Real federated version to run at https://sparql.uniprot.org/sparql"
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rh: <http://rdf.rhea-db.org/>
PREFIX ch: <http://purl.obolibrary.org/obo/>
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT distinct ?protein ?reaction ?upLocation ?upLocationLabel ?goId
WHERE {
  SERVICE <https://sparql.rhea-db.org/sparql> {
    ?reaction rdfs:subClassOf rh:Reaction .
    ?reaction rh:status rh:Approved .
    ?reaction rh:equation ?reactionEquation .
    ?reaction rh:side ?reactionSide .
    ?reactionSide rh:contains ?participant .
    ?participant rh:compound ?compound .
    ?compound rh:chebi ch:CHEBI_16113 .
  }
  ?protein up:organism taxon:9606 .
  ?protein up:annotation ?a1 .
  ?a1 a up:Catalytic_Activity_Annotation .
  ?a1 up:catalyticActivity ?ca .
  ?ca up:catalyzedReaction ?reaction .
  ?protein up:annotation ?a2 .
  ?a2 a up:Subcellular_Location_Annotation .
  ?a2 up:locatedIn ?lIn .
  ?lIn up:cellularComponent ?upLocation .
  ?upLocation skos:prefLabel ?upLocationLabel .
  ?upLocation skos:exactMatch ?goId .
}
```

## Q9: Where are the human genes encoding enzymes metabolizing cholesterol expressed?

This retrieves UniProt proteins, their catalyzed reactions, their encoding genes (Ensembl), and the anatomic entities where those genes are expressed &mdash; UBERON anatomic entities coming from the Bgee expression-data resource, reached through the bioSODA federation endpoint. This crosses *three* different resources (Rhea, UniProt, Bgee) in one query, and the original tutorial warns it can take a few minutes even on the real endpoints, so it isn't something a small in-page fixture can honestly stand in for. Run it yourself at [sparql.uniprot.org](https://sparql.uniprot.org/sparql):

```sparql reference="Federates Rhea, UniProt and Bgee (via bioSODA) &mdash; run at https://sparql.uniprot.org/sparql"
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rh: <http://rdf.rhea-db.org/>
PREFIX ch: <http://purl.obolibrary.org/obo/>
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>
PREFIX genex: <http://purl.org/genex#>
PREFIX lscr: <http://purl.org/lscr#>

SELECT distinct ?protein
                ?ensemblGene
                ?reaction
                ?anatomicEntityLabel
                ?anatomicEntity
WHERE {
  {
    SELECT * WHERE {
      SERVICE <https://sparql.rhea-db.org/sparql> {
        ?reaction rdfs:subClassOf rh:Reaction .
        ?reaction rh:status rh:Approved .
        ?reaction rh:equation ?reactionEquation .
        ?reaction rh:side ?reactionSide .
        ?reactionSide rh:contains ?participant .
        ?participant rh:compound ?compound .
        ?compound rh:chebi ch:CHEBI_16113 .
      }
    }
  }
  ?protein up:organism taxon:9606 .
  ?protein up:annotation ?a .
  ?a a up:Catalytic_Activity_Annotation .
  ?a up:catalyticActivity ?ca .
  ?ca up:catalyzedReaction ?reaction .
  ?protein rdfs:seeAlso / up:transcribedFrom ?ensemblGene .

  SERVICE <http://biosoda.expasy.org/rdf4j-server/repositories/bgeelight> {
    ?gene genex:isExpressedIn ?anatomicEntity .
    ?gene lscr:xrefEnsemblGene ?ensemblGene .
    ?anatomicEntity rdfs:label ?anatomicEntityLabel .
  }
}
```

## Q10: Build the UniProt *H. pylori* proteome-scale metabolic network

```turtle fixture=q10-hpylori-network
base <http://purl.uniprot.org/uniprot/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix rh: <http://rdf.rhea-db.org/>
prefix up: <http://purl.uniprot.org/core/>
prefix taxon: <http://purl.uniprot.org/taxonomy/>
prefix ch: <http://purl.obolibrary.org/obo/>

<O25948> up:reviewed true ;
  up:organism taxon:85962 ;
  up:mnemonic "TRPA_HELPY" ;
  up:annotation <O25948#CA> .
<O25948#CA> up:catalyticActivity <O25948#CAca> .
<O25948#CAca> up:catalyzedReaction rh:24945 .

rh:24945 rh:equation "1-(2-carboxyphenylamino)-1-deoxy-D-ribulose 5-phosphate = indole-3-glycerol phosphate + CO2 + H2O" ;
  rh:side rh:24945_L .
rh:24945_L rh:contains rh:24945_L_1, rh:24945_L_2 .
rh:24945_L_1 rh:compound rh:Compound_58613 .
rh:Compound_58613 rh:chebi ch:CHEBI_58613 .
rh:24945_L_2 rh:compound rh:Compound_unspecified .
```

The last participant (`rh:Compound_unspecified`) deliberately has no `rh:chebi` triple, to show why the `chebi` binding is wrapped in `OPTIONAL` &mdash; not every compound in Rhea is cross-referenced to ChEBI.

```sparql fixture=q10-hpylori-network
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rh: <http://rdf.rhea-db.org/>
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>

SELECT ?protein ?proteinId ?reaction ?reactionSide ?compound ?chebi ?reactionEquation
WHERE {
  ?protein up:reviewed ?status .
  ?protein up:organism taxon:85962 .
  ?protein up:mnemonic ?proteinId .
  ?protein up:annotation ?a .
  ?a up:catalyticActivity ?ca .
  ?ca up:catalyzedReaction ?reaction .

  ?reaction rh:equation ?reactionEquation .
  ?reaction rh:side ?reactionSide .
  ?reactionSide rh:contains ?participant .
  ?participant rh:compound ?compound .
  OPTIONAL { ?compound rh:chebi ?chebi }
}
```

```sparql reference="Real federated version to run at https://sparql.rhea-db.org/sparql"
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rh: <http://rdf.rhea-db.org/>
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>
SELECT  ?protein
        ?proteinId
        ?reaction
        ?reactionSide
        ?compound
        ?chebi
        ?reactionEquation
WHERE {
  SERVICE <http://sparql.uniprot.org/sparql> {
    ?protein up:reviewed ?status .
    ?protein up:organism taxon:85962 .
    ?protein up:mnemonic ?proteinId .
    ?protein up:annotation ?a .
    ?a up:catalyticActivity ?ca .
    ?ca up:catalyzedReaction ?reaction .
  }
  ?reaction rh:equation ?reactionEquation .
  ?reaction rh:side ?reactionSide .
  ?reactionSide rh:contains ?participant .
  ?participant rh:compound ?compound .
  OPTIONAL {?compound rh:chebi ?chebi } .
}
```

## Q11: Explore the *H. pylori* tryptophan biosynthesis pathway (GO:0000162)

This one runs entirely against UniProt data already, so nothing needs to be flattened.

```turtle fixture=q11-hpylori-pathway
base <http://purl.uniprot.org/uniprot/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix up: <http://purl.uniprot.org/core/>
prefix rh: <http://rdf.rhea-db.org/>
prefix taxon: <http://purl.uniprot.org/taxonomy/>
prefix GO: <http://purl.obolibrary.org/obo/GO_>
prefix path: <http://purl.uniprot.org/pathway/>

<O25948> up:reviewed true ;
  up:mnemonic "TRPA_HELPY" ;
  up:organism taxon:85962 ;
  up:classifiedWith GO:0000162 ;
  up:annotation <O25948#CA>, <O25948#PA> .

<O25948#CA> up:catalyticActivity <O25948#CAca> .
<O25948#CAca> up:catalyzedReaction rh:24945 .

<O25948#PA> a up:Pathway_Annotation ;
  rdfs:seeAlso path:trp-biosynthesis .

path:trp-biosynthesis rdfs:label "L-tryptophan biosynthesis" .
```

```sparql fixture=q11-hpylori-pathway
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>
PREFIX GO: <http://purl.obolibrary.org/obo/GO_>

SELECT distinct ?upProteinId ?goId ?rhReaction ?upPathway
WHERE {
  ?upProtein up:reviewed true .
  ?upProtein up:mnemonic ?upProteinId .
  # taxonomy constraint
  ?upProtein up:organism taxon:85962 .
  ?upProtein up:annotation/up:catalyticActivity/up:catalyzedReaction ?rhReaction .
  ?upProtein up:classifiedWith ?goId .
  # pathway constraint (GO Biological Process)
  VALUES ?goId { GO:0000162 }
  OPTIONAL {
    ?upProtein up:annotation ?pa .
    ?pa a up:Pathway_Annotation .
    ?pa rdfs:seeAlso/rdfs:label ?upPathway .
  }
}
ORDER BY ?upPathway
```

## Q12: *H. pylori* enzyme complexes for the tryptophan biosynthesis pathway (MetaNetX)

This extends Q11 with a `SERVICE` call to [MetaNetX](https://rdf.metanetx.org/) to resolve the enzyme complexes behind a reaction. MetaNetX is a third, specialized resource with its own reconciled-network data model, not something a toy fixture can usefully stand in for &mdash; run this one directly against the live endpoint.

```sparql reference="Federates UniProt with MetaNetX &mdash; run at https://sparql.uniprot.org/sparql"
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX rh: <http://rdf.rhea-db.org/>
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>
PREFIX mnx: <https://rdf.metanetx.org/schema/>
PREFIX mnet: <https://rdf.metanetx.org/mnet/>
PREFIX GO: <http://purl.obolibrary.org/obo/GO_>

SELECT distinct
    ?upPathway
    ?upProteinId
    ?rhReaction
    ?mnxr
    ?cplx_label
    ?mnet
WHERE{
    ?upProtein up:reviewed true .
    ?upProtein up:mnemonic ?upProteinId .
    ?upProtein up:organism taxon:85962 .
    ?upProtein up:classifiedWith GO:0000162 .
    ?upProtein up:annotation/up:catalyticActivity/up:catalyzedReaction ?rhReaction .
    OPTIONAL {?upProtein up:annotation ?pa .
              ?pa a up:Pathway_Annotation ;
                  rdfs:seeAlso/rdfs:label ?upPathway . }
    SERVICE <https://rdf.metanetx.org/sparql> {
        ?mnxr mnx:reacXref ?rhReaction .
        ?reac mnx:mnxr     ?mnxr       .
        ?gpr  mnx:reac     ?reac       ;
              mnx:cata     ?cata       .
        ?cata mnx:cplx     ?cplx       .
        ?cplx rdfs:label   ?cplx_label .
        ?mnet mnx:gpr      ?gpr        .
        VALUES ?mnet {mnet:seed_Opt85962_1}
    }
}
ORDER BY ?upPathway
```

## Visualization: taxonomic distribution of Rhea reactions in UniProtKB/Swiss-Prot

| Taxonomic domain | NCBI taxid |
|-------------------|------------|
| Archaea | 2157 |
| Bacteria | 2 |
| Eukaryota | 2759 |
| Viruses | 10239 |

### Q20: Retrieve UniProtKB/Swiss-Prot proteins, their taxonomic domain and their catalyzed Rhea reactions

The original tutorial feeds this query's results into a Venn diagram (via matplotlib) showing how many Rhea reactions are annotated in each taxonomic domain, and how much they overlap &mdash; a visualization over the *entire* UniProtKB/Swiss-Prot dataset. That's neither a single runnable query result nor something a toy fixture can meaningfully visualize, so this one is reference-only; the original also warns it can take a few minutes even on the live endpoint.

```sparql reference="Feeds a Venn diagram over the full dataset &mdash; run at https://sparql.uniprot.org/sparql"
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX keywords: <http://purl.uniprot.org/keywords/>
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>

SELECT distinct ?upProtein
                ?taxid
                ?domain
                ?domainName
                ?rhReaction
WHERE {
  # UniProtKB/Swiss-Prot entries (reviewed)
  ?upProtein up:reviewed true .
  ?upProtein up:organism ?taxid .
  ?taxid rdfs:subClassOf ?domain .
  VALUES (?domain) { (taxon:2157) (taxon:2) (taxon:2759) (taxon:10239)}
  ?domain up:scientificName ?domainName .
  ?upProtein up:annotation/up:catalyticActivity/up:catalyzedReaction ?rhReaction .
}
```

## IDSM/Sachem service

### Q30: Retrieve the Rhea reactions that involve cholesterol or cholesterol derivatives

This performs a *chemical substructure search*: given a molecule as a [SMILES](https://en.wikipedia.org/wiki/Simplified_Molecular_Input_Line_Entry_System) string, the [IDSM/Sachem](https://idsm.elixir-czech.cz/) service finds every ChEBI compound that contains it as a substructure. That's a specialized cheminformatics engine reached over `SERVICE`, not something an in-browser example dataset can reproduce &mdash; run this one directly against the live endpoint.

```sparql reference="Chemical substructure search via IDSM/Sachem &mdash; run at https://sparql.rhea-db.org/sparql"
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX sachem: <http://bioinfo.uochb.cas.cz/rdf/v1.0/sachem#>
PREFIX idsm: <https://idsm.elixir-czech.cz/sparql/endpoint/>
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX rh: <http://rdf.rhea-db.org/>

SELECT DISTINCT ?chebi
                ?chebiUniprotName
                ?rhReaction
                ?rhReactionEquation
WHERE {
  SERVICE idsm:chebi {
    ?chebi sachem:substructureSearch
    [ sachem:query "C1[C@@]2([C@]3(CC[C@]4([C@]([C@@]3(CC=C2C[C@H](C1)O)[H])(CC[C@@]4([C@H](C)CCCC(C)C)[H])[H])C)[H])C" ] .
  }
  ?rhReaction rdfs:subClassOf rh:Reaction .
  ?rhReaction rh:equation ?rhReactionEquation .
  ?rhReaction rh:status ?status .
  VALUES (?status) {(rh:Approved) (rh:Preliminary)}
  ?rhReaction rh:side ?reactionSide .
  ?reactionSide rh:contains ?participant .
  ?participant rh:compound ?compound .
  ?compound rh:chebi ?chebi .
  ?chebi up:name ?chebiUniprotName .
}
```
