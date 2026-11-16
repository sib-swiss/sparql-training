# Metabolite identification with MetaNetX

Metabolic databases describe metabolites as substrates and products of biochemical reactions, but the same real-world chemical can turn up under dozens of different identifiers depending on which database produced them. [MetaNetX](https://www.metanetx.org/) reconciles that mess: it groups identifiers from KEGG, ChEBI, HMDB, BiGG, SEED, VMH, MetaCyc, Rhea and SABIO-RK into **sets** of equivalent chemical entities, based on structure, reaction context, cross-references and names. Each set gets an `MNXM` identifier.

This page uses MetaNetX's own public SPARQL endpoint, [rdf.metanetx.org/sparql](https://rdf.metanetx.org/sparql), so every query below runs live against the real production data - there's no small toy fixture standing in for it.

```note
`MNXM` identifiers are useful for curation, but they are **not stable** across MetaNetX releases - don't use them as a persistent identifier in your own data. Keep the original source identifier (ChEBI, HMDB, ...) as the thing you actually store, and use MetaNetX to reconcile on demand.
```

## Mapping identifiers across databases

Within a set, chemical entities related by `mnx:chemXref` are considered equivalent - a spontaneous reaction like an acid-base equilibrium or tautomerism could interconvert them in solution. MetaNetX stores each external identifier as the `rdfs:label` of a small cross-reference node (`mnx:chemXref`), which points back at the `MNXM` entity it belongs to.

Say you're handed a list of identifiers from different databases that are all supposed to be *alanine* in one form or another. A single query with a `VALUES` block can submit all of them at once and show how MetaNetX actually groups them - the same thing the [MetaNetX ID mapper](https://www.metanetx.org/map/ids) does through a web form.

```sparql live="https://rdf.metanetx.org/sparql"
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

All 8 of those identifiers - 6 ChEBI terms, one HMDB term and one KEGG term - collapse onto the exact same `MNXM733981` set. If a dataset carried these as 8 separate features instead of recognizing them as one metabolite, any downstream analysis counting or comparing metabolites would be wrong before it even started.

## Generic entities and their stereoisomers

MetaNetX distinguishes **generic** entities (plain *alanine*, with no stereochemistry specified) from **stereochemically specific** ones (*L-alanine*, *D-alanine*). That relationship is a different predicate, `mnx:chemIsom`, pointing from a generic set to each of its specific isomers.

This matters for data quality: if a dataset contains both generic *alanine* and *L-alanine* as separate features, that's not a duplicate exactly - they're related, but not identical - and it matters which one was actually measured. Extending the identifier list above to the full alanine family (generic, L- and D-) and following `mnx:chemIsom` alongside `mnx:chemXref` shows the relationship directly:

```sparql live="https://rdf.metanetx.org/sparql"
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

### A denser case: glucose 6-phosphate

Glucose 6-phosphate (G6P) is a good example of why this isn't always a simple generic/specific pair. In a standard LC-MS run the alpha and beta anomers usually aren't distinguished, so a measurement is really a generic signal - but MetaNetX also tracks multiple protonation states on top of that, so the real relationship graph for this family is denser than a single generic-to-isomer edge.

Following `mnx:chemIsom` in both directions with a property path pulls out that whole connected component in one query, starting from just the identifiers you have in hand:

```sparql live="https://rdf.metanetx.org/sparql"
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

  # Anchor: MNX entities matching the submitted identifiers
  ?anchor mnx:chemXref ?xref .
  ?xref   rdfs:label   ?query_id .

  # Walk mnx:chemIsom in both directions to reach the whole family
  ?anchor (mnx:chemIsom|^mnx:chemIsom)* ?node .

  # Then list every chemIsom edge out of each node reached that way
  ?node mnx:chemIsom ?target .

  ?node   rdfs:label ?from_id .
  ?target rdfs:label ?to_id .

  OPTIONAL { ?node   rdfs:comment ?from_name . }
  OPTIONAL { ?target rdfs:comment ?to_name   . }
}
ORDER BY ?from_id ?to_id
```

```note
`(mnx:chemIsom|^mnx:chemIsom)*` is a property path: `^` reverses a predicate's direction, `|` is "either", and `*` means "zero or more steps". Together they walk from any starting node to every other node connected to it by `chemIsom` edges, in either direction - which is exactly how you reach siblings and cousins, not just direct parents or children.
```

The result is a small graph, not a line: `D-glucose 6-phosphate` sits between a generic `alpha-D-hexose 6-phosphate`/`D-hexopyranose 6-phosphate` level above it and its own `alpha-` and `beta-` anomers below. If an analysis defaults to annotating every G6P signal as the alpha anomer because that's the identifier that happened to be on hand, it's silently discarding the fact that the measurement couldn't actually distinguish anomers in the first place.

## Generic/specific collisions hide in real feature lists

The same `mnx:chemIsom` relationship is also how you catch a specific data quality problem in your own identifier lists: a dataset that lists both a generic entity and one of its own specific isomers as if they were two independent metabolites. `mnx:chemIsom+` (one or more steps, so it also catches multi-level relationships) finds exactly those pairs when given the identifiers actually present in a dataset:

```sparql live="https://rdf.metanetx.org/sparql"
PREFIX mnx:  <https://rdf.metanetx.org/schema/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?parent_id ?parent_name ?child_id ?child_name
WHERE {
  # Stand-in for "every identifier in your dataset" - compared against itself
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

`chebi:17126` is generic *carnitine*, and `chebi:16347` is one of its specific isomers - so a feature table that includes both under different names actually has one generic measurement and one specific one, not two unrelated metabolites. Run the same two `VALUES` lists against every identifier pair in a real feature table and this is exactly how you'd surface that class of problem at scale, the way MetaNetX workshops have used it against real untargeted-metabolomics feature lists.

```note
A real feature table turns up more than this one pattern. Other common issues: identifiers that are simply malformed or missing from MetaNetX, exact duplicates where two features map to the same `MNXM` set under different names, and disagreements where two identifier columns for the same feature (say HMDB and KEGG) resolve to two *different* sets entirely - often because the KEGG identifier is a broader class than the HMDB one. All of them are variations on the same join shown above: map every identifier to its `MNXM` set, then compare sets instead of raw identifiers.
```

## Best practices for metabolite identification

A few habits make the difference between identifiers that hold up and ones that quietly corrupt an analysis later:

1. A metabolite is a **set** of equivalent chemical entities, not one physical compound - don't confuse it with a single lab standard.
2. Check stereochemistry before trusting an identifier match; prefer source databases that record it explicitly.
3. An identifier's validity depends on context: the analytical method, the organism, the biofluid.
4. Keep one ranked, confident identifier per metabolite rather than a bag of loosely related ones.
5. Don't persist `MNXM` identifiers as stable keys - they can change between MetaNetX releases.
6. Never silently merge a generic entity with one of its specific isomers, even though they share a common `MNXM` parent through `mnx:chemIsom`.

## Further reading

- [MetaNetX](https://www.metanetx.org/) and its [SPARQL endpoint](https://rdf.metanetx.org/) and [ID mapper](https://www.metanetx.org/map/ids)
- [MetaNetX publications](https://www.metanetx.org/mnxdoc/cite.html)
- [Introduction to SPARQL](https://sib-swiss.github.io/SPARQL_course/)
- This page is adapted from a fuller R/Quarto workshop by Florence Mehl (SIB) that also walks through applying this to a real metabolomics feature file - see the [original tutorial](https://github.com/sib-swiss/MetaNetX_metabolites_tutorial)
