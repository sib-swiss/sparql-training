---
description: >-
  Shows how UniProt models protein names in RDF: recommended, submitted and
  alternative names, full names and short names, and the specialized name
  categories such as allergen, CD antigen and EC names.
keywords: "UniProt, SPARQL, protein names, recommendedName, alternativeName, EC number"
audience:
  "@type": Audience
  audienceType: Biologists and Computer Scientists
author:
  - "@type": Person
    "@id": https://orcid.org/0000-0002-7449-1266
    name: Jerven Bolleman
    affiliation:
      "@type": Organization
      "@id": https://ror.org/002n09z45
      name: SIB Swiss Institute of Bioinformatics
  - "@type": Organization
    "@id": https://ror.org/002n09z45
    name: SIB Swiss Institute of Bioinformatics
competencyRequired: SPARQL
educationalLevel: Beginner
learningResourceType: tutorial
teaches:
  - Query a protein's recommended full name and short name
  - Retrieve EC numbers attached to a recommended name
  - Query alternative protein names distinct from the recommended one
timeRequired: PT15M
---

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

Adapted from [sparql-examples UniProt/104](https://sib-swiss.github.io/sparql-examples/examples/UniProt/104_uniprot_recomended_protein_full_name).

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

Adapted from [sparql-examples UniProt/105](https://sib-swiss.github.io/sparql-examples/examples/UniProt/105_uniprot_recomended_protein_short_name).

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

Adapted from [sparql-examples UniProt/91](https://sib-swiss.github.io/sparql-examples/examples/UniProt/91_uniprot_alternative_protein_full_name).

```sparql fixture=names
PREFIX up: <http://purl.uniprot.org/core/>

SELECT ?protein ?fullName
WHERE {
  ?protein a up:Protein ;
           up:alternativeName ?alternativeName .
  ?alternativeName up:fullName ?fullName .
}
```
