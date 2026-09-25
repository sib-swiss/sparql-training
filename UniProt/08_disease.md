# Disease

This page shows you how UniProtKB annotates the diseases a protein is known or thought to be involved in.

Disease involvement is stored as a `up:Disease_Annotation` on the protein, pointing at a `up:Disease` resource. The disease resource itself carries a human-readable `skos:prefLabel`, a longer `rdfs:comment`, and often cross-references (`rdfs:seeAlso`) to external disease databases such as OMIM (MIM). The annotation itself can also carry its own `rdfs:comment` describing how the protein relates to the disease.

```turtle fixture=diseases
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix skos: <http://www.w3.org/2004/02/skos/core#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix taxon: <http://purl.uniprot.org/taxonomy/>
prefix disease: <http://purl.uniprot.org/diseases/>
prefix location: <http://purl.uniprot.org/locations/>
prefix enzyme: <http://purl.uniprot.org/enzyme/>
prefix db: <http://purl.uniprot.org/database/>
prefix mim: <http://purl.uniprot.org/mim/>

<P07949>
  a up:Protein ;
  up:organism taxon:9606 ;
  up:encodedBy <P07949#gene> ;
  up:enzyme enzyme:2.7.10.1 ;
  up:annotation <P07949#disease_ann>, <P07949#subcell_ann> .

<P07949#gene>
  a up:Gene ;
  skos:prefLabel "RET" .

<P07949#disease_ann>
  a up:Disease_Annotation ;
  up:disease disease:DI01234 ;
  rdfs:comment "Defects in RET are a cause of multiple endocrine neoplasia type 2A." .

disease:DI01234
  a up:Disease ;
  skos:prefLabel "Multiple endocrine neoplasia type 2A" ;
  rdfs:comment "A disease characterized by tumors of the thyroid, parathyroid and adrenal glands." ;
  rdfs:seeAlso mim:171400 .

mim:171400
  up:database db:MIM .

<P07949#subcell_ann>
  a up:Subcellular_Location_Annotation ;
  up:locatedIn <P07949#located_in> .

<P07949#located_in>
  up:cellularComponent location:Plasma_membrane .

location:Plasma_membrane
  skos:prefLabel "Cell membrane" .

<P00390>
  a up:Protein ;
  up:organism taxon:9606 ;
  up:annotation <P00390#disease_ann>, <P00390#subcell_ann>, <P00390#cat_ann> .

<P00390#cat_ann>
  a up:Catalytic_Activity_Annotation .

<P00390#disease_ann>
  a up:Disease_Annotation ;
  up:disease disease:DI05678 ;
  rdfs:comment "Defects in this enzyme are a cause of glutathione reductase deficiency." .

disease:DI05678
  a up:Disease ;
  skos:prefLabel "Glutathione reductase deficiency" .

<P00390#subcell_ann>
  a up:Subcellular_Location_Annotation ;
  up:locatedIn <P00390#located_in> .

<P00390#located_in>
  up:cellularComponent location:Mitochondrial_matrix .

location:Mitochondrial_matrix
  up:partOf location:173 .
```

## List proteins and the diseases they're linked to

The simplest disease query: proteins, their disease annotations, and the disease each annotation points to.

```sparql fixture=diseases
PREFIX up: <http://purl.uniprot.org/core/>

SELECT
	?protein
	?disease
WHERE {
	?protein a up:Protein ;
    	up:annotation ?annotation .
	?annotation a up:Disease_Annotation ;
    	up:disease ?disease .
	?disease a up:Disease .
}
```

## Preferred gene name of human disease-related proteins

Combine `up:encodedBy` (see the [Replicon & genes](03_replicon_gene.html) page) with a disease annotation to get the gene name alongside the disease description text. Note that the description text (`?text`) here comes from the *annotation*'s own `rdfs:comment`, not from the disease resource.

```sparql fixture=diseases
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT ?name ?text
WHERE
{
        ?protein a up:Protein . 
        ?protein up:organism taxon:9606 .
        ?protein up:encodedBy ?gene . 
        ?gene skos:prefLabel ?name .
        ?protein up:annotation ?annotation .
        ?annotation a up:Disease_Annotation .
        ?annotation rdfs:comment ?text
}
```

## Where are disease-related proteins located in the cell?

Joining a disease annotation with a subcellular location annotation on the same protein.

```sparql fixture=diseases
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT 
    ?protein 
    ?disease 
    ?location_inside_cell 
    ?cellcmpt
WHERE
{
    ?protein up:annotation ?diseaseAnnotation , ?subcellAnnotation .
    ?diseaseAnnotation up:disease/skos:prefLabel ?disease .
    ?subcellAnnotation up:locatedIn/up:cellularComponent ?cellcmpt .
    ?cellcmpt skos:prefLabel ?location_inside_cell .
}
```

## Diseases involving enzymes

A protein can be linked to an enzyme classification two ways: directly with `up:enzyme`, or indirectly through a catalytic activity annotation (`up:annotation/up:catalyticActivity/up:enzymeClass`). The property path alternation `|` matches either.

```sparql fixture=diseases
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT
?disease ?diseaseLabel
WHERE {
 ?protein up:enzyme|up:annotation/up:catalyticActivity/up:enzymeClass ?enzyme ;
                   up:annotation ?diseaseAnnotation .
 ?diseaseAnnotation a up:Disease_Annotation ;
                    up:disease ?disease .
 ?disease skos:prefLabel ?diseaseLabel .
}
```

## Diseases involving enzymes located in the mitochondrion

A more specific version of the previous query: restrict to enzymes whose subcellular location is the mitochondrion (`http://purl.uniprot.org/locations/173`) or a part of it, using the `up:partOf*` property path (zero or more `partOf` hops) and a `UNION` for the two ways of being an enzyme.

```sparql fixture=diseases
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT
  DISTINCT
    ?disease
WHERE {
  ?protein a up:Protein ;
  up:organism taxon:9606 ;
  up:annotation ?disease_annotation ,
                ?subcellularLocation .
  {
    ?protein up:enzyme [] .
  } UNION {
    ?protein up:annotation/a up:Catalytic_Activity_Annotation .
  }
  ?disease_annotation a up:Disease_Annotation ;
    up:disease ?disease .
  ?subcellularLocation a up:Subcellular_Location_Annotation ;
    up:locatedIn ?location .
  ?location up:cellularComponent ?component .
  ?component up:partOf* <http://purl.uniprot.org/locations/173> .
}
```

## Genetic disease-related proteins, with their OMIM cross-reference

On the real endpoint, protein annotations and disease descriptions live in separate named graphs (`GRAPH <http://sparql.uniprot.org/uniprot>` and `GRAPH <http://sparql.uniprot.org/diseases>`), joined with the shared `?disease` variable. That turns out to be unnecessary, though: the query below runs fine on the live endpoint without the `GRAPH { ... }` wrapper too, so it's shown just once, the simpler way.

```sparql fixture=diseases
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT
  ?uniprot ?disease ?diseaseComment ?mim
WHERE
{
    ?uniprot a up:Protein ;
       up:annotation ?diseaseAnnotation .
    ?diseaseAnnotation up:disease ?disease .
    ?disease a up:Disease ;
             rdfs:comment ?diseaseComment .
    OPTIONAL {
      ?disease rdfs:seeAlso ?mim .
       ?mim up:database <http://purl.uniprot.org/database/MIM> .
    }
}
```

These queries are adapted from the [SIB SPARQL examples](https://github.com/sib-swiss/sparql-examples) collection for UniProt.
