# MetaNetX: metabolite identification

[MetaNetX](https://www.metanetx.org/) reconciles metabolite identifiers across KEGG, ChEBI, HMDB, BiGG, SEED, VMH, MetaCyc, Rhea and SABIO-RK into equivalence sets, so the same real-world chemical can be recognized no matter which source database an identifier came from.

We provide a SPARQL endpoint at: [rdf.metanetx.org/sparql](https://rdf.metanetx.org/sparql).

# What is SPARQL?
[SPARQL](https://en.wikipedia.org/wiki/SPARQL) (the SPARQL Protocol and RDF Query Language) is a query language for
[RDF](https://en.wikipedia.org/wiki/Resource_Description_Framework), a core Semantic Web technology from the W3C.

# Tutorial

Read it on the [published site](https://sib-swiss.github.io/sparql-training/), or as plain Markdown here, one file per topic - following the same structure as the [original tutorial](https://github.com/sib-swiss/MetaNetX_metabolites_tutorial) it's adapted from:

1. [Introduction](00_introduction.md) ([français](00_introduction.fr.md))
2. [ID mapper](01_id_mapping.md) ([français](01_id_mapping.fr.md))
3. [Isomer relationships](02_isomer_relationships.md) ([français](02_isomer_relationships.fr.md))
4. [Application to real data](03_application_to_real_data.md) ([français](03_application_to_real_data.fr.md))

Each French page is paired with its English counterpart via a language-switch link on the published site. Every query runs in your browser against a small, real extract of MetaNetX's production data embedded in the page - the same alanine, glucose 6-phosphate and carnitine families the original workshop used, pulled straight from [rdf.metanetx.org/sparql](https://rdf.metanetx.org/sparql).

The prose stays as close to the original wording as this format allows; it's adapted from a fuller R/Quarto workshop by Florence Mehl (SIB): [MetaNetX_metabolites_tutorial](https://github.com/sib-swiss/MetaNetX_metabolites_tutorial), which also walks through applying this to a real metabolomics feature file.
