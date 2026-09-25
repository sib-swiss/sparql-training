# SPARQL training

This site teaches you how to query SIB (Swiss Institute of Bioinformatics) resources &mdash; UniProt and Rhea &mdash; with SPARQL.

Every example query on these pages runs **directly in your browser**, using the [Comunica](https://comunica.dev/) SPARQL engine loaded as JavaScript. Each example ships with a small, self-contained snippet of Turtle data &mdash; both the data and the query are editable, so you can click **Run query**, see real results immediately, tweak either one, and run it again. No account, no server, no installation. Every example dataset can also be drawn out as a graph with the **Visualize as graph** button.

## New to SPARQL?

- [SPARQL basics](basic/tutorial.html) &mdash; the classic introductory tutorial (a small people-and-pets dataset) covering triple patterns, property paths, `OPTIONAL`/`FILTER`, aggregation, and federated queries

## UniProt: SPARQL and RDF

The [Universal Protein Resource (UniProt)](https://www.uniprot.org/) is a comprehensive resource for protein sequence and annotation data, available as RDF and queryable with SPARQL at [sparql.uniprot.org](https://sparql.uniprot.org/sparql).

1. [Introduction](UniProt/00_introduction.html) &mdash; what UniProt RDF and SPARQL are, and how the examples on this site work
2. [Basic information](UniProt/01_basic_information.html) &mdash; accession, entry name, status, dates and versions
3. [Protein names](UniProt/02_protein_name.html) &mdash; recommended, alternative and EC names
4. [Replicon & genes](UniProt/03_replicon_gene.html) &mdash; gene names and the replicon (chromosome, plasmid, organelle) a gene sits on
5. [Taxonomy](UniProt/04_taxonomy.html) &mdash; organisms, taxonomic ranks, hierarchy and host organisms
6. [Chemistry](UniProt/14_chemistry.html) &mdash; ligands, cofactors, PTMs, catalytic activity, and a federated IDSM/Sachem chemical similarity search

## Rhea: metabolic reactions

[Rhea](https://www.rhea-db.org/) is an expert-curated resource of biochemical reactions, cross-referenced with UniProt, ChEBI, and other resources, queryable at [sparql.rhea-db.org/sparql](https://sparql.rhea-db.org/sparql).

- [Metabolism tutorial (SWAT4HCLS 2019)](rhea/rhea.html) &mdash; a hands-on walk through querying metabolism data across Rhea, UniProt, ChEBI and more

## Source

The material is developed in the open at [github.com/sib-swiss/sparql-training](https://github.com/sib-swiss/sparql-training).
