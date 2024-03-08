# Introduction

This series of notebooks aims to show you how to handle UniProt RDF data model and related resources and how to perform SPARQL queries.

**Date**: April 2021  
**Authors**: Swiss-Prot group  


| Notebook                    | Comment         |  
|-----------------------------|-----------------|  
| 00\_introduction.ipynb       |*this notebook* |  
| 01\_basic\_information.ipynb  |accession, mnemo, date,...  |  
| 02\_protein\_name.ipynb       |protein names |  
| 03\_replicon\_gene.ipynb      |replicon and gene names |  
| 04\_taxonomy.ipynb           |organism and taxonomy |  
| 05\_sequence.ipynb           |protein sequence |  
| 06\_annotation.ipynb         |UniProt annotation types |  
| 07\_evidence.ipynb           |UniProt evidence tags |  
| 08\_variant.ipynb            |variant annotation |   
| 09\_metabolism.ipynb         |metabolism.related data: catalyzed reaction, enzyme classification, cofactor |   
# UniProt in RDF/SPARQL  

## UniProt RDF  

### Documentation  
Documentation about the data model is available [here](https://sparql.uniprot.org/.well-known/void). We use standard and community supported vocabularies ([Dublin core](https://en.wikipedia.org/wiki/Dublin_Core), [SKOS](https://en.wikipedia.org/wiki/Simple_Knowledge_Organization_System), etc.) where possible to extend our own [UniProt core vocabulary](https://www.uniprot.org/core/).

### Distribution
[ftp parent directory](https://ftp.uniprot.org/pub/databases/uniprot/current_release/rdf/)  
[README](https://ftp.uniprot.org/pub/databases/uniprot/current_release/rdf/README)  


## UniProt SPARQL endpoint

The UniProt SPARQL endpoint [sparql.uniprot.org](https://sparql.uniprot.org) is free to use. It is updated in sync with the www.uniprot.org and ftp releases.  

**SPARQL** is a W3C standardized query language for the Semantic Web. If you know SQL, it will look familiar to you and you can do similar types of queries with it.  
SPARQL also allows you to query and combine data from a variety of SPARQL endpoints, providing a valuable low-cost alternative to building your own data warehouse. You can combine UniProt data from [sparql.uniprot.org](https://sparql.uniprot.org) with that from other SPARQL endpoints (Rhea, Bgee, OMA, orthoDB, neXtProt, etc).
# Required Python libraries

In this serie of notebooks, we will use two Python libraries:  

* **[RDFLib](https://rdflib.readthedocs.io/en/stable/index.html)** is a pure Python package for working with RDF. RDFLib contains useful APIs for working with RDF.  
See [Getting started with RDFLib](https://rdflib.readthedocs.io/en/stable/gettingstarted.html)  

* **[SPARQLWrapper](https://pypi.org/project/SPARQLWrapper/)** is a simple Python wrapper around a SPARQL service to remotelly execute your queries. It helps in creating the query invokation and, possibly, convert the result into a more manageable format.  
See [SPARQLWrapper documentation](https://sparqlwrapper.readthedocs.io/_/downloads/en/latest/pdf/)  

## RDFlib package

### Read a UniProt entry and save it as a Graph

```python
from rdflib import Graph
g = Graph()
# read P0A877 in RDF/XML format
g.parse(\"https://rest.uniprot.org/uniprotkb/P0A877.rdf\")"
```

You can access to each UniProtKB entry in RDF/XML (.rdf) or turtle (.ttl) format.  
Example: P0A877 entry  
[P0A877.rdf](https://rest.uniprot.org/uniprotkb/P0A877.rdf)  
[P0A877.ttl](https://rest.uniprot.org/uniprotkb/P0A877.ttl)
#### Print the number of \"triples\" in the Graph

```python
print(\"Graph g has {} statements.\".format(len(g)))"
```

#### Print out the entire Graph in the RDF Turtle format

```python
print(g.serialize(format=\"turtle\").decode(\"utf-8\"))"
```

### Contains check

```python
P0A877 = URIRef(\"http://purl.uniprot.org/uniprot/P0A877\")
Protein = URIRef(\"http://purl.uniprot.org/core/Protein\")
if (P0A877, RDF.type, Protein) in g:
    print(\"This graph knows that P0A877 is a Protein!\")
```

### Set Operations on RDFLib Graphs

Addition, subtraction and other set-operations on Graphs:

| operation     | effect                                            |  
|---------------|---------------------------------------------------|   
| G1 + G2       | return new graph with union                       |  
| G1 += G1      | in place union / addition                         |
| G1 - G2       | return new graph with difference                  |
| G1 -= G2      | in place difference / subtraction                 |
| G1 & G2       | intersection (triples in both graphs)             |
| G1 ^ G2       | xor (triples in either G1 or G2, but not in both) |

```python
G = Graph()
print('Parse P0A877 UniProt entry (turtle format)')
G.parse("https://www.uniprot.org/uniprot/P0A877.ttl")
print("-> Graph G has {} statements.".format(len(g)))
print(`)
print('Parse P0A879 UniProt entry and add it to graph G')
G += G.parse("https://www.uniprot.org/uniprot/P0A879.ttl")

print("-> Graph G has {} statements.".format(len(G)))
```

### Basic triple matching

```python
G = Graph()
print('Parse P0A877 UniProt entry (turtle format)')
G.parse(\"https://rest.uniprot.org/uniprotkb/P0A877.ttl\")
print(\"-> Graph G has {} statements.\".format(len(g)))
```

### Querying with SPARQL

```python
Protein = URIRef(\"http://purl.uniprot.org/core/Protein\")
for s, p, o in G.triples((None, RDF.type, Protein)):
    print(\"{} is a Protein\".format(s))"
qres = G.query(
    \"\"\"PREFIX up: <http://purl.uniprot.org/core/>
       SELECT ?protein
       WHERE {
          ?protein rdf:type up:Protein .
       }\"\"\")
print()
for row in qres:
    print(\"%s rdf:type up:Protein\" % row)"
qres = G.query(
    \"\"\"PREFIX up: <http://purl.uniprot.org/core/>
       SELECT ?protein
       WHERE {
          ?protein a up:Protein .
       }\"\"\")

for row in qres:
    print(\"%s a up:Protein\" % row)"
```

## SPARQLWrapper package

```python
from SPARQLWrapper import SPARQLWrapper, JSON

# Set the SPARQL endpoint (UniProt)
sparql = SPARQLWrapper("https://sparql.uniprot.org/sparql")

# Define the query
sparql.setQuery("""
PREFIX up: <http://purl.uniprot.org/core/> 
SELECT ?protein
WHERE {
  ?protein a up:Protein .
}
LIMIT 3
""")

# Set the output format as JSON
sparql.setReturnFormat(JSON)

# Run the SPARQL query and convert to the defined format
results = sparql.query().convert()

# Print the query result
for result in results["results"]["bindings"]:
    print(result["protein"]["value"])
```
