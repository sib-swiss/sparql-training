<h1>Table of Contents<span class=\"tocSkip\"></span></h1>
<div class=\"toc\"><ul class=\"toc-item\"><li><span><a href=\"#Taxonomy\" data-toc-modified-id=\"Taxonomy-1\">Taxonomy</a></span></li><li><span><a href=\"#Import-Python-package\" data-toc-modified-id=\"Import-Python-package-2\">Import Python package</a></span><ul class=\"toc-item\"><li><span><a href=\"#Organism-identifier\" data-toc-modified-id=\"Organism-identifier-2.1\">Organism identifier</a></span></li><li><span><a href=\"#Retrieve-the-taxon-(organism-id)-of-a-protein\" data-toc-modified-id=\"Retrieve-the-taxon-(organism-id)-of-a-protein-2.2\">Retrieve the taxon (organism id) of a protein</a></span></li><li><span><a href=\"#Taxonomy-data\" data-toc-modified-id=\"Taxonomy-data-2.3\">Taxonomy data</a></span><ul class=\"toc-item\"><li><span><a href=\"#Retrieve-the-rank-and-the-scientific-name-of-the-organism\" data-toc-modified-id=\"Retrieve-the-rank-and-the-scientific-name-of-the-organism-2.3.1\">Retrieve the rank and the scientific name of the organism</a></span></li></ul></li><li><span><a href=\"#Taxonomy-hierarchy\" data-toc-modified-id=\"Taxonomy-hierarchy-2.4\">Taxonomy hierarchy</a></span></li><li><span><a href=\"#Host-organisms\" data-toc-modified-id=\"Host-organisms-2.5\">Host organisms</a></span></li></ul></li><li><span><a href=\"#How-to-retrieve-all-UniProt-entries-for-a-given-organism-?\" data-toc-modified-id=\"How-to-retrieve-all-UniProt-entries-for-a-given-organism-?-3\"><span style=\"color: red\">How to retrieve all UniProt entries for a given organism ?</span></a></span></li><li><span><a href=\"#How-to-retrieve-the-lineage-of-an-organism-?\" data-toc-modified-id=\"How-to-retrieve-the-lineage-of-an-organism-?-4\"><span style=\"color: red\">How to retrieve the lineage of an organism ?</span></a></span></li><li><span><a href=\"#How-to-retrieve-all-organisms-with-at-least-one-entry-in-UniProtKB/Swiss-Prot-?\" data-toc-modified-id=\"How-to-retrieve-all-organisms-with-at-least-one-entry-in-UniProtKB/Swiss-Prot-?-5\"><span style=\"color: red\">How to retrieve all organisms with at least one entry in UniProtKB/Swiss-Prot ?</span></a></span></li></ul></div>"
# Taxonomy

This notebook aims to show you how taxonomy data are represented in UniProt.  

UniProtKB taxonomy data is manually curated (see details [here](https://www.uniprot.org/taxonomy/)).


The organism which is the source of a protein sequence is identified by a unique identifier (often called _taxon_ or _taxid_) from the [NCBI taxonomy](https://www.ncbi.nlm.nih.gov/taxonomy) database.   
This is the only taxonomy information that is stored in the RDF format of a UniProtKB entry. However, the full NCBI taxonomy is modelled and available as well.   "
# Import Python package

First we import rdflib which is a well known python library that gives RDF and its query language support to Python 3 (and Python 2).  
## Organism identifier

The organism identifier (taxon) is stored in the `organism` property of a uniprot entry.  "
## Retrieve the taxon (organism id) of a protein"
## Taxonomy data

**Properties**:
- `rank`  
- `mnemonic`  
- `scientificName`  
- `commonName`  
- `otherName`  
- `seeAlso` (xref)  
- `subClassOf` (hierarchy)   
- <span style=\"color:red\">narrowerTransitive</span>  
- <span style=\"color:red\">partOfLineage</span>  "
### Retrieve the rank and the scientific name of the organism

The rank and scientificName are by far the most queried properties of a taxon."
## Taxonomy hierarchy

Querying the taxonomic hierarchy is straightforward using the `rdfs:subClassOf` property.  
In our _taxon_ example shown previously:  
<9605> rdfs:subClassOf <9606>  
<9606> rdfs:subClassOf <207598>  

In order to facilitate the search, the UniProt SPARQL endpoint materialized all relationships. In other words, you don't need to use SPARQL property path to query the taxonomy classification.  
Note that if you use other endpoints you might need to use `rdfs:subClassOf+` to query by higher levels of taxonomy.
## Host organisms

Sometimes an organism is known to be hosted inside an other one (_e.g._ parasite, symbiont, infection).   
We defined the `host` property to link an organism to its host.  "
# <span style=\"color:red\">How to retrieve all UniProt entries for a given organism ?</span>"
# <span style=\"color:red\">How to retrieve the lineage of an organism ?</span>"
# <span style=\"color:red\">How to retrieve all organisms with at least one entry in UniProtKB/Swiss-Prot ?</span>"
