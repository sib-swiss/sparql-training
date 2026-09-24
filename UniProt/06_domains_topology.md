# Domains and topology

This page shows you how UniProt records **protein domains**, sequence **regions** (zinc fingers, coiled-coils, transmembrane segments), and **membrane topology**.

All of these are represented as `up:annotation` resources on the protein, each with its own annotation class (`up:Domain_Extent_Annotation`, `up:Transmembrane_Annotation`, `up:Zinc_Finger_Annotation`, `up:Coiled_Coil_Annotation`, ...). Where a feature has a position on the sequence, it's attached via `up:range`, using the [FALDO](http://biohackathon.org/resource/faldo) ontology's `faldo:begin`/`faldo:end` &mdash; each pointing to a position resource with a `faldo:position` (an integer, 1-based).

The queries on this page are adapted from the [sparql-examples](https://github.com/sib-swiss/sparql-examples) collection of curated UniProt SPARQL queries.

## Domain extents

Find the start and end position of annotated protein domains, using UniProt's own domain model (rather than an InterPro/Pfam cross-reference).

```turtle fixture=domain-extent
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix taxon: <http://purl.uniprot.org/taxonomy/>
prefix faldo: <http://biohackathon.org/resource/faldo#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>

<P04637>
  a up:Protein ;
  up:organism taxon:9606 ;
  up:reviewed true ;
  up:annotation <P04637#Domain_1> .

<P04637#Domain_1>
  a up:Domain_Extent_Annotation ;
  rdfs:comment "DNA-binding" ;
  up:range <P04637#Domain_1_range> .

<P04637#Domain_1_range>
  faldo:begin <P04637#Domain_1_begin> ;
  faldo:end <P04637#Domain_1_end> .

<P04637#Domain_1_begin> faldo:position 102 .
<P04637#Domain_1_end> faldo:position 292 .
```

```sparql fixture=domain-extent
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>
PREFIX faldo: <http://biohackathon.org/resource/faldo#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT
  ?protein
  ?domainName
  ?begin
  ?end
WHERE {
  ?protein a up:Protein ;
    up:organism taxon:9606 ;
    up:reviewed true ;
    up:annotation ?annotation .
  ?annotation a up:Domain_Extent_Annotation ;
    rdfs:comment ?domainName ;
    up:range ?range .
  ?range faldo:begin/faldo:position ?begin ;
    faldo:end/faldo:position ?end .
}
```

## Zinc finger regions

Zinc finger regions are commonly found in DNA-binding proteins. The zinc finger type is optional &mdash; not every annotation names one.

```turtle fixture=zinc-finger
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix taxon: <http://purl.uniprot.org/taxonomy/>
prefix faldo: <http://biohackathon.org/resource/faldo#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>

<Q09472>
  a up:Protein ;
  up:organism taxon:9606 ;
  up:reviewed true ;
  up:annotation <Q09472#ZnF_1> .

<Q09472#ZnF_1>
  a up:Zinc_Finger_Annotation ;
  rdfs:comment "C2HC-type" ;
  up:range <Q09472#ZnF_1_range> .

<Q09472#ZnF_1_range>
  faldo:begin <Q09472#ZnF_1_begin> ;
  faldo:end <Q09472#ZnF_1_end> .

<Q09472#ZnF_1_begin> faldo:position 1764 .
<Q09472#ZnF_1_end> faldo:position 1782 .
```

```sparql fixture=zinc-finger
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>
PREFIX faldo: <http://biohackathon.org/resource/faldo#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT
  ?protein
  ?zincFingerType
  ?begin
  ?end
WHERE {
  ?protein a up:Protein ;
    up:organism taxon:9606 ;
    up:reviewed true ;
    up:annotation ?annotation .
  ?annotation a up:Zinc_Finger_Annotation ;
    up:range ?range .
  OPTIONAL { ?annotation rdfs:comment ?zincFingerType }
  ?range faldo:begin/faldo:position ?begin ;
    faldo:end/faldo:position ?end .
}
```

## Coiled-coil regions

Coiled-coil regions use exactly the same shape &mdash; only the annotation class changes.

```turtle fixture=coiled-coil
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix taxon: <http://purl.uniprot.org/taxonomy/>
prefix faldo: <http://biohackathon.org/resource/faldo#>

<P04637>
  a up:Protein ;
  up:organism taxon:9606 ;
  up:reviewed true ;
  up:annotation <P04637#CC_1> .

<P04637#CC_1>
  a up:Coiled_Coil_Annotation ;
  up:range <P04637#CC_1_range> .

<P04637#CC_1_range>
  faldo:begin <P04637#CC_1_begin> ;
  faldo:end <P04637#CC_1_end> .

<P04637#CC_1_begin> faldo:position 323 .
<P04637#CC_1_end> faldo:position 356 .
```

```sparql fixture=coiled-coil
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>
PREFIX faldo: <http://biohackathon.org/resource/faldo#>

SELECT
  ?protein
  ?begin
  ?end
WHERE {
  ?protein a up:Protein ;
    up:organism taxon:9606 ;
    up:reviewed true ;
    up:annotation ?annotation .
  ?annotation a up:Coiled_Coil_Annotation ;
    up:range ?range .
  ?range faldo:begin/faldo:position ?begin ;
    faldo:end/faldo:position ?end .
}
```

## Transmembrane regions, and what comes just before them

A more elaborate example: find proteins with a transmembrane region, then look at the 15 amino acids immediately before it (using the raw sequence, `rdf:value` on the FALDO position's reference) and keep only the ones containing an alanine (`A`).

```turtle fixture=transmembrane-alanine
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix faldo: <http://biohackathon.org/resource/faldo#>
prefix isoform: <http://purl.uniprot.org/isoforms/>

<P07204>
  a up:Protein ;
  up:annotation <P07204#TM_1> ;
  up:sequence isoform:P07204-1 .

<P07204#TM_1>
  a up:Transmembrane_Annotation ;
  up:range <P07204#TM_1_range> .

<P07204#TM_1_range>
  faldo:begin <P07204#TM_1_begin> .

<P07204#TM_1_begin>
  faldo:position 22 ;
  faldo:reference isoform:P07204-1 .

isoform:P07204-1
  rdf:value "MLGIVLTLAALPAQATFPAKAVSDAQSQVIAVSALGAIVLVLLL" .
```

```sparql fixture=transmembrane-alanine
PREFIX faldo: <http://biohackathon.org/resource/faldo#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT ?protein ?from ?interestingRegion
WHERE
{
  ?protein up:annotation ?annotation .
  ?annotation a up:Transmembrane_Annotation .
  # Get the coordinates of the Transmembrane
  ?annotation up:range ?range .
  ?range faldo:begin ?beginI .
  ?beginI faldo:position ?begin .
  ?beginI faldo:reference ?sequence .
  # The aas will have the specific IUPAC aminoacids
  ?sequence rdf:value ?aas .
  # We calculate the start by substracting 10
  BIND(?begin - 10 AS ?tenBeforeBegin)
  # Can't start before the sequence starts or we might miss some results
  BIND(IF(?tenBeforeBegin < 1, 0, ?tenBeforeBegin) AS ?from)
  # Substring the IUPAC aminoacids
  BIND(SUBSTR(?aas, ?from, 15) AS ?interestingRegion)
  # The interestingRegion needds to contain an Alanine
  FILTER(CONTAINS(?interestingRegion, 'A'))
}
```

## Enzymes with at least two transmembrane domains

A pattern combining a property path, `GROUP BY` and `HAVING`: find hydrolases (EC 3.-.-.-) annotated with two or more transmembrane regions. `up:enzyme|up:annotation/up:catalyticActivity/up:enzymeClass` reads as "either directly via `up:enzyme`, or via a catalytic-activity annotation" &mdash; both are ways UniProt links a protein to its EC number.

```turtle fixture=transmembrane-enzyme
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix enzyme: <http://purl.uniprot.org/enzyme/>

<Q9Y6M0>
  a up:Protein ;
  up:enzyme enzyme:3.6.1.3 ;
  up:annotation <Q9Y6M0#TM_1>, <Q9Y6M0#TM_2> .

enzyme:3.6.1.3 rdfs:subClassOf enzyme:3.-.-.- .

<Q9Y6M0#TM_1> a up:Transmembrane_Annotation .
<Q9Y6M0#TM_2> a up:Transmembrane_Annotation .
```

```sparql fixture=transmembrane-enzyme
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT
  ?protein
WHERE {
 ?protein up:enzyme|up:annotation/up:catalyticActivity/up:enzymeClass ?enzymeClass ;
                   up:annotation ?transMembraneAnnotation .
 ?enzymeClass rdfs:subClassOf <http://purl.uniprot.org/enzyme/3.-.-.-> .
 ?transMembraneAnnotation a up:Transmembrane_Annotation .
} GROUP BY ?protein HAVING (COUNT(DISTINCT ?transMembraneAnnotation) >= 2)
```

## Membrane topology of a subcellular location

Beyond *where* a protein is located, UniProt can record *how* it sits there &mdash; e.g. as a peripheral membrane protein, a lipid anchor, or a multi-pass membrane protein.

```turtle fixture=subcell-topology
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix taxon: <http://purl.uniprot.org/taxonomy/>
prefix skos: <http://www.w3.org/2004/02/skos/core#>
prefix location: <http://purl.uniprot.org/locations/>
prefix topology: <http://purl.uniprot.org/topologies/>

<Q9Y6M0>
  a up:Protein ;
  up:organism taxon:9606 ;
  up:reviewed true ;
  up:annotation <Q9Y6M0#SL_1> .

<Q9Y6M0#SL_1>
  a up:Subcellular_Location_Annotation ;
  up:locatedIn <Q9Y6M0#SL_1_in> .

<Q9Y6M0#SL_1_in>
  up:cellularComponent location:Cell_membrane ;
  up:topology topology:Multi-pass_membrane_protein .

location:Cell_membrane skos:prefLabel "Cell membrane" .
topology:Multi-pass_membrane_protein skos:prefLabel "Multi-pass membrane protein" .
```

```sparql fixture=subcell-topology
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT
  ?protein
  ?subcellularLocation
  ?topology
WHERE {
  ?protein a up:Protein ;
    up:organism taxon:9606 ;
    up:reviewed true ;
    up:annotation ?annotation .
  ?annotation a up:Subcellular_Location_Annotation ;
    up:locatedIn ?location .
  ?location up:cellularComponent ?component ;
    up:topology ?topologyResource .
  ?component skos:prefLabel ?subcellularLocation .
  ?topologyResource skos:prefLabel ?topology .
}
```
