# Cross-references to external databases

UniProtKB entries link out to dozens of other databases &mdash; structure archives, sequence archives, other protein-clustering resources, and more. Every cross-reference uses the same basic shape: the protein has an `rdfs:seeAlso` link to a resource representing the cross-reference, and that resource is typed with `up:database` to say which external database it points into. Some databases attach extra structured detail on top of that basic link, as you'll see below with PDB's chain mapping.

The queries on this page are adapted from the community-curated [sparql-examples](https://github.com/sib-swiss/sparql-examples) query collection.

## Mapping UniProtKB entries to PDB

Select a mapping of UniProtKB to PDB entries using the UniProtKB cross-references to the [PDB](https://www.uniprot.org/database/DB-0070) database.

```turtle fixture=pdb-mapping
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix database: <http://purl.uniprot.org/database/>
prefix pdb: <http://rdf.wwpdb.org/pdb/>

<P04637> a up:Protein ;
  rdfs:seeAlso pdb:2XWR, pdb:1TUP .

pdb:2XWR up:database database:PDB .
pdb:1TUP up:database database:PDB .
```

```sparql fixture=pdb-mapping
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT ?protein ?db
WHERE
{
    ?protein a up:Protein .
    ?protein rdfs:seeAlso ?db .
    ?db up:database <http://purl.uniprot.org/database/PDB>
}
```

## Cross-references in a database category

UniProt groups external databases into categories (`'3D structure databases'`, `'Sequence databases'`, `'Genome annotation databases'`, and so on &mdash; see the full list at [uniprot.org/database](https://www.uniprot.org/database)). This lets you pull every cross-reference in a whole category at once, rather than naming one database at a time. Here, every 3D-structure-database cross-reference of entries classified with the keyword [Acetoin biosynthesis (KW-0005)](https://www.uniprot.org/keywords/5):

```turtle fixture=xref-category
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix keywords: <http://purl.uniprot.org/keywords/>
prefix database: <http://purl.uniprot.org/database/>
prefix pdb: <http://rdf.wwpdb.org/pdb/>

<P04637> a up:Protein ;
  up:classifiedWith keywords:5 ;
  rdfs:seeAlso pdb:2XWR .

pdb:2XWR up:database database:PDB .
database:PDB up:category "3D structure databases" .
```

```sparql fixture=xref-category
PREFIX keywords: <http://purl.uniprot.org/keywords/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT DISTINCT ?link
WHERE
{
    ?protein a up:Protein .
    ?protein up:classifiedWith keywords:5 .
    ?protein rdfs:seeAlso ?link .
    ?link up:database ?db .
    ?db up:category '3D structure databases'
}
```

## Mapping PDB identifiers plus chains to UniProtKB

Going the other way &mdash; from a PDB identifier and chain code back to UniProtKB &mdash; needs one extra piece of data: PDB cross-references carry a `chainSequenceMapping`, whose `chain` value is a compact text label like `"A/C=1-306"` (chain letters, an `=`, then the residue range). Splitting on `=` with `STRBEFORE` gets you the chain letters back out.

```turtle fixture=pdb-chain-mapping
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix database: <http://purl.uniprot.org/database/>
prefix pdb: <http://rdf.wwpdb.org/pdb/>

<P0DTD1> rdfs:seeAlso pdb:6VXC .
pdb:6VXC up:database database:PDB ;
  up:chainSequenceMapping [ up:chain "A/C=1-306" ] .

<P02766> rdfs:seeAlso pdb:1BG3 .
pdb:1BG3 up:database database:PDB ;
  up:chainSequenceMapping [ up:chain "B=1-127" ] .
```

```sparql fixture=pdb-chain-mapping
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT
  ?pdbId ?chain ?pdbChain ?uniprot
WHERE
{
  # A space separated list of pairs of PDB identifiers and the chain code.
  VALUES(?pdbId ?pdbChain) { ('6VXC' 'A') ('1BG3' 'B') }

  # Make an IRI out of the pdbId
  BIND(iri(concat('http://rdf.wwpdb.org/pdb/', ?pdbId)) AS ?pdb)

  # Map to UniProt entries
  ?uniprot rdfs:seeAlso ?pdb .
  ?pdb up:database <http://purl.uniprot.org/database/PDB> ;
       up:chainSequenceMapping ?chainSm .
  ?chainSm up:chain ?chainsPlusRange .

  # Extract the list of chains from the text representation.
  BIND(STRBEFORE(?chainsPlusRange, '=') AS ?chain)

  # Filter those that match.
  FILTER(CONTAINS(?chain, ?pdbChain))
}
```

## Similar proteins via UniRef clusters

[UniRef](https://www.uniprot.org/help/uniref) groups UniProtKB entries into clusters of similar sequences. On the live endpoint, UniProtKB and UniRef data live in separate named graphs, so the real query restricts itself to those graphs with `FROM`. In one local example dataset there's only ever a single (default) graph, so the first runnable version below just drops the `FROM` clauses &mdash; everything needed is already in the one graph. The second version below is the real query with the `FROM` clauses, running live against `sparql.uniprot.org` itself (there's no local data to fake this one with, since it depends on two real named graphs).

```turtle fixture=uniref-similarity
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix uniprotkb: <http://purl.uniprot.org/uniprot/>
prefix uniref: <http://purl.uniprot.org/uniref/>

uniref:UniRef90_P04637
  up:identity 0.97 ;
  up:member uniref:UniRef90_P04637_0, uniref:UniRef90_P04637_1 .

uniref:UniRef90_P04637_0 up:sequenceFor uniprotkb:P04637 .
uniref:UniRef90_P04637_1 up:sequenceFor uniprotkb:Q00987 .
```

```sparql fixture=uniref-similarity
PREFIX uniprotkb: <http://purl.uniprot.org/uniprot/>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT
    ?similar ?identity
WHERE
{
    BIND (uniprotkb:P04637 AS ?protein)
    ?cluster up:member ?member ;
             up:member/up:sequenceFor ?protein;
             up:identity ?identity .
    ?member up:sequenceFor ?similar .
    FILTER(!sameTerm(?similar, ?protein))
}
ORDER BY DESC(?identity)
```

```sparql live="https://sparql.uniprot.org/sparql"
PREFIX uniprotkb: <http://purl.uniprot.org/uniprot/>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT
    ?similar ?identity
FROM <http://sparql.uniprot.org/uniref>
FROM <http://sparql.uniprot.org/uniprot>
WHERE
{
    BIND (uniprotkb:P05067 AS ?protein)
    ?cluster up:member ?member ;
             up:member/up:sequenceFor ?protein;
             up:identity ?identity .
    ?member up:sequenceFor ?similar .
    FILTER(?similar != ?protein)
}
ORDER BY DESC(?identity)
LIMIT 5
```

## UniParc: the same sequence under different UniProtKB entries

[UniParc](https://www.uniprot.org/help/uniparc) is UniProt's non-redundant archive of every protein sequence it has ever seen, independent of which database entry it came from. Given a UniParc accession, you can ask which *active* UniProtKB entries currently share that exact sequence. Just like UniRef above, the live query keeps UniParc and UniProtKB data apart with `GRAPH` blocks; locally, they're already merged into one graph, so the first runnable version below drops the `GRAPH` wrappers. The second version is the real query, running live against `sparql.uniprot.org`.

```turtle fixture=uniparc-link
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix uniparc: <http://purl.uniprot.org/uniparc/>

uniparc:UPI000002DB1C up:sequenceFor <P04637> .
<P04637> a up:Protein .
```

```sparql fixture=uniparc-link
PREFIX up: <http://purl.uniprot.org/core/>

SELECT
  ?uniparc
  ?uniprot
WHERE {
  BIND(<http://purl.uniprot.org/uniparc/UPI000002DB1C> AS ?uniparc)
  ?uniparc up:sequenceFor ?uniprot .
  ?uniprot a up:Protein .
}
```

```sparql live="https://sparql.uniprot.org/sparql"
PREFIX up: <http://purl.uniprot.org/core/>

SELECT
  ?uniparc
  ?uniprot
WHERE {
  GRAPH <http://sparql.uniprot.org/uniparc>{
    BIND(<http://purl.uniprot.org/uniparc/UPI000002DB1C> AS ?uniparc)
    ?uniparc up:sequenceFor ?uniprot .
  }
  GRAPH <http://sparql.uniprot.org/uniprot> {
    ?uniprot a up:Protein .
  }
}
```

## Federated cross-references: reaching into another SPARQL endpoint

UniProtKB's own PDB cross-references are locally stored (as seen above), but you can also federate live with another endpoint's *own* cross-reference data, rather than UniProt's copy of it, using `SERVICE`. This runs for real: the `BIND` below is evaluated locally (there's no other local data needed for that part), and the `SERVICE` block sends its part of the query straight to PDBj/RDF Portal over the network, so it's a little slower than the other examples on this page &mdash; a handful of seconds is normal.

```turtle fixture=pdbj-federated
# Intentionally empty: this example needs no local data. `?protein` is bound
# directly in the query below, and all matching happens inside the SERVICE
# block, against PDBj/RDF Portal's own data.
```

```sparql fixture=pdbj-federated
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX uniprotkb: <http://purl.uniprot.org/uniprot/>
PREFIX pdbo: <http://rdf.wwpdb.org/schema/pdbx-with-vrptx-v50.owl#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

SELECT
  ?extendedPdbId
WHERE {
  BIND(uniprotkb:P04637 AS ?protein)
  # Compare with the cross-reference stored directly in UniProtKB:
  # ?protein rdfs:seeAlso ?pdb .
  # ?pdb up:database <http://purl.uniprot.org/database/wwPDB>
  SERVICE <https://rdfportal.org/pdb/sparql> {
    ?structRef pdbo:link_to_uniprot ?protein .
    ?pdbEntry pdbo:has_struct_refCategory/pdbo:has_struct_ref ?structRef .
    # Entries carry both their legacy 4-character code and the newer,
    # extended/versioned wwPDB identifier as skos:altLabel; the extended
    # one is the only one starting with "pdb_".
    ?pdbEntry skos:altLabel ?extendedPdbId .
    FILTER(STRSTARTS(?extendedPdbId, "pdb_"))
  }
}
```
