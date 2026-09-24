# Transporter proteins

This page shows you how to find **transporter proteins** &mdash; enzymes that move a compound across a membrane rather than converting it into something else &mdash; using the Rhea reaction data cross-referenced from UniProt.

Rhea flags every reaction that represents a transport event with the `rh:isTransport` property. Joined with UniProt's `Catalytic_Activity_Annotation`, this lets you find every protein annotated as catalyzing a transport reaction.

```turtle fixture=transport
base <http://purl.uniprot.org/uniprot/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix up: <http://purl.uniprot.org/core/>
prefix taxon: <http://purl.uniprot.org/taxonomy/>
prefix rh: <http://rdf.rhea-db.org/>
prefix CHEBI: <http://purl.obolibrary.org/obo/CHEBI_>

# A Rhea reaction that transports a lipid across a membrane
rh:34579 rh:isTransport true ;
  rh:side rh:34579_L .
rh:34579_L rh:contains rh:34579_L_1 .
rh:34579_L_1 rh:compound rh:Compound_57262 .
rh:Compound_57262 rh:chebi CHEBI:57262 .

# CHEBI:18059 is the class for all lipids; CHEBI:57262 (a phosphatidylcholine) is one
CHEBI:57262 rdfs:subClassOf CHEBI:18059 .

# A reviewed human protein annotated as catalyzing that transport reaction
<Q9Y5Y9> up:reviewed true ;
  up:organism taxon:9606 ;
  up:annotation <Q9Y5Y9#CA> .
<Q9Y5Y9#CA> a up:Catalytic_Activity_Annotation ;
  up:catalyticActivity <Q9Y5Y9#CAca> .
<Q9Y5Y9#CAca> up:catalyzedReaction rh:34579 .
```

## Count the number of human transporter proteins

```sparql fixture=transport
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rh: <http://rdf.rhea-db.org/>
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>

SELECT
  (COUNT(DISTINCT ?protein) AS ?humanTransportEnzymes)
WHERE {
  ?protein up:organism taxon:9606 ;
           up:annotation ?a .
  ?a a up:Catalytic_Activity_Annotation ;
    up:catalyticActivity ?ca .
  ?ca up:catalyzedReaction ?rhea .
  ?rhea rh:isTransport true .
}
```

## Count distinct Rhea transport reactions annotated in reviewed UniProt entries

```sparql fixture=transport
PREFIX rh: <http://rdf.rhea-db.org/>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT
  (COUNT(DISTINCT ?rhea) AS ?distinctRheaTransportInUniProt)
WHERE {
  ?rhea rh:isTransport true .
  ?protein up:annotation ?ann .
  ?ann up:catalyticActivity ?ca .
  ?ca up:catalyzedReaction ?rhea .
}
```

## List reviewed human enzymes that transport lipids

A compound's ChEBI term can be reached three different ways from a Rhea reaction participant &mdash; directly (`rh:chebi`), through a generic/reactive part (`rh:reactivePart/rh:chebi`), or through a polymer's underlying chemical (`rh:underlyingChebi`) &mdash; so the query below tries all three with a property-path alternative (`|`). `rdfs:subClassOf*` then matches CHEBI:18059 (lipid) itself or any of its descendants.

```sparql fixture=transport
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX rh: <http://rdf.rhea-db.org/>
PREFIX CHEBI: <http://purl.obolibrary.org/obo/CHEBI_>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>

SELECT
  ?protein
  ?chebi
WHERE {
  ?rhea rh:isTransport true .
  ?rhea rh:side/rh:contains/rh:compound ?compound .
  ?compound (rh:chebi|(rh:reactivePart/rh:chebi)|rh:underlyingChebi) ?chebi .

  # CHEBI:18059 is the class for all lipids
  ?chebi rdfs:subClassOf* CHEBI:18059 .

  # Select human reviewed entries from Swiss-Prot
  ?protein up:reviewed true ;
    up:organism taxon:9606 .
  # Link protein to catalytic activity, then to the Rhea reaction
  ?protein up:annotation ?annotation .
  ?annotation up:catalyticActivity ?catalytic_activity .
  ?catalytic_activity up:catalyzedReaction ?rhea .
}
```

## Transporters expressed in a specific tissue

Combining Rhea's transport annotations with [Bgee](https://www.bgee.org/) expression data lets you ask where a transporter is actually expressed &mdash; here, which reviewed human transporters are expressed in the liver ([UBERON:0002107](http://purl.obolibrary.org/obo/UBERON_0002107)). This crosses three resources (Rhea, UniProt and Bgee) live via `GRAPH` and `SERVICE`.

We tested this exact query against the real endpoints: a simple, isolated `SERVICE` call to Bgee on its own succeeds reliably. But once it's joined with the outer Rhea/UniProt patterns like below, Comunica's query planner sends extra background requests to plan the join (e.g. `SELECT (COUNT(*) AS ?count) WHERE {...}` probes), and Bgee sits behind Cloudflare bot-protection that blocks that burst of extra traffic with an HTTP 403 challenge page &mdash; the query itself is fine, but the join triggers a false positive in Bgee's bot filter. Rather than ship a **Run query** button that fails unpredictably for reasons outside this query's control, this one stays a reference example &mdash; run it yourself at [sparql.uniprot.org](https://sparql.uniprot.org/sparql):

```note type=comunica-limitation
This site's [Comunica](https://comunica.dev/) engine is capable of real, live federation. In this case the engine runs the query itself.
Unfortunatly bgee has Cloudflare bot protection and that is triggered here. Run this query at [sparql.uniprot.org](https://sparql.uniprot.org/sparql) directly.
```

```sparql reference="Federates UniProt, Rhea and Bgee - run at https://sparql.uniprot.org/sparql"
PREFIX genex: <http://purl.org/genex#>
PREFIX lscr: <http://purl.org/lscr#>
PREFIX obo: <http://purl.obolibrary.org/obo/>
PREFIX orth: <http://purl.org/net/orth#>
PREFIX rh: <http://rdf.rhea-db.org/>
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>
PREFIX uberon: <http://purl.obolibrary.org/obo/uo#>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT
  ?rhea
  ?protein
  ?anat
WHERE
{
  GRAPH <https://sparql.rhea-db.org/rhea> {
    ?rhea rh:isTransport true .
  }
  ?protein up:annotation ?ann .
  ?protein up:organism taxon:9606 .
  ?ann up:catalyticActivity ?ca .
  ?ca up:catalyzedReaction ?rhea .
  BIND(uberon:0002107 AS ?anat)
  SERVICE <https://www.bgee.org/sparql/> {
    ?seq genex:isExpressedIn ?anat .
    ?seq lscr:xrefUniprot ?protein .
    ?seq orth:organism ?organism .
    ?organism obo:RO_0002162 taxon:9606 .
  }
}
```
