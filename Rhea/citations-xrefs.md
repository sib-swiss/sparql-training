# Rhea citations and cross-references

Every Rhea reaction can point outward in two different ways: a **citation**, a PubMed reference backing the reaction, and a **cross-reference**, a link to the equivalent reaction in another database such as KEGG, MetaCyc or MACiE. This page covers both.

Unlike the [metabolism tutorial](rhea.html), almost none of this needs `SERVICE`. Citations and cross-references live directly on the reaction data in the Rhea endpoint itself, so every query below runs against a small fixture built just for this page - no federation required.

## Citations

## Q1: Select all citations of a given reaction

Adapted from [sparql-examples Rhea/40](https://github.com/sib-swiss/sparql-examples/blob/master/examples/Rhea/40_Select_all_citations_of_a_given_reaction.ttl).

```turtle fixture=q1-citations
prefix rh: <http://rdf.rhea-db.org/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix pubmed: <http://rdf.ncbi.nlm.nih.gov/pubmed/>

rh:19553 rdfs:subClassOf rh:Reaction ;
  rh:status rh:Approved ;
  rh:equation "L-tryptophan + H2O = indole + pyruvate + NH4(+)" ;
  rh:citation pubmed:16790938, pubmed:236639, pubmed:9551100 .

rh:19069 rdfs:subClassOf rh:Reaction ;
  rh:status rh:Approved ;
  rh:equation "(R)-S-lactoylglutathione = methylglyoxal + glutathione" ;
  rh:citation pubmed:14841219, pubmed:4574550 .
```

```sparql fixture=q1-citations
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rh: <http://rdf.rhea-db.org/>

SELECT ?reaction ?citation
WHERE {
  BIND(rh:19553 AS ?reaction)
  ?reaction rdfs:subClassOf rh:Reaction .
  ?reaction rh:citation ?citation .
}
```

## Q2: Count citations per reaction, most-cited first

Adapted from [sparql-examples Rhea/41](https://github.com/sib-swiss/sparql-examples/blob/master/examples/Rhea/41_Select_all_reactions_with_citations_display_the_number_of_citations_and_order_by_reaction_ID.ttl).

```turtle fixture=q2-citation-counts
prefix rh: <http://rdf.rhea-db.org/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix pubmed: <http://rdf.ncbi.nlm.nih.gov/pubmed/>

rh:19553 rdfs:subClassOf rh:Reaction ;
  rh:citation pubmed:16790938, pubmed:236639, pubmed:9551100 .

rh:19069 rdfs:subClassOf rh:Reaction ;
  rh:citation pubmed:14841219, pubmed:4574550 .

rh:19545 rdfs:subClassOf rh:Reaction ;
  rh:citation pubmed:15788404 .
```

```sparql fixture=q2-citation-counts
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rh: <http://rdf.rhea-db.org/>

SELECT ?reaction (COUNT(DISTINCT ?citation) AS ?countPubmedPerReaction)
WHERE {
  ?reaction rdfs:subClassOf rh:Reaction .
  ?reaction rh:citation ?citation .
}
GROUP BY ?reaction
ORDER BY DESC(COUNT(DISTINCT ?citation))
```

## Q3: Average number of citations, among reactions that have at least one

Adapted from [sparql-examples Rhea/42](https://github.com/sib-swiss/sparql-examples/blob/master/examples/Rhea/42_Select_the_average_number_of_citation_of_reactions_that_have_at_least_one_citation.ttl).

A nested `SELECT` first counts citations per reaction, then the outer query averages those counts. Reactions with zero citations never appear in the inner query, so they don't pull the average down - that's a different question, asked in Q5 below.

```turtle fixture=q3-avg-citations
prefix rh: <http://rdf.rhea-db.org/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix pubmed: <http://rdf.ncbi.nlm.nih.gov/pubmed/>

rh:19553 rdfs:subClassOf rh:Reaction ;
  rh:citation pubmed:16790938, pubmed:236639, pubmed:9551100 .

rh:19069 rdfs:subClassOf rh:Reaction ;
  rh:citation pubmed:14841219, pubmed:4574550 .

rh:19545 rdfs:subClassOf rh:Reaction ;
  rh:citation pubmed:15788404 .
```

```sparql fixture=q3-avg-citations
PREFIX rh: <http://rdf.rhea-db.org/>

SELECT (AVG(?linksToPubmedPerReaction) AS ?avgLinksToPubmedPerReaction)
WHERE {
  SELECT ?reaction (COUNT(DISTINCT ?citation) AS ?linksToPubmedPerReaction)
  WHERE {
    ?reaction rh:citation ?citation .
  }
  GROUP BY ?reaction
  ORDER BY DESC(?linksToPubmedPerReaction)
}
```

## Q4: Find reactions cited by a given PubMed ID

Adapted from [sparql-examples Rhea/30](https://github.com/sib-swiss/sparql-examples/blob/master/examples/Rhea/30_Select_all_approved_reactions_annotated_with_a_given_Pubmed_ID.ttl).

`rh:citation` points at a PubMed IRI, not a plain number, so to show the PubMed ID as readable text the query strips the IRI down to its last segment with `STRAFTER`.

```turtle fixture=q4-citation-by-pubmed
prefix rh: <http://rdf.rhea-db.org/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix pubmed: <http://rdf.ncbi.nlm.nih.gov/pubmed/>

rh:19553 rdfs:subClassOf rh:Reaction ;
  rh:status rh:Approved ;
  rh:equation "L-tryptophan + H2O = indole + pyruvate + NH4(+)" ;
  rh:citation pubmed:16790938 .

rh:19069 rdfs:subClassOf rh:Reaction ;
  rh:status rh:Approved ;
  rh:equation "(R)-S-lactoylglutathione = methylglyoxal + glutathione" ;
  rh:citation pubmed:14841219 .
```

```sparql fixture=q4-citation-by-pubmed
PREFIX rh: <http://rdf.rhea-db.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX pubmed: <http://rdf.ncbi.nlm.nih.gov/pubmed/>

SELECT ?reaction ?pubMedID ?reactionEquation
WHERE {
  BIND(pubmed:16790938 AS ?cit)
  ?reaction rdfs:subClassOf rh:Reaction .
  ?reaction rh:status rh:Approved .
  ?reaction rh:equation ?reactionEquation .
  ?reaction rh:citation ?cit .
  BIND(strafter(str(?cit), str(pubmed:)) AS ?pubMedID)
}
```

## Q5: Approved reactions that are missing a citation

Adapted from [sparql-examples Rhea/119](https://github.com/sib-swiss/sparql-examples/blob/master/examples/Rhea/119_Give_me_the_set_of_approved_reactions_missing_citations.ttl).

Not every approved reaction has a citation yet. `OPTIONAL` plus `FILTER NOT EXISTS` finds the reactions where the pattern never matches at all - the same trick used for the `chebi` cross-reference in the metabolism tutorial's H. pylori query. Swap the `SELECT ?reaction` for `SELECT (COUNT(?reaction) AS ?count)` and you get [Rhea/118](https://github.com/sib-swiss/sparql-examples/blob/master/examples/Rhea/118_Number_of_approved_reactions_missing_citations.ttl), just a count instead of the list.

```turtle fixture=q5-missing-citations
prefix rh: <http://rdf.rhea-db.org/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix pubmed: <http://rdf.ncbi.nlm.nih.gov/pubmed/>

rh:19553 rdfs:subClassOf rh:Reaction ;
  rh:status rh:Approved ;
  rh:equation "L-tryptophan + H2O = indole + pyruvate + NH4(+)" ;
  rh:citation pubmed:16790938 .

rh:10484 rdfs:subClassOf rh:Reaction ;
  rh:status rh:Approved ;
  rh:equation "N-feruloylglycine + H2O = (E)-ferulate + glycine" .
```

```sparql fixture=q5-missing-citations
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rh: <http://rdf.rhea-db.org/>

SELECT ?reaction
WHERE {
  ?reaction rdfs:subClassOf rh:Reaction .
  ?reaction rh:status rh:Approved .
  OPTIONAL { ?reaction rh:citation ?citation . }
  FILTER (NOT EXISTS { ?reaction rh:citation ?citation . })
}
ORDER BY ?reaction
```

## Cross-references to other databases

A cross-reference is not stored as directly as a citation. Rhea reactions come in three forms: the reaction itself (its `rh:equation` and status), a **bidirectional** form (`rh:bidirectionalReaction`, the reaction written as an equilibrium), and one or more **directional** forms (`rh:directionalReaction`, the same chemistry written left-to-right or right-to-left). A cross-reference to KEGG, MetaCyc, MACiE or another database is attached with `rdfs:seeAlso`, but it can sit on either the directional or the bidirectional form depending on the database - which is why every query below checks both.

## Q6: Retrieve all cross-references for a given reaction

Adapted from [sparql-examples Rhea/35](https://github.com/sib-swiss/sparql-examples/blob/master/examples/Rhea/35_Select_all_cross-references_Kegg_MetaCyc_Macie_for_a_given_reaction.ttl).

```turtle fixture=q6-xrefs-for-reaction
prefix rh: <http://rdf.rhea-db.org/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>

rh:19069 rdfs:subClassOf rh:Reaction ;
  rh:status rh:Approved ;
  rh:equation "(R)-S-lactoylglutathione = methylglyoxal + glutathione" ;
  rh:directionalReaction rh:19071 ;
  rh:bidirectionalReaction rh:19072 .

rh:19071 rdfs:seeAlso <http://identifiers.org/biocyc/ECOCYC:GLYOXI-RXN>,
  <http://identifiers.org/macie/M0032> .

rh:19072 rdfs:seeAlso <http://identifiers.org/biocyc/METACYC:GLYOXI-RXN>,
  <http://identifiers.org/kegg.reaction/R02530> .
```

```sparql fixture=q6-xrefs-for-reaction
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rh: <http://rdf.rhea-db.org/>

SELECT ?reaction ?xref
WHERE {
  BIND(rh:19069 AS ?reaction)
  ?reaction rdfs:subClassOf rh:Reaction .
  ?reaction rh:directionalReaction ?directionalReaction .
  OPTIONAL { ?directionalReaction rdfs:seeAlso ?xref . }
  ?reaction rh:bidirectionalReaction ?bidirectionalReaction .
  OPTIONAL { ?bidirectionalReaction rdfs:seeAlso ?xref . }
}
```

## Q7: Count how many reactions have at least one cross-reference

Adapted from [sparql-examples Rhea/27](https://github.com/sib-swiss/sparql-examples/blob/master/examples/Rhea/27_Select_the_number_of_reactions_that_have_Xrefs.ttl).

```turtle fixture=q7-xref-count
prefix rh: <http://rdf.rhea-db.org/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>

rh:19069 rdfs:subClassOf rh:Reaction ;
  rh:directionalReaction rh:19071 ;
  rh:bidirectionalReaction rh:19072 .

rh:19071 rdfs:seeAlso <http://identifiers.org/biocyc/ECOCYC:GLYOXI-RXN>,
  <http://identifiers.org/macie/M0032> .

rh:19072 rdfs:seeAlso <http://identifiers.org/biocyc/METACYC:GLYOXI-RXN>,
  <http://identifiers.org/kegg.reaction/R02530> .

rh:11932 rdfs:subClassOf rh:Reaction ;
  rh:directionalReaction rh:11933 ;
  rh:bidirectionalReaction rh:10003 .

rh:11933 rdfs:seeAlso <http://identifiers.org/biocyc/METACYC:ACETONE-CYANHYDRIN-LYASE-RXN>,
  <http://identifiers.org/macie/M0217> .

rh:12520 rdfs:subClassOf rh:Reaction ;
  rh:directionalReaction rh:12522 ;
  rh:bidirectionalReaction rh:12523 .
```

`rh:12520` deliberately carries no `rdfs:seeAlso` at all - it has directional and bidirectional forms like every reaction, just no cross-reference on either of them, which is why the count below is 2, not 3.

```sparql fixture=q7-xref-count
PREFIX rh: <http://rdf.rhea-db.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT (COUNT(DISTINCT ?reaction) AS ?distinctReactionCount)
WHERE {
  ?reaction rdfs:subClassOf rh:Reaction .
  ?reaction rh:directionalReaction ?directionalReaction .
  ?reaction rh:bidirectionalReaction ?bidirectionalReaction .
  OPTIONAL { ?directionalReaction rdfs:seeAlso ?xref . }
  OPTIONAL { ?bidirectionalReaction rdfs:seeAlso ?xref . }
  FILTER (BOUND(?xref))
}
```

## Q8: Count reactions cross-referenced to KEGG specifically

Adapted from [sparql-examples Rhea/36](https://github.com/sib-swiss/sparql-examples/blob/master/examples/Rhea/36_Select_the_number_of_reactions_with_cross-references_to_KEGG_resource.ttl).

Cross-references aren't typed by predicate - a KEGG link and a MetaCyc link both arrive as a plain `rdfs:seeAlso`. To scope a query to one specific external database, match the shape of its identifier IRI instead, with a `regex` filter against the known namespace.

```turtle fixture=q8-kegg-xref-count
prefix rh: <http://rdf.rhea-db.org/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>

rh:19069 rdfs:subClassOf rh:Reaction ;
  rh:directionalReaction rh:19071 ;
  rh:bidirectionalReaction rh:19072 .

rh:19071 rdfs:seeAlso <http://identifiers.org/biocyc/ECOCYC:GLYOXI-RXN>,
  <http://identifiers.org/macie/M0032> .

rh:19072 rdfs:seeAlso <http://identifiers.org/biocyc/METACYC:GLYOXI-RXN>,
  <http://identifiers.org/kegg.reaction/R02530> .

rh:11932 rdfs:subClassOf rh:Reaction ;
  rh:directionalReaction rh:11933 ;
  rh:bidirectionalReaction rh:10003 .

rh:11933 rdfs:seeAlso <http://identifiers.org/biocyc/METACYC:ACETONE-CYANHYDRIN-LYASE-RXN>,
  <http://identifiers.org/macie/M0217> .
```

`rh:11932` has cross-references too, but only on its directional form, to MetaCyc and MACiE - no KEGG anywhere. That's what makes this a real test of the `regex` scoping, not just a repeat of Q7's count.

```sparql fixture=q8-kegg-xref-count
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rh: <http://rdf.rhea-db.org/>
PREFIX kegg: <http://identifiers.org/kegg.reaction/>

SELECT (COUNT(?reaction) AS ?reactionCount)
WHERE {
  ?reaction rdfs:subClassOf rh:Reaction .
  ?reaction rh:bidirectionalReaction ?bidirectionalReaction .
  ?bidirectionalReaction rdfs:seeAlso ?xref .
  FILTER (regex(str(?xref), str(kegg:)))
}
```

## Going further: resolve a KEGG reaction back to Rhea and its enzymes

Adapted from [sparql-examples Rhea/137](https://github.com/sib-swiss/sparql-examples/blob/master/examples/Rhea/137_kegg_reaction_to_rhea_ec_and_uniprot_enzymes.ttl).

Cross-references also work in reverse: given a KEGG reaction accession, the same `rh:bidirectionalReaction`/`rdfs:seeAlso` link resolves it back to the matching Rhea reaction(s) and their EC numbers, and from there `SERVICE` reaches into UniProt for the enzymes that actually catalyze it in a given organism. This crosses two live endpoints, so it's reference-only here - run it directly against Rhea:

```sparql reference="Federates Rhea with UniProt - run at https://sparql.rhea-db.org/sparql"
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rh: <http://rdf.rhea-db.org/>
PREFIX kegg: <http://identifiers.org/kegg.reaction/>
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>

SELECT ?reaction ?equation ?ec ?protein
WHERE {
  BIND (kegg:R00162 AS ?keggReaction)
  ?reaction rdfs:subClassOf rh:Reaction ;
    rh:status rh:Approved ;
    rh:equation ?equation ;
    rh:ec ?ec ;
    rh:bidirectionalReaction ?bi .
  ?bi rdfs:seeAlso ?keggReaction .

  SERVICE <https://sparql.uniprot.org/sparql> {
    ?protein a up:Protein ;
      up:reviewed true ;
      up:organism taxon:9606 .
    {
      ?protein up:enzyme ?ec
    } UNION {
      ?protein up:domain/up:enzyme ?ec
    } UNION {
      ?protein up:component/up:enzyme ?ec
    }
  }
}
```
