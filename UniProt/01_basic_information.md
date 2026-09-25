# Basic information

This page shows you basic information stored on every UniProtKB entry: identifier, entry name, status, dates and versions.

## Entry identifier

Each UniProt entry is identified by a [primary accession](https://www.uniprot.org/help/accession_numbers) &mdash; the best way to access an entry. In the RDF format, the primary accession is part of the IRI that identifies the entry.

```turtle fixture=entry
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix xsd: <http://www.w3.org/2001/XMLSchema#>
prefix isoform: <http://purl.uniprot.org/isoforms/>

<O22340> rdf:type up:Protein ;
         up:reviewed true ;
         up:created "2001-10-24"^^xsd:date ;
         up:modified "2015-04-01"^^xsd:date ;
         up:version 86 ;
         up:mnemonic "TPSDA_ABIGR" ;
         up:oldMnemonic "TPSD3_ABIGR", "TSD3_ABIGR" ;
         up:replaces <Q94FV9> ;
         up:sequence isoform:O22340-1 .

isoform:O22340-1 rdf:type up:Simple_Sequence ;
         up:modified "1998-01-01"^^xsd:date ;
         up:version 1 .
```

```sparql fixture=entry
PREFIX up: <http://purl.uniprot.org/core/>

SELECT ?protein
WHERE {
  ?protein a up:Protein .
}
```

### Extracting a primaryAccession from an IRI

This is easy enough with some string manipulation. While UniProt primary accessions are unique within UniProtKB, they may be reused by accident or intentionally by other data sources. If you provide them as plain strings (not IRIs) in a query, you might accidentally retrieve completely wrong records &mdash; so prefer matching on the full IRI, and only extract the accession as a string for display.

```sparql fixture=entry
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX uniprotkb: <http://purl.uniprot.org/uniprot/>

SELECT ?primaryAccession ?protein
WHERE {
  ?protein a up:Protein .
  BIND(substr(str(?protein), strlen(str(uniprotkb:)) + 1) AS ?primaryAccession)
}
```

## UniProt entry name (mnemonic)

The UniProtKB/Swiss-Prot **entry name** consists of up to 11 uppercase alphanumeric characters, following the convention **X_Y**, where:

- **X** is a mnemonic protein identification code of at most 5 alphanumeric characters
- **_** separates the two parts
- **Y** is a mnemonic species identification code of at most 5 alphanumeric characters

The mnemonic code **X** is an abbreviation of the protein/gene name, and doesn't necessarily match the recommended protein name or the gene name. See more details in the [Entry Name](https://www.uniprot.org/help/entry_name) documentation.

The RDF format stores the entry name in the `mnemonic` property, and, for convenience, lists obsolete entry names as `oldMnemonic` properties.

```sparql fixture=entry
PREFIX up: <http://purl.uniprot.org/core/>

SELECT ?protein ?mnemonic
WHERE {
  ?protein a up:Protein ;
      up:mnemonic ?mnemonic .
}
```

### Old mnemonics

```sparql fixture=entry
PREFIX up: <http://purl.uniprot.org/core/>

SELECT ?protein (GROUP_CONCAT(?oldMnemonic; separator=" and ") AS ?oldMnemonics)
WHERE {
  ?protein a up:Protein ;
      up:oldMnemonic ?oldMnemonic .
}
GROUP BY ?protein
```

## Entry status

UniProtKB has two sections:

- **UniProtKB/Swiss-Prot**: entries that have been manually annotated and reviewed by UniProtKB biocurators
- **UniProtKB/TrEMBL**: entries that have been annotated using automated annotation pipelines

The RDF format stores the entry status in the `reviewed` property.

```turtle fixture=sp-entry title="A Swiss-Prot entry"
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix xsd: <http://www.w3.org/2001/XMLSchema#>

<O22340> rdf:type up:Protein ;
         up:reviewed true ;
         up:created "2001-10-24"^^xsd:date ;
         up:modified "2015-04-01"^^xsd:date ;
         up:version 86 ;
         up:mnemonic "TPSDA_ABIGR" .
```

```sparql fixture=sp-entry
PREFIX up: <http://purl.uniprot.org/core/>

SELECT ?protein ?entryName ?reviewed
WHERE {
  ?protein a up:Protein ;
      up:mnemonic ?entryName ;
      up:reviewed ?reviewed .
}
```

```turtle fixture=tr-entry title="A TrEMBL entry"
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix xsd: <http://www.w3.org/2001/XMLSchema#>

<A0A024R563> rdf:type up:Protein ;
         up:reviewed false ;
         up:created "2014-07-09"^^xsd:date ;
         up:modified "2020-10-07"^^xsd:date ;
         up:version 30 ;
         up:mnemonic "A0A024R563_HUMAN" .
```

```sparql fixture=tr-entry
PREFIX up: <http://purl.uniprot.org/core/>

SELECT ?protein ?entryName ?reviewed
WHERE {
  ?protein a up:Protein ;
      up:mnemonic ?entryName ;
      up:reviewed ?reviewed .
}
```

## Dates and versions

The date an entry was integrated into UniProtKB is stored in the `created` property; the last modification date and current version of the entry are stored in the `modified` and `version` properties. The last modification date and current version of the *sequence* are stored the same way, but on the `sequence` resource. Dates use the international standard [ISO 8601 notation](http://www.w3.org/QA/Tips/iso-date).

```sparql fixture=entry
PREFIX up: <http://purl.uniprot.org/core/>

SELECT ?protein ?created ?modified ?version
WHERE {
  ?protein a up:Protein ;
           up:created ?created ;
           up:modified ?modified ;
           up:version ?version .
}
```
