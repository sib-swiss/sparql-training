# Evidence & citations

Every UniProt annotation can be backed by **evidence**: a statement that says *why* the annotation is trusted - usually a literature citation, sometimes a curator's own judgement, sometimes an automated pipeline. This page shows how that evidence is modeled in RDF, and how to query it.

UniProt records this with the standard RDF **reification** pattern: instead of attaching evidence directly to a triple (which isn't possible - RDF triples aren't things you can point to), UniProt creates an `rdf:Statement` resource that describes the triple (`rdf:subject`/`rdf:predicate`/`rdf:object`), and attaches an `up:Attribution` to *that*. The attribution links to the `up:source` (typically a `up:Journal_Citation`) and, often, an `up:evidence` code from the [Evidence & Conclusion Ontology (ECO)](https://www.evidenceontology.org/).

## Evidence tags on an annotation

```turtle fixture=evidence-tag
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix citations: <http://purl.uniprot.org/citations/>
prefix attribution: <http://purl.uniprot.org/attribution/>
prefix ECO: <http://purl.obolibrary.org/obo/ECO_>

<P99999> a up:Protein ;
  up:annotation <P99999#VAR_001>, <P99999#FUNC_001> .

<P99999#VAR_001> a up:Natural_Variant_Annotation .

<P99999#FUNC_001> a up:Function_Annotation .

# The reified statement: "<P99999> up:annotation <P99999#VAR_001>" is itself
# a resource here, so we can attach an up:attribution to it.
_:linkVar a rdf:Statement ;
  rdf:subject <P99999> ;
  rdf:predicate up:annotation ;
  rdf:object <P99999#VAR_001> ;
  up:attribution attribution:VAR_ATT_1 .

_:linkFunc a rdf:Statement ;
  rdf:subject <P99999> ;
  rdf:predicate up:annotation ;
  rdf:object <P99999#FUNC_001> ;
  up:attribution attribution:FUNC_ATT_1 .

attribution:VAR_ATT_1 a up:Attribution ;
  up:source citations:12345678 ;
  up:evidence ECO:0000269 .

attribution:FUNC_ATT_1 a up:Attribution ;
  up:source citations:12345678 ;
  up:evidence ECO:0000305 .

citations:12345678 a up:Journal_Citation .
```

### Find natural variant annotations linked to a PubMed article

Adapted from [sparql-examples #19](https://sib-swiss.github.io/sparql-examples/examples/UniProt/19_natural_variants_associated_with_pubmed_id): find all natural variant annotations that are, via an evidence tag, associated with an article that has a PubMed identifier.

```sparql fixture=evidence-tag
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

### How often is a citation used across evidence tags?

Adapted from [sparql-examples #20](https://sib-swiss.github.io/sparql-examples/examples/UniProt/20_how_often_citation_used_in_evidence_tag) (the original restricts to human proteins; that restriction is dropped here since this toy dataset only has one protein).

```sparql fixture=evidence-tag
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT
    ?source
    (COUNT(?attribution) AS ?attributions)
WHERE
{
        ?protein a up:Protein ;
            up:annotation ?annotation .
        ?linkToEvidence rdf:object ?annotation ;
                        up:attribution ?attribution .
        ?attribution up:source ?source .
        ?source a up:Journal_Citation .
} GROUP BY ?source ORDER BY DESC(COUNT(?attribution))
```

### Illustrative: which ECO evidence code backs each annotation?

*(Hand-written for this page - sparql-examples doesn't currently have a dedicated example selecting `up:evidence` directly, only `up:source`.)*

```sparql fixture=evidence-tag
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT ?annotation ?evidenceCode ?source
WHERE {
  ?linkToEvidence rdf:object ?annotation ;
                  up:attribution ?attribution .
  ?attribution up:evidence ?evidenceCode ;
               up:source ?source .
}
ORDER BY ?annotation
```

## Protein existence: how well-characterized is an entry?

Separately from evidence on individual annotations, every UniProt entry has one overall `up:existence` value - a coarse confidence level for the existence of the protein itself, from direct protein-level evidence down to purely computational prediction.

```turtle fixture=existence
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>

<P10001> a up:Protein ; up:reviewed true ; up:existence up:Evidence_at_Protein_Level_Existence .
<P10002> a up:Protein ; up:reviewed true ; up:existence up:Evidence_at_Protein_Level_Existence .
<P10003> a up:Protein ; up:reviewed true ; up:existence up:Evidence_at_Transcript_Level_Existence .
<P10004> a up:Protein ; up:reviewed true ; up:existence up:Inferred_from_Homology_Existence .
<P10005> a up:Protein ; up:reviewed true ; up:existence up:Predicted_Existence .
```

### Break down reviewed proteins by existence evidence level

Adapted from [sparql-examples #216](https://sib-swiss.github.io/sparql-examples/examples/UniProt/216_human_proteins_by_existence_evidence) (the original restricts to human, `taxon:9606`; dropped here since our toy proteins have no organism).

```sparql fixture=existence
PREFIX up: <http://purl.uniprot.org/core/>

SELECT
  ?existence
  (COUNT(*) AS ?proteinCount)
WHERE {
  ?protein a up:Protein ;
    up:reviewed true ;
    up:existence ?existence .
}
GROUP BY ?existence
ORDER BY DESC(?proteinCount)
```

## Citation statements: what scope was a citation used for?

A protein can cite the same article for several different reasons - one citation might document the original sequence determination, another mention might document a specific disease variant. UniProt records the plain triple `<protein> up:citation <citation>` for direct traversal, and separately reifies that same triple as an `up:Citation_Statement` so it can attach a `up:scope` to the *specific citation relationship*, not to the citation as a whole.

```turtle fixture=citation-statement
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix citations: <http://purl.uniprot.org/citations/>

<P99999> up:citation citations:12345678, citations:87654321 .

_:stmt1 a up:Citation_Statement ;
  rdf:subject <P99999> ;
  rdf:predicate up:citation ;
  rdf:object citations:12345678 ;
  up:scope "Disease variant p.Arg273His" .

_:stmt2 a up:Citation_Statement ;
  rdf:subject <P99999> ;
  rdf:predicate up:citation ;
  rdf:object citations:87654321 ;
  up:scope "Sequence determination" .
```

### Find what a citation was used for

Adapted from [sparql-examples #158](https://sib-swiss.github.io/sparql-examples/examples/UniProt/158_citation_scope_via_citation_statement) (originally run against human insulin, P01308; here against the toy protein `P99999`).

```sparql fixture=citation-statement
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX uniprotkb: <http://purl.uniprot.org/uniprot/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT
  DISTINCT
    ?citation
    ?scope
WHERE {
  ?statement a up:Citation_Statement ;
    rdf:subject uniprotkb:P99999 ;
    rdf:predicate up:citation ;
    rdf:object ?citation ;
    up:scope ?scope .
}
```
