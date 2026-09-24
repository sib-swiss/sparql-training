# Natural variants

UniProt records naturally occurring sequence variation &mdash; differences between individuals, disease-associated mutations, polymorphisms &mdash; as `up:Natural_Variant_Annotation` resources attached to a protein via `up:annotation`. Each one carries a free-text `rdfs:comment` describing the variant, and, where known, the exact sequence position and amino acid substitution involved.

These queries are adapted from the [SIB SPARQL examples](https://github.com/sib-swiss/sparql-examples) collection for UniProt.

```turtle fixture=variants
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix taxon: <http://purl.uniprot.org/taxonomy/>
prefix faldo: <http://biohackathon.org/resource/faldo#>
prefix isoform: <http://purl.uniprot.org/isoforms/>
prefix citation: <http://purl.uniprot.org/citations/>

<P37840> a up:Protein ;
  up:organism taxon:9606 ;
  up:sequence isoform:P37840-1 ;
  up:annotation <P37840#VAR_001>, <P37840#VAR_002>, <P37840#VAR_003> .

isoform:P37840-1 a up:Simple_Sequence ;
  rdf:value "YTKAGVEQAVAAALPKAVVEQTAKAVVEQAA" .

<P37840#VAR_001> a up:Natural_Variant_Annotation ;
  rdfs:comment "In PARK4; dementia with Lewy bodies; leads to a loss of function" .

<P37840#VAR_002> a up:Natural_Variant_Annotation ;
  rdfs:comment "Found in a patient with Parkinson disease" ;
  up:substitution "F" ;
  up:range [
    faldo:begin [ faldo:position 1 ; faldo:reference isoform:P37840-1 ] ;
    faldo:end [ faldo:position 1 ; faldo:reference isoform:P37840-1 ]
  ] .

<P37840#VAR_003> a up:Natural_Variant_Annotation ;
  rdfs:comment "Rare" .

[] rdf:object <P37840#VAR_003> ;
   up:attribution <P37840#VAR_003_attribution> .

<P37840#VAR_003_attribution> up:source citation:9812111 .

citation:9812111 a up:Journal_Citation .
```

## Variants matching a keyword

Select all human UniProtKB entries with a sequence variant whose description contains a given word &mdash; here, `"loss of function"`.

```sparql fixture=variants
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT ?protein ?text
WHERE
{
        ?protein a up:Protein .
        ?protein up:organism taxon:9606 .
        ?protein up:annotation ?annotation .
        ?annotation a up:Natural_Variant_Annotation .
        ?annotation rdfs:comment ?text .
        FILTER (CONTAINS(?text, 'loss of function'))
}
```

## Variants at a specific position in the sequence

This one is more involved: it walks from the variant annotation to its `up:range`, from there to the FALDO `faldo:begin` position, reads the reference sequence's actual value with `rdf:value`, and uses `SUBSTR` to pull out the single amino acid at that position &mdash; then filters for variants that change a tyrosine (`Y`) to a phenylalanine (`F`).

```sparql fixture=variants
PREFIX faldo: <http://biohackathon.org/resource/faldo#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT ?protein ?annotation ?begin ?text
WHERE
{
        ?protein a up:Protein ;
            up:organism taxon:9606 ;
            up:annotation ?annotation .
        ?annotation a up:Natural_Variant_Annotation ;
            rdfs:comment ?text ;
            up:substitution ?substitution ;
            up:range/faldo:begin
                [ faldo:position ?begin ;
                  faldo:reference ?sequence ] .
        ?sequence rdf:value ?value .
        BIND (substr(?value, ?begin, 1) as ?original) .
        FILTER(?original = 'Y' && ?substitution = 'F') .
}
```

## Variants backed by a literature reference

Adapted from [sparql-examples UniProt/19](https://sib-swiss.github.io/sparql-examples/examples/UniProt/19_natural_variants_associated_with_pubmed_id).

UniProt attaches evidence to many annotations by reifying the `up:annotation` statement (`rdf:object` points at the annotation) and hanging an `up:attribution` off that reified statement, which in turn points to its `up:source` - here in this specific case a `up:Journal_Citation`.

```sparql fixture=variants
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT
    ?accession
    ?annotation_acc
    ?pubmed
WHERE
{
        ?protein a up:Protein ;
            up:annotation ?annotation .
        ?annotation a up:Natural_Variant_Annotation .
        ?linkToEvidence rdf:object ?annotation ;
                        up:attribution ?attribution .
        ?attribution up:source ?source .
        ?source a up:Journal_Citation .
  BIND(SUBSTR(STR(?protein),33) AS ?accession)
  BIND(IF(CONTAINS(STR(?annotation), "#SIP"), SUBSTR(STR(?annotation),33), SUBSTR(STR(?annotation),36))AS?annotation_acc)
  BIND(SUBSTR(STR(?source),35) AS ?pubmed)
}
```

## The variant with the longest description

A simple sort: order every natural variant annotation by the length of its comment, longest first.

```sparql fixture=variants
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT
    ?annotation ?comment
WHERE {
    ?annotation a up:Natural_Variant_Annotation ;
        rdfs:comment ?comment .
}
ORDER BY DESC(STRLEN(?comment))
```
