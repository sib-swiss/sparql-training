# Introduction

This series of pages shows you how UniProt's RDF data model works and how to query it with SPARQL.

**Authors**: SIB Swiss-Prot group

| Page | Comment |
|------|---------|
| [00 Introduction](00_introduction.html) | *this page* |
| [01 Basic information](01_basic_information.html) | accession, mnemonic, dates, ... |
| [02 Protein names](02_protein_name.html) | protein names |
| [03 Replicon & genes](03_replicon_gene.html) | replicon and gene names |
| [04 Taxonomy](04_taxonomy.html) | organism and taxonomy |
| [05 Sequence & isoforms](05_sequence.html) | sequences, isoforms, canonical sequence, processing, fragments, mass spectrometry |
| [09_cross_references](09_cross_references.html) | Cross References and links to other databases |
| [14 Chemistry](14_chemistry.html) | ligands, catalytic activity, cofactors, similarity search |

## UniProt RDF

### Documentation

Documentation about the data model is available [here](https://sparql.uniprot.org/.well-known/void). UniProt uses standard, community-supported vocabularies ([Dublin Core](https://en.wikipedia.org/wiki/Dublin_Core), [SKOS](https://en.wikipedia.org/wiki/Simple_Knowledge_Organization_System), etc.) where possible, extended by the [UniProt core vocabulary](https://www.uniprot.org/core/).

### Distribution

- [FTP parent directory](https://ftp.uniprot.org/pub/databases/uniprot/current_release/rdf/)
- [README](https://ftp.uniprot.org/pub/databases/uniprot/current_release/rdf/README)

## UniProt SPARQL endpoint

The UniProt SPARQL endpoint [sparql.uniprot.org](https://sparql.uniprot.org) is free to use. It is updated in sync with the www.uniprot.org and FTP releases.

**SPARQL** is a W3C-standardized query language for the Semantic Web. If you know SQL, it will look familiar, and you can do similar kinds of queries with it. SPARQL also lets you combine data from a variety of SPARQL endpoints, providing a low-cost alternative to building your own data warehouse &mdash; you can combine UniProt data from [sparql.uniprot.org](https://sparql.uniprot.org) with data from other SPARQL endpoints (Rhea, Bgee, OMA, OrthoDB, neXtProt, etc.).

You can also fetch a single UniProtKB entry directly in RDF/XML or Turtle format, without going through the SPARQL endpoint at all, e.g. [P0A877.rdf](https://rest.uniprot.org/uniprotkb/P0A877.rdf) or [P0A877.ttl](https://rest.uniprot.org/uniprotkb/P0A877.ttl).

## How these pages work

Every runnable example on this site is a small Turtle snippet (a tiny, self-contained excerpt of what a real UniProt entry looks like in RDF) paired with a SPARQL query. Click **Run query** and the query runs immediately, in your browser, against that snippet &mdash; powered by [Comunica](https://comunica.dev/), a SPARQL engine written in JavaScript. Nothing is sent to a server. Both the data and the query are editable, so feel free to change either one and run it again. Click **Visualize as graph** on the data box to see it drawn out as a graph of resources and relationships. Try it all below.

```turtle fixture=intro-example
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

<P0A877> a up:Protein ;
  up:mnemonic "TRPE_ECOLI" ;
  up:reviewed true .
```

```sparql fixture=intro-example
PREFIX up: <http://purl.uniprot.org/core/>

SELECT ?protein
WHERE {
  ?protein a up:Protein .
}
```

The examples on the following pages build on the exact same idea, using slightly larger fixtures that mirror the shape of real UniProtKB entries. Once you're comfortable with a pattern, try it for real against the full dataset at [sparql.uniprot.org](https://sparql.uniprot.org/sparql).
