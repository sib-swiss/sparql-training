<h1>Table of Contents<span class=\"tocSkip\"></span></h1>
<div class=\"toc\"><ul class=\"toc-item\"><li><span><a href=\"#Replicon-and-genes\" data-toc-modified-id=\"Replicon-and-genes-2\">Replicon and genes</a></span></li><li><span><a href=\"#Required-Python-libraries\" data-toc-modified-id=\"Required-Python-libraries-3\">Required Python libraries</a></span></li><li><span><a href=\"#Gene-Names\" data-toc-modified-id=\"Gene-Names-4\">Gene Names</a></span><ul class=\"toc-item\"><li><ul class=\"toc-item\"><li><span><a href=\"#Selecting-encoding-genes\" data-toc-modified-id=\"Selecting-encoding-genes-4.0.1\">Selecting encoding genes</a></span></li><li><span><a href=\"#Selecting-the-recommended-gene-names\" data-toc-modified-id=\"Selecting-the-recommended-gene-names-4.0.2\">Selecting the recommended gene names</a></span></li><li><span><a href=\"#Selecting-alternative-gene-names\" data-toc-modified-id=\"Selecting-alternative-gene-names-4.0.3\">Selecting alternative gene names</a></span></li><li><span><a href=\"#Selecting-ordered-locus-names\" data-toc-modified-id=\"Selecting-ordered-locus-names-4.0.4\">Selecting ordered locus names</a></span></li><li><span><a href=\"#Selecting-ORF-names\" data-toc-modified-id=\"Selecting-ORF-names-4.0.5\">Selecting ORF names</a></span></li></ul></li></ul></li><li><span><a href=\"#Replicons\" data-toc-modified-id=\"Replicons-5\">Replicons</a></span><ul class=\"toc-item\"><li><ul class=\"toc-item\"><li><span><a href=\"#Organelles-and-Plasmids\" data-toc-modified-id=\"Organelles-and-Plasmids-5.0.1\">Organelles and Plasmids</a></span></li></ul></li></ul></li></ul></div>"
# Replicon and genes

This notebook aims to show you basic informations on **genes** that encode the protein and their replicon (chromosome, plasmid, etc).   "
# Required Python libraries

If you are not familiar with **RDFlib** and **SPARQLWrapper** libraries, please read `00_introduction.ipynb` first. "
# Gene Names

This notebook aims to show you basic informations on **genes** that encode the protein.   

The name(s) of the gene(s) that encode the protein by a separate `encodedBy` properties.

There are four categories of gene names.  
- The primary gene name is represented with a `skos:prefLabel` property
- The synonyms with `skos:altLabel` property. 
- Ordered locus names (OLN) with `locusName` property.
- ORF names with `orfName` property.

The resources representing a gene are members of the `up:Gene` class."
### Selecting encoding genes"
### Selecting the recommended gene names"
### Selecting alternative gene names"
### Selecting ordered locus names"
### Selecting ORF names"
# Replicons"
### Organelles and Plasmids

If a gene is located in an organelle other than the nucleus, or/and on a plasmid rather than a chromosome, the gene location is stored in encodedIn properties. Note that if a plasmid has several names, they are listed as multiple `rdfs:label` properties."
Sometimes it is known that a gene is located on a plasmid, but the name of the plasmid is unknown. The example below shows how this is represented."
