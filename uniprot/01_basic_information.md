<h1>Table of Contents<span class=\"tocSkip\"></span></h1>
<div class=\"toc\"><ul class=\"toc-item\"><li><span><a href=\"#Basic-information\" data-toc-modified-id=\"Basic-information-1\">Basic information</a></span></li><li><span><a href=\"#Required-Python-libraries\" data-toc-modified-id=\"Required-Python-libraries-2\">Required Python libraries</a></span><ul class=\"toc-item\"><li><span><a href=\"#Entry-identifier\" data-toc-modified-id=\"Entry-identifier-2.1\">Entry identifier</a></span><ul class=\"toc-item\"><li><span><a href=\"#Extracting-a-primaryAccession-from-a-IRI\" data-toc-modified-id=\"Extracting-a-primaryAccession-from-a-IRI-2.1.1\">Extracting a primaryAccession from a IRI</a></span></li></ul></li><li><span><a href=\"#UniProt-entry-name-(mnemonic)\" data-toc-modified-id=\"UniProt-entry-name-(mnemonic)-2.2\">UniProt entry name (mnemonic)</a></span><ul class=\"toc-item\"><li><span><a href=\"#Old-mnemonics\" data-toc-modified-id=\"Old-mnemonics-2.2.1\">Old mnemonics</a></span></li></ul></li><li><span><a href=\"#Entry-status\" data-toc-modified-id=\"Entry-status-2.3\">Entry status</a></span></li><li><span><a href=\"#Dates-and-versions\" data-toc-modified-id=\"Dates-and-versions-2.4\">Dates and versions</a></span></li></ul></li></ul></div>"
# Basic information

This notebook aims to show you basic informations of UniProtKB entries:  
- identifier  
- date  
- names "
# Required Python libraries

If you are not familiar with **RDFlib** and **SPARQLWrapper** libraries, please read `00_introduction.ipynb` first. "
## Entry identifier

Each UniProt entry is identified by a [primary accession](https://www.uniprot.org/help/accession_numbers).  
This is the best way to access an entry.  
In the RDF format the primary accession is part of the IRI identifying an entry.  "
### Extracting a primaryAccession from a IRI

This is easy enough with some string manipulation.  
While UniProt primary accession are unique within UniProtKB they may be reused by accident or itentionally by other data sources. If we provided them as strings (not URI) and if you used them in a query that way, you might accidentaly retrieve completly wrong records.  
## UniProt entry name (mnemonic)

The UniProtKB/Swiss-Prot **entry name** consists of up to 11 uppercase alphanumeric characters with a naming convention that can be symbolized as **X_Y**, where:  

- **X** is a mnemonic protein identification code of at most 5 alphanumeric characters  
- The **'_'** sign serves as a separator
- **Y** is a mnemonic species identification code of at most 5 alphanumeric characters

The mnemonic code **X** is an abbreviation of the protein/gene name, which does not necessarily correspond to the recommended protein name or to the gene name.  

See more details on [Entry Name](https://www.uniprot.org/help/entry_name) UniProt documentation 

The RDF format stores the **entry name** in the property `mnemonic` and, for convenience reasons, lists also obsolete entry names with `oldMnemonic` properties."
### Old mnemonics"
## Entry status 

UniProtKB has two sections:  
- UniProtKB/Swiss-Prot: entries that have been manually annotated and reviewed by UniProtKB biocurators 
- UniProtKB/TrEMBL: entries that have been annotated using annotation pipelines 

The RDF format stores the **entry status** in the property `reviewed`."
## Dates and versions

We stores the date when an entry was integrated into UniProtKB in the `created` property and the last modification date of the entry and its current version in the `modified` and `version` properties of the entry. The last modification date of the sequence and its current version are displayed in the `modified` and `version` properties of the `sequence` element/subject.We make use of the international standard date [notation](http://www.w3.org/QA/Tips/iso-date)"
