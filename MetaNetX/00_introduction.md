# Introduction

Metabolic networks databases consist of metabolites that act as substrates and products of biochemical reactions. However, there exists numerous inconsistencies in name or chemical structures within the different databases, and through their cross-references.

The MetaNetX algorithm reconciles chemical-entity identifiers according to structural information, reaction context, and, to a lesser extent, cross-references and names from source databases. **In MetaNetX, metabolites are defined as sets of chemical-entity identifiers that are considered equivalent**.

Within a set, chemical entities may interconvert via spontaneous reactions - such as acid-base reaction or tautomerism - which spontaneously takes place in aqueous solution (as in cellular metabolism). In addition, entities participating in enzymatically catalyzed reactions are systematically assigned to distinct sets and considered distinct metabolites.

## Why correctly identify metabolites?

In metabolomics, the same chemical entity can have dozens of different identifiers depending on the database used. Without reconciliation, two analyses of the same metabolite may appear to involve different entities - and vice versa.

[MetaNetX](https://www.metanetx.org/) aggregates identifiers from **KEGG, ChEBI, HMDB, BiGG, SEED, VMH, MetaCyc, Rhea, SABIO-RK**, and groups them into **sets** based on:

1. Chemical structure (MOL, SMILES, InChI)
2. Reaction context
3. Cross-references
4. Names

Each set receives a unique `MNXM` identifier. This identifier is useful for curation purposes but **is NOT stable across MetaNetX versions and should not be used as a persistent identifier**.

Relationships between sets are modeled with `mnx:chemIsom`: a generic entity (e.g., *alanine*, without stereochemistry) points to its specific isomers (e.g., *L-alanine*, *D-alanine*).

```note
The original version of this tutorial is a fuller R/Quarto workshop by Florence Mehl (SIB): [MetaNetX_metabolites_tutorial](https://github.com/sib-swiss/MetaNetX_metabolites_tutorial). This version runs the SPARQL directly in your browser, against a small, real extract of MetaNetX's production data embedded in each page, pulled from its public endpoint at [rdf.metanetx.org/sparql](https://rdf.metanetx.org/sparql).
```
