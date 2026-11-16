# MetaNetX: metabolite identification

[MetaNetX](https://www.metanetx.org/) reconciles metabolite identifiers across KEGG, ChEBI, HMDB, BiGG, SEED, VMH, MetaCyc, Rhea and SABIO-RK into equivalence sets, so the same real-world chemical can be recognized no matter which source database an identifier came from.

We provide a SPARQL endpoint at: [rdf.metanetx.org/sparql](https://rdf.metanetx.org/sparql).

# What is SPARQL?
[SPARQL](https://en.wikipedia.org/wiki/SPARQL) (the SPARQL Protocol and RDF Query Language) is a query language for
[RDF](https://en.wikipedia.org/wiki/Resource_Description_Framework), a core Semantic Web technology from the W3C.

# Tutorial

Read it on the [published site](https://sib-swiss.github.io/sparql-training/MetaNetX/metabolites.html), or as plain Markdown in [metabolites.md](./metabolites.md). Every query runs live against the real MetaNetX SPARQL endpoint.

This tutorial is adapted from a fuller R/Quarto workshop by Florence Mehl (SIB): [MetaNetX_metabolites_tutorial](https://github.com/sib-swiss/MetaNetX_metabolites_tutorial), which also walks through applying this to a real metabolomics feature file.
