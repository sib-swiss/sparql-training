# UniProt protein names

This page shows you basic information about **protein names**.

Protein names are modeled as `name` resources in the RDF format. There are three main types of protein names:

1. The name recommended by the UniProt consortium: `recommendedName`.
2. Names provided by the submitter of the underlying nucleotide sequence (UniProtKB/TrEMBL only): `submittedName`.
3. Alternative names: `alternativeName`.

These are further categorized into:

1. Full name: `fullName`.
2. Abbreviations or acronyms of the full name: `shortName`.

There are also a few categories with more specific meanings:

- Name of an allergen: `allergenName`.
- Names of CD antigens: `cdAntigenName`.
- Name used in a biotechnological context: `biotechName`.
- International nonproprietary names: `innName`.
- Enzyme Commission (EC) numbers, linking a name with the enzymatic activity it catalyzes: `ecName`.

## Protein names

```turtle fixture=names
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix isoform: <http://purl.uniprot.org/isoforms/>
prefix enzyme: <http://purl.uniprot.org/enzyme/>

<P12820>
  a up:Protein ;
  up:recommendedName <P12820#SIP30A> ;
  up:alternativeName <P12820#SIP62B>, <P12820#SIPE4F>, <P12820#SIPFE1> ;
  up:enzyme enzyme:3.2.1.-, enzyme:3.4.15.1 ;
  up:sequence isoform:P12820-1 .

<P12820#SIP30A>
  rdf:type up:Structured_Name ;
  up:fullName "Angiotensin-converting enzyme" ;
  up:shortName "ACE" ;
  up:ecName "3.2.1.-", "3.4.15.1" .

<P12820#SIP62B>
  rdf:type up:Structured_Name ;
  up:fullName "Dipeptidyl carboxypeptidase I" .

<P12820#SIPE4F>
  rdf:type up:Structured_Name ;
  up:fullName "Kininase II" .

<P12820#SIPFE1>
  rdf:type up:Structured_Name ;
  up:cdAntigenName "CD143" .
```

### Selecting a recommended full name

```sparql fixture=names
PREFIX up: <http://purl.uniprot.org/core/>

SELECT ?protein ?fullName
WHERE {
  ?protein a up:Protein ;
           up:recommendedName ?recommendedName .
  ?recommendedName up:fullName ?fullName .
}
```

### Selecting a recommended short name

```sparql fixture=names
PREFIX up: <http://purl.uniprot.org/core/>

SELECT ?protein ?shortName
WHERE {
  ?protein a up:Protein ;
           up:recommendedName ?recommendedName .
  ?recommendedName up:shortName ?shortName .
}
```

### Selecting recommended EC numbers

```sparql fixture=names
PREFIX up: <http://purl.uniprot.org/core/>

SELECT ?protein ?ecName
WHERE {
  ?protein a up:Protein ;
           up:recommendedName ?recommendedName .
  ?recommendedName up:ecName ?ecName .
}
```

### Selecting alternative names

```sparql fixture=names
PREFIX up: <http://purl.uniprot.org/core/>

SELECT ?protein ?fullName
WHERE {
  ?protein a up:Protein ;
           up:alternativeName ?alternativeName .
  ?alternativeName up:fullName ?fullName .
}
```
