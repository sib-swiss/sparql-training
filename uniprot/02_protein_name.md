<h1>Table of Contents<span class=\"tocSkip\"></span></h1>
<div class=\"toc\"><ul class=\"toc-item\"><li><span><a href=\"#UniProt-protein-names\" data-toc-modified-id=\"UniProt-protein-names-1\">UniProt protein names</a></span></li><li><span><a href=\"#Required-Python-libraries\" data-toc-modified-id=\"Required-Python-libraries-2\">Required Python libraries</a></span></li><li><span><a href=\"#Protein-Names\" data-toc-modified-id=\"Protein-Names-3\">Protein Names</a></span><ul class=\"toc-item\"><li><ul class=\"toc-item\"><li><span><a href=\"#Selecting-a-recommended-full-name\" data-toc-modified-id=\"Selecting-a-recommended-full-name-3.0.1\">Selecting a recommended full name</a></span></li><li><span><a href=\"#Selecting-a-recommended-short-name\" data-toc-modified-id=\"Selecting-a-recommended-short-name-3.0.2\">Selecting a recommended short name</a></span></li><li><span><a href=\"#Selecting-recommended-EC-numbers\" data-toc-modified-id=\"Selecting-recommended-EC-numbers-3.0.3\">Selecting recommended EC numbers</a></span></li><li><span><a href=\"#Selecting-alternative-names\" data-toc-modified-id=\"Selecting-alternative-names-3.0.4\">Selecting alternative names</a></span></li></ul></li></ul></li></ul></div>"
# UniProt protein names

This notebook aims to show you basic informations on **protein names**.   

Protein names are modeled as `name` resources in the RDF format. 

There are 3 main types of protein names:  

 1. The name recommended by the UniProt consortium: linked to a `recommendedName` element/property in the RDF format.  
 2. Names provided by the submitter of the underlying nucleotide sequence (in UniProtKB/TrEMBL only):
    Shown in `submittedName` elements/properties in the RDF format.  
 3. Alternative names:  
    Shown in `alternativeName` elements/properties in the RDF format.  

These types are further categorized into:  

 1. Full name:  
    Shown in a `fullName` element/property in the RDF format.  
 2. Abbreviations or acronyms of the full name:  
    Shown in `shortName` elements/properties in the RDF format.  

There are furthermore a few categories with more specific meanings:  

  1. Name of an allergen:  
     Shown in an `allergenName` element/property in the RDF format.  
  2. Names of CD antigens:  
     Shown in `CdAntigenName` elements/properties in the RDF format.  
  3. Name used in a biotechnological context:  
     Shown in a `biotechName` element/property in the RDF format.  
  4. International nonproprietary names:  
     Shown in `innName` elements/properties in the RDF format.  
  5. Enzyme Commission EC numbers.  
     This links a name with the EC number that clasifies the enzymatic activity of this entry.  
     See the notebook `XX_metabolism.ipynb` for more details.  
# Required Python libraries

If you are not familiar with **RDFlib** and **SPARQLWrapper** libraries, please read `00_introduction.ipynb` first. "
# Protein Names"
### Selecting a recommended full name"
### Selecting a recommended short name"
### Selecting recommended EC numbers"
### Selecting alternative names"
