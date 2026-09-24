# Replicon and genes

This page shows you basic information about **genes** that encode a protein, and the **replicon** (chromosome, plasmid, etc.) those genes sit on.

## Gene names

The name(s) of the gene(s) that encode a protein are linked with an `encodedBy` property. There are four categories of gene names:

- The primary gene name: `skos:prefLabel`.
- Synonyms: `skos:altLabel`.
- Ordered locus names (OLN): `locusName`.
- ORF names: `orfName`.

Resources representing a gene are members of the `up:Gene` class.

```turtle fixture=gene
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix skos: <http://www.w3.org/2004/02/skos/core#>

<Q0JNS6>
  a up:Protein ;
  up:encodedBy <Q0JNS6#51304A4E53360019>, <Q0JNS6#51304A4E5336001A>, <Q0JNS6#51304A4E5336001B> .

<Q0JNS6#51304A4E53360019>
  rdf:type up:Gene ;
  skos:prefLabel "CAM1-1" ;
  skos:altLabel "CAM1" ;
  up:locusName "Os03g0319300", "LOC_Os03g20370" ;
  up:orfName "OsJ_010214" .

<Q0JNS6#51304A4E5336001A>
  rdf:type up:Gene ;
  skos:prefLabel "CAM1-2" ;
  skos:altLabel "CAM" ;
  up:locusName "Os07g0687200", "LOC_Os07g48780" ;
  up:orfName "OJ1150_E04.120-1", "OJ1200_C08.124-1", "OsJ_024630" .

<Q0JNS6#51304A4E5336001B>
  rdf:type up:Gene ;
  skos:prefLabel "CAM1-3" ;
  up:locusName "Os01g0267900", "LOC_Os01g16240" ;
  up:orfName "OsJ_001186", "P0011D01.22" .
```

### Selecting encoding genes

```sparql fixture=gene
PREFIX up: <http://purl.uniprot.org/core/>

SELECT ?protein ?gene
WHERE {
  ?protein a up:Protein ;
           up:encodedBy ?gene .
}
```

### Selecting the recommended gene names

```sparql fixture=gene
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT ?gene ?recommendedGeneName
WHERE {
  ?protein a up:Protein ;
           up:encodedBy ?gene .
  ?gene skos:prefLabel ?recommendedGeneName .
}
```

### Selecting alternative gene names

```sparql fixture=gene
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT ?gene ?altGeneName
WHERE {
  ?protein a up:Protein ;
           up:encodedBy ?gene .
  ?gene skos:altLabel ?altGeneName .
}
```

### Selecting ordered locus names

```sparql fixture=gene
PREFIX up: <http://purl.uniprot.org/core/>

SELECT ?gene ?oln
WHERE {
  ?protein a up:Protein ;
           up:encodedBy ?gene .
  ?gene up:locusName ?oln .
}
```

### Selecting ORF names

```sparql fixture=gene
PREFIX up: <http://purl.uniprot.org/core/>

SELECT ?gene ?orfName
WHERE {
  ?protein a up:Protein ;
           up:encodedBy ?gene .
  ?gene up:orfName ?orfName .
}
```

## Replicons

A protein's gene sits on a *replicon* &mdash; a chromosome, plasmid, or other replicating DNA molecule. UniProt links a protein to a proteome component through the `proteome` property; the replicon name is encoded after the `#` in that IRI.

```turtle fixture=replicon
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix xsd: <http://www.w3.org/2001/XMLSchema#>

<Q71RH2> rdf:type up:Protein ;
  up:reviewed true ;
  up:created "2005-04-12"^^xsd:date ;
  up:modified "2021-04-07"^^xsd:date ;
  up:version 130 ;
  up:mnemonic "TLC3B_HUMAN" ;
  up:proteome <http://purl.uniprot.org/proteomes/UP000005640#Chromosome%2016> .
```

```sparql fixture=replicon
PREFIX up: <http://purl.uniprot.org/core/>

SELECT ?protein ?replicon
WHERE {
  ?protein a up:Protein ;
           up:proteome ?proteomeData .
  BIND(strafter(str(?proteomeData), "#") AS ?replicon)
}
```

```sparql reference="Reference proteome replicons for human, queried live against sparql.uniprot.org"
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX keywords: <http://purl.uniprot.org/keywords/>
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>

SELECT DISTINCT ?proteomeData
WHERE {
  # reviewed entries (UniProtKB/Swiss-Prot)
  ?protein up:reviewed true .
  # restricted to Human taxid
  ?uniprot up:organism taxon:9606 .
  # reference proteome
  ?uniprot up:classifiedWith keywords:1185 .
  ?uniprot up:proteome ?proteomeData .
  BIND(strbefore(str(?proteomeData), "#") AS ?proteome)
  BIND(strafter(str(?proteomeData), "#") AS ?replicon)
}
LIMIT 3
```

### Organelles and plasmids

If a gene is located in an organelle other than the nucleus, and/or on a plasmid rather than a chromosome, the gene location is stored with the `encodedIn` property. If a plasmid has several names, they're listed as multiple `rdfs:label` properties.

```turtle fixture=organelle
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>

<Q01529>
  a up:Protein ;
  up:encodedIn up:Mitochondrion, <Q01529#SIP29DF58> .

<Q01529#SIP29DF58>
  rdf:type up:Plasmid ;
  rdfs:label "pAL2-1" .
```

```sparql fixture=organelle
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?protein ?plasmidOrOrganelle ?label
WHERE {
  ?protein a up:Protein ;
           up:encodedIn ?plasmidOrOrganelle .
  OPTIONAL {
    ?plasmidOrOrganelle rdfs:label ?label .
  }
}
```

Sometimes it's known that a gene is located on a plasmid, but the plasmid's name is unknown. The example below shows how this is represented.

```turtle fixture=unnamed-plasmid
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

<Q7BS32>
  a up:Protein ;
  up:encodedIn <Q7BS32#51374253333200E> .

<Q7BS32#51374253333200E>
  rdf:type up:Plasmid .
```

```sparql fixture=unnamed-plasmid
PREFIX up: <http://purl.uniprot.org/core/>

SELECT ?protein ?type
WHERE {
  ?protein a up:Protein ;
           up:encodedIn ?plasmidOrOrganelle .
  OPTIONAL {
    ?plasmidOrOrganelle a ?type .
  }
}
```
