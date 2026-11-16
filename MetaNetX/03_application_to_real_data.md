# Application to real data

## Context

You are provided with a metabolomics feature file ([`Features_METABOLOMICS.xlsx`](https://github.com/sib-swiss/MetaNetX_metabolites_tutorial/blob/master/Features_METABOLOMICS.xlsx)). It contains columns `HMDB`, `KEGG`, and `chebi_id`. The goal is to detect **4 types of data quality issues** commonly encountered in metabolomics:

| Type | Problem | Example in the file |
|------|--------|-------------------|
| **1** | Invalid / malformed identifier -> not mapped in MNX | `Glucose_bad_id` (`HMDB00122`), `Pyruvate_typo` (`HMDB000243` + non-existent ChEBI) |
| **2** | Exact duplicate: same MNX entity, different annotation | `Ala` vs `Ala_2` |
| **3** | HMDB != KEGG -> two different MNX entities (KEGG too generic) | `lysoPC a C16:0`, `C16:1`... share `C04230` |
| **4** | Generic / specific (parent-child relationship via `mnx:chemIsom+`) | `Carnitine_DL` vs `C0` (L-Carnitine) |

```note
The original version of this exercise joins this table against the full feature spreadsheet above and a complete R/tidyverse pipeline - see the [original tutorial](https://github.com/sib-swiss/MetaNetX_metabolites_tutorial) for that. TYPE 4, demonstrated below, is the one of the four that's pure SPARQL: `Carnitine_DL` and `C0` (L-carnitine) both appear in that spreadsheet, sharing the KEGG identifier `C00487`.
```

## TYPE 1 - Invalid identifiers (not mapped in MetaNetX)

```note
A malformed identifier (incorrect number of digits, wrong prefix, non-existent ID) will not match any entry in MetaNetX. This is the simplest issue to detect, and also the easiest to fix.
```

## TYPE 2 - Exact duplicates (same MNX entity, different names)

```note
Two features are considered duplicates if they share the same MNX identifier through any source (HMDB, KEGG, or ChEBI). This can occur when an internal database contains multiple entries for the same compound with slightly different names.
```

## TYPE 3 - Cross-database inconsistencies (distinct MNX entities)

```note
A feature is considered inconsistent if two identifiers from different databases (here HMDB and KEGG) map to different MNX entities. A common cause is that the KEGG identifier corresponds to a generic class (e.g., `C04230` = all lysophosphatidylcholines), while the HMDB entry is specific to a precise molecular species.
```

## TYPE 4 - Parent-child relationships (generic / specific via `mnx:chemIsom+`)

```note
The most subtle issue: two features may map to distinct MNX entities (i.e., not direct duplicates), but one is the generic parent of the other through the `mnx:chemIsom+` relationship. Typical examples include *DL-carnitine* (generic) vs *L-carnitine* (specific), and *DL-leucine* vs *L-leucine*.

The query uses `mnx:chemIsom+` (a transitive path) to also detect relationships that span multiple levels of depth.
```

```turtle fixture=metanetx-ex3 title="Carnitine (MetaNetX, real data extract)"
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
  # Stand-in for "every identifier in your dataset" - compared against itself
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

`Carnitine_DL` (`keggC:C00487`, generic *carnitine*) and `C0` (`chebi:16347`, the specific isomer labeled *(R)-carnitine* in MetaNetX - L-carnitine clinically) are in different MNX sets, linked by `mnx:chemIsom+`: exactly a TYPE 4 relationship.

### Reflection questions

1. **TYPE 1** - `HMDB00122` is malformed. What is the correct identifier? How can this type of error be avoided when building an internal database?
2. **TYPE 2** - `Ala` and `Ala_2` map to the same MNX entity. How could this duplication bias a differential analysis if it is not detected?
3. **TYPE 3** - Several lysoPCs share the KEGG identifier `C04230`. Why does KEGG use a single identifier for all these species? Which database (HMDB or KEGG) is preferable for complex lipids?
4. **TYPE 4** - `Carnitine_DL` and `C0` (L-Carnitine) share the same KEGG identifier `C00487`. After mapping to MetaNetX, are they in the same MNX set or in sets linked by `chemIsom+`? What difference does this make for biological analysis?

## Summary - best practices for metabolite identification

Based on the course slides (Florence Mehl / SIB) and the exercises:

1. **Distinguish the metabolite (set) from the chemical compound (individual).** A metabolite in a metabolic network is a *set* of molecules - it should not be confused with an individual chemical compound (e.g., a laboratory standard).
2. **Use only identifiers where name and structure are consistent.** Check stereochemistry. Prefer databases that provide both.
3. **Specify the context of validity.** An identifier is valid for a given analytical method, organism, and biofluid.
4. **Define a reference identifier and rank by confidence.** Do not provide a bag of imprecise identifiers: a short, ordered list is better.
5. **Do not use MNXM identifiers as stable identifiers.** They are not stable across releases. Use representative identifiers from source databases (ChEBI, HMDB...).
6. **Never mix generic entities and specific isomers.** `chebi:16449` (alanine) != `chebi:16977` (L-alanine) - even if they share a common MNX parent.

## Documentation

1. [Introduction to SPARQL](https://sib-swiss.github.io/SPARQL_course/)
2. [MetaNetX publications](https://www.metanetx.org/mnxdoc/cite.html)
3. This tutorial is adapted from the fuller R/Quarto original by Florence Mehl (SIB): [MetaNetX_metabolites_tutorial](https://github.com/sib-swiss/MetaNetX_metabolites_tutorial)
