# Isomer relationships: from generic to specific

## Context

MetaNetX distinguishes **generic entities** (e.g., *alanine* without stereochemistry) from **stereochemically specific entities** (*L-alanine*, *D-alanine*). The `mnx:chemIsom` relationship links a generic set to its specific isomers.

```note
Why is this important for data quality? If your dataset contains both generic *alanine* and *L-alanine* in separate columns, you potentially introduce redundancy - but they are not exactly the same compound either. It is essential to know which one was actually measured.
```

Map the list of alanine identifiers using the MetaNetX ID mapper or the SPARQL editor, and examine the results. Then, retrieve the MNX reference sets associated with the alanine identifiers and analyse their isomer relationships.

In the MetaNetX knowledge graph, isomer relationships between chemical entities are represented by the predicate `mnx:chemIsom`.

## Input identifiers - complete alanine family

Alanine, no stereochemistry (generic):

- `chebi:16449`, `chebi:32439`, `chebi:66916`, `chebi:143534`, `chebi:132498`, `chebi:32440`, `hmdb:HMDB0062251`, `keggC:C01401`

L-alanine:

- `chebi:16977`, `chebi:57972`, `chebi:229589`, `chebi:32431`, `chebi:76050`, `chebi:32432`, `keggD:D00012`, `keggC:C00041`, `biggM:ala__L`, `hmdb:HMDB0000161`, `sabiorkM:67`, `seedM:cpd00035`, `vmhM:ala_L`, `metacycM:L-ALPHA-ALANINE`

D-alanine:

- `chebi:57416`, `chebi:32435`, `chebi:15570`, `chebi:32436`, `biggM:ala__D`, `hmdb:HMDB0001310`, `sabiorkM:1940`, `keggC:C00133`, `seedM:cpd00117`, `vmhM:ala_D`, `metacycM:D-ALANINE`

## SPARQL query with isomer relationship

```turtle fixture=metanetx-ex2 title="Alanine and glucose 6-phosphate families (MetaNetX, real data extract)"
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
# Alanine: one generic set, two stereospecific isomers
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
# Glucose 6-phosphate: a denser family - anomers and
# protonation states both, not a simple generic/specific pair
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
    # alanine, no stereochemistry (generic)
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

The 31 identifiers resolve to only 3 `MNXM` sets: generic alanine, L-alanine and D-alanine. Every row for a generic-alanine identifier also carries both isomers in `chem_Isom_id` - that's `mnx:chemIsom` doing its job, pointing from the generic set at each specific one.

## Detection of generic/specific collisions

```note
If your dataset contains both a generic entity (which has isomers) and one of its specific isomers, you are mixing different levels of precision. MetaNetX allows this to be detected automatically.
```

This is exactly what the input list above does: it submits the generic alanine identifiers *and* the L-alanine and D-alanine identifiers together. Running that check against the results confirms it - generic entities and their specific isomers are simultaneously present in the input list, which is the collision this check is meant to catch.

## A more complex case: the glucose 6-phosphate family

**Glucose 6-phosphate** (G6P) is a key metabolite in glycolysis. In standard LC-MS experiments, the alpha and beta anomers are generally **not distinguished** - the measurement therefore corresponds to a "generic" signal that must be annotated cautiously. MetaNetX represents this family with multiple levels of stereochemistry **and** multiple protonation states, resulting in a graph that is significantly denser than that of alanine.

### Input identifiers - G6P family

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

### SPARQL query and get relationships

Following `mnx:chemIsom` in both directions with a property path pulls out the whole connected component in one query, starting from just the identifiers submitted above:

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

  # 1. Anchoring: MNX entities corresponding to the submitted IDs
  ?anchor mnx:chemXref ?xref .
  ?xref   rdfs:label   ?query_id .

  # 2. Transitive extension in BOTH directions (upstream + downstream)
  ?anchor (mnx:chemIsom|^mnx:chemIsom)* ?node .

  # 3. Retrieve all chemIsom edges outgoing from the reached nodes
  ?node mnx:chemIsom ?target .

  ?node   rdfs:label ?from_id .
  ?target rdfs:label ?to_id .

  OPTIONAL { ?node   rdfs:comment ?from_name . }
  OPTIONAL { ?target rdfs:comment ?to_name   . }
}
ORDER BY ?from_id ?to_id
```

```note
`(mnx:chemIsom|^mnx:chemIsom)*` is a property path: `^` reverses a predicate's direction, `|` is "either", and `*` means "zero or more steps".
```

### Results

The result is a small graph, not a line: `D-glucose 6-phosphate` sits between a generic `alpha-D-hexose 6-phosphate`/`D-hexopyranose 6-phosphate` level above it and its own `alpha-` and `beta-` anomers below. Multiple levels coexist: anomers (alpha/beta) and protonation states.

### Reflection questions

1. How many distinct MNX entities are identified for the 31 input identifiers from the **alanine** family?
2. Which entities are **generic** and which are **specific isomers**?
3. Looking at the alanine graph: is *alanine zwitterion* a generic or a specific entity?
4. In a metabolomics dataset, if you have one feature annotated as `chebi:16449` (alanine) and another as `keggC:C00041` (L-alanine), what issue does this create?
5. The **G6P** graph is much denser than the alanine graph - why? What do the multiple levels observed correspond to (anomers x protonation)?
6. In LC-MS without derivatization, a G6P signal is typically annotated as **generic** rather than as alpha-D-G6P or beta-D-G6P. What is the consequence if the analyst defaults to using `keggC:C00668` (alpha) instead of the generic `keggC:C00092`?
