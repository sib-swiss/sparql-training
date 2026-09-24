# SPARQL training

This site teaches you how to query SIB (Swiss Institute of Bioinformatics) resources with SPARQL.
It also looks at RDF and some tools you can use, so it could be used as general introduction to RDF & SPARQL, however these pages will have a life science orientation.

Every example query on these pages runs **directly in your browser**, using the [Comunica](https://comunica.dev/) SPARQL engine loaded as JavaScript. Each example ships with a small, self-contained snippet of Turtle data - both the data and the query are editable, so you can click **Run query**, see real results immediately, tweak either one, and run it again. No account, no server, no installation. Every example dataset can also be drawn out as a graph with the **Visualize as graph** button. You can't break anything on our servers so feel free to experiment here to your ❤️ delight.

## New to SPARQL?

1. [RDF and linked data](intro/tutorial.html) - start here if you've never seen a "triple" before: what RDF is, why it exists, and the "I ❤️ ELIXIR" example built up step by step
2. [RDF file formats](intro/formats.html) - the same triple written four ways (Turtle, N-Triples, RDF/XML, JSON-LD), so you recognise them as the same data
3. [SPARQL basics](basic/tutorial.html) - the classic introductory tutorial (a small people-and-pets dataset) covering triple patterns, property paths, `OPTIONAL`/`FILTER`, aggregation, and federated queries
4. [schema.org & Bioschemas](intro/schema_org.html) - how the same RDF ideas show up as structured data embedded in ordinary web pages, and how Bioschemas applies that to life-science resources

## UniProt: SPARQL and RDF

The [Universal Protein Resource (UniProt)](https://www.uniprot.org/) is a comprehensive resource for protein sequence and annotation data, available as RDF and queryable with SPARQL at [sparql.uniprot.org](https://sparql.uniprot.org/sparql).

1. [Introduction](UniProt/00_introduction.html) - what UniProt RDF and SPARQL are, and how the examples on this site work
2. [Basic information](UniProt/01_basic_information.html) - accession, entry name, status, dates and versions
3. [Protein names](UniProt/02_protein_name.html) - recommended, alternative and EC names
4. [Replicon & genes](UniProt/03_replicon_gene.html) - gene names and the replicon (chromosome, plasmid, organelle) a gene sits on
5. [Taxonomy](UniProt/04_taxonomy.html) - organisms, taxonomic ranks, hierarchy and host organisms
6. [Sequence & isoforms](UniProt/05_sequence.html) - sequences, isoforms, canonical sequence selection, processing (initiator methionine, chains, signal peptides), fragments and mass spectrometry measurements
7. [Domains & topology](UniProt/06_domains_topology.html) - protein domains, zinc fingers, coiled-coils, transmembrane regions and membrane topology
8. [Disease](UniProt/08_disease.html) - disease involvement annotations, linked disease resources, and cross-references to OMIM
9. [Cross-references](UniProt/09_cross_references.html) - links to PDB, UniRef, UniParc and other external databases, including federated queries
10. [Evidence & citations](UniProt/10_evidence_citation.html) - how annotations are backed by evidence tags, protein existence levels, and citation scope
12. [Metabolism & Rhea](UniProt/12_metabolism.html) - catalytic activity, EC classification, and pathway cross-references, queried from the UniProt side
13. [GO terms & keywords](UniProt/13_classification.html) - classifying proteins with Gene Ontology terms and UniProt keywords
14. [Chemistry](UniProt/14_chemistry.html) - ligands, cofactors, PTMs, catalytic activity, and a reference example of an IDSM/Sachem chemical similarity search

## Rhea

[Rhea](https://www.rhea-db.org/) is an expert-curated resource of biochemical reactions, cross-referenced with UniProt, ChEBI, and other resources, queryable at [sparql.rhea-db.org/sparql](https://sparql.rhea-db.org/sparql).

- [Metabolism tutorial](Rhea/rhea.html) - a hands-on walk through querying metabolism data across Rhea, UniProt, ChEBI and more
- [Citations & cross-references](Rhea/citations-xrefs.html) - how Rhea reactions cite PubMed literature and cross-reference KEGG, MetaCyc and other reaction databases

## Tools & ecosystem

- [Tools & ecosystem](tools/tools.html) - a live-generated list of SPARQL/RDF/semantic-web tools, queried straight from Wikidata

## Publishing your own data

- [Tips and tricks: publishing your own RDF](intro/tips-and-tricks.html) - a practical checklist for turning your own life science dataset into RDF: identifiers, reusing vocabulary, content negotiation, SHACL shapes and common pitfalls

## Source

The material is developed in the open at [github.com/sib-swiss/sparql-training](https://github.com/sib-swiss/sparql-training). We used AI (specifically Claude by Anthropic) to build this site, but only to convert prior existing material into this page, adding the visualizations and comunica tools.
