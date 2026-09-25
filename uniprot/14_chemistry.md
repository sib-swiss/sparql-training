# Chemistry: ligands, cofactors, PTMs & catalytic activity

UniProt annotates a lot of chemistry directly on a protein entry: the ligands and cofactors bound at specific sites (cross-referenced to [ChEBI](https://www.ebi.ac.uk/chebi/)), post-translational modifications (PTMs) like phosphorylation, and the catalytic activity of enzymes (linked to [Rhea](https://www.rhea-db.org/) reactions and EC numbers). For some questions, UniProt also federates out with a live SPARQL `SERVICE` call to other public endpoints &mdash; this page ends with a chemical substructure similarity search against [IDSM/Sachem](https://idsm.elixir-czech.cz/), finding proteins that bind something structurally similar to a given molecule (kept as a reference example rather than runnable, for reasons explained there).

## Catalytic activity

A `up:Catalytic_Activity_Annotation` links a protein to the [Rhea](https://www.rhea-db.org/) reaction it catalyzes. Like most UniProt annotations, that link can itself be backed by evidence &mdash; here, using RDF reification to attach an ECO evidence code (`ECO:0000269` = experimental evidence) to the specific `up:catalyticActivity` triple.

```turtle fixture=catalytic-activity
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix rh: <http://rdf.rhea-db.org/>
prefix obo: <http://purl.obolibrary.org/obo/>

<Q07973> up:reviewed true ;
  up:annotation <Q07973#CA> ;
  up:attribution <Q07973#Attr1> .

<Q07973#CA> a up:Catalytic_Activity_Annotation ;
  up:catalyticActivity <Q07973#CAca> .

<Q07973#CAca> up:catalyzedReaction rh:10743 .

[] rdf:subject <Q07973#CA> ;
   rdf:predicate up:catalyticActivity ;
   rdf:object <Q07973#CAca> ;
   up:attribution <Q07973#Attr1> .

<Q07973#Attr1> up:evidence obo:ECO_0000269 .
```

```sparql fixture=catalytic-activity
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT ?protein ?rhea
WHERE {
  # ECO 269 is experimental evidence
  BIND (<http://purl.obolibrary.org/obo/ECO_0000269> as ?evidence)

  ?protein up:reviewed true ;
    up:annotation ?a ;
    up:attribution ?attribution .

  ?a a up:Catalytic_Activity_Annotation ;
    up:catalyticActivity ?ca .
  ?ca up:catalyzedReaction ?rhea .

  [] rdf:subject ?a ;
    rdf:predicate up:catalyticActivity ;
    rdf:object ?ca ;
    up:attribution ?attribution .

  ?attribution up:evidence ?evidence .
}
```

```sparql reference="Real version, restricted to the reviewed section via a named graph &mdash; run at https://sparql.uniprot.org/sparql"
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT
  ?protein
  ?rhea
WHERE {
  # ECO 269 is experimental evidence
  BIND (<http://purl.obolibrary.org/obo/ECO_0000269> as ?evidence)
  GRAPH <http://sparql.uniprot.org/uniprot> {
    ?protein up:reviewed true ;
      up:annotation ?a ;
      up:attribution ?attribution  .

    ?a a up:Catalytic_Activity_Annotation ;
      up:catalyticActivity ?ca .
    ?ca up:catalyzedReaction ?rhea .

    [] rdf:subject ?a ;
      rdf:predicate up:catalyticActivity ;
      rdf:object ?ca ;
      up:attribution ?attribution .

    ?attribution up:evidence ?evidence .
  }
}
```

## Cofactors & metal binding

Binding sites are annotated with `up:ligand`, pointing at a ligand resource that is itself `rdfs:subClassOf` a ChEBI term &mdash; so you can search "binds a metal ion" by walking up the ChEBI hierarchy with a property path, rather than listing every possible metal individually. `CHEBI:25213` is the general "metal cation" class.

```turtle fixture=metal-binding
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix obo: <http://purl.obolibrary.org/obo/>
prefix CHEBI: <http://purl.obolibrary.org/obo/CHEBI_>

<P0A877> up:annotation <P0A877#BS1> .

<P0A877#BS1> up:ligand <P0A877#BS1_Zn> .

<P0A877#BS1_Zn> rdfs:subClassOf CHEBI:29105 .

CHEBI:29105 rdfs:subClassOf CHEBI:25213 ;
  rdfs:label "zinc ion" .

[] rdf:subject <P0A877> ;
   rdf:predicate up:annotation ;
   rdf:object <P0A877#BS1> ;
   up:attribution <P0A877#Attr1> .

<P0A877#Attr1> up:evidence obo:ECO_0000269 .
```

```sparql fixture=metal-binding
PREFIX CHEBI: <http://purl.obolibrary.org/obo/CHEBI_>
PREFIX obo: <http://purl.obolibrary.org/obo/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT
  ?ligand
  ?ligandName
  (COUNT(DISTINCT ?protein) as ?entries)
WHERE {
   ?protein up:annotation ?annotation .

   VALUES ?evs { obo:ECO_0000269 obo:ECO_0007744 } .
   VALUES ?chebids { CHEBI:25213 CHEBI:25214 } .
   ?st rdf:subject ?protein ;
       rdf:predicate up:annotation ;
       rdf:object ?annotation ;
       up:attribution/up:evidence ?evs .

   ?annotation up:ligand/rdfs:subClassOf ?ligand .
   ?ligand rdfs:subClassOf+ ?chebids ;
     rdfs:label ?ligandName .
}
GROUP BY ?ligand ?ligandName
ORDER BY DESC(?entries)
```

`CHEBI:25213` (metal cation) and `CHEBI:25214` (metal cluster) are the two top-level classes being matched against here; `ECO:0000269` (experimental evidence) and `ECO:0007744` (combinatorial computational and experimental evidence) are the two evidence codes accepted.

## Post-translational modifications

Modified residues are annotated with `up:Modified_Residue_Annotation`; which residue was modified and how is recorded as free text in `rdfs:comment` (e.g. `"Phosphoserine"`, sometimes followed by the responsible kinase, e.g. `"Phosphoserine; by PKA"`). This example buckets reviewed human proteins by which of the three phosphorylatable residues (serine, threonine, tyrosine) they have annotated.

```turtle fixture=phosphorylation
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix taxon: <http://purl.uniprot.org/taxonomy/>

<P1> a up:Protein ;
  up:organism taxon:9606 ;
  up:reviewed true ;
  up:annotation <P1#Mod1> .
<P1#Mod1> a up:Modified_Residue_Annotation ;
  rdfs:comment "Phosphoserine" .

<P2> a up:Protein ;
  up:organism taxon:9606 ;
  up:reviewed true ;
  up:annotation <P2#Mod1> .
<P2#Mod1> a up:Modified_Residue_Annotation ;
  rdfs:comment "Phosphoserine; by PKA" .

<P3> a up:Protein ;
  up:organism taxon:9606 ;
  up:reviewed true ;
  up:annotation <P3#Mod1> .
<P3#Mod1> a up:Modified_Residue_Annotation ;
  rdfs:comment "Phosphotyrosine" .
```

```sparql fixture=phosphorylation
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>

SELECT
  ?residue
  (COUNT(DISTINCT ?protein) AS ?proteinCount)
WHERE {
  ?protein a up:Protein ;
    up:organism taxon:9606 ;
    up:reviewed true ;
    up:annotation ?annotation .
  ?annotation a up:Modified_Residue_Annotation ;
    rdfs:comment ?comment .
  BIND(
    IF(STRSTARTS(?comment, "Phosphoserine"), "Serine",
    IF(STRSTARTS(?comment, "Phosphothreonine"), "Threonine",
    IF(STRSTARTS(?comment, "Phosphotyrosine"), "Tyrosine", ?comment)))
    AS ?residue)
  FILTER(?residue IN ("Serine", "Threonine", "Tyrosine"))
}
GROUP BY ?residue
ORDER BY DESC(?proteinCount)
```

## Chemical similarity search: ligands like heme

[IDSM/Sachem](https://idsm.elixir-czech.cz/) is a specialized cheminformatics engine that indexes ChEBI by molecular structure. Given a query molecule as a SMILES string (here, heme), it returns every ChEBI compound structurally similar to it, ranked by similarity score &mdash; and because ChEBI compounds are exactly what UniProt's `up:ligand` links point at, the result plugs directly into "which proteins bind something like this molecule?".

This site's [Comunica](https://comunica.dev/) engine is capable of real, live federation &mdash; standard public endpoints like `sparql.uniprot.org` and `sparql.rhea-db.org` reliably answer arbitrary SPARQL sent to them this way. IDSM/Sachem is different: it's a non-standard SPARQL *extension* (the `sachem:similaritySearch` predicate isn't a real triple, it's a trigger for a procedural structure search), and testing it repeatedly showed Comunica's query planner handles that inconsistently &mdash; sometimes it sends the real search, sometimes it gives up after a discovery request the service doesn't answer the way a normal endpoint would, non-deterministically, request to request. The service itself is fine every time (confirmed by calling it directly); the flakiness is specifically in how the generic federation engine talks to this specific non-standard one. Rather than ship a **Run query** button that silently fails at random, this one stays a reference example &mdash; paste it into the UniProt SPARQL endpoint to run it for real, every time:

```sparql reference="Chemical substructure similarity search via IDSM/Sachem &mdash; run at https://sparql.uniprot.org/sparql"
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX sachem: <http://bioinfo.uochb.cas.cz/rdf/v1.0/sachem#>
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT
  ?protein
  ?mnemonic
  ?proteinName
  ?ligandSimilarityScore
  ?ligand
WHERE {
  SERVICE <https://idsm.elixir-czech.cz/sparql/endpoint/chebi> {
    ?ssc sachem:compound ?ligand;
      sachem:score ?ligandSimilarityScore ;
      sachem:similaritySearch ?sss .
        # Smiles of Heme
    ?sss    sachem:query "CC1=C(CCC([O-])=O)C2=[N+]3C1=Cc1c(C)c(C=C)c4C=C5C(C)=C(C=C)C6=[N+]5[Fe-]3(n14)n1c(=C6)c(C)c(CCC([O-])=O)c1=C2";
      sachem:cutoff "8e-1"^^xsd:double ;
      sachem:aromaticityMode sachem:aromaticityDetect ;
      sachem:similarityRadius 1 ;
      sachem:tautomerMode sachem:ignoreTautomers .
  }
  ?protein up:mnemonic ?mnemonic ;
    up:recommendedName/up:fullName ?proteinName ;
    up:annotation ?annotation .
  ?annotation a up:Binding_Site_Annotation ;
      up:ligand/rdfs:subClassOf ?ligand .
}
ORDER BY DESC(?ligandSimilarityScore)
```

The `sachem:cutoff`, `sachem:similarityRadius` and `sachem:tautomerMode` parameters control how strict the "similar to" match is. `SERVICE idsm:chebi` (a shorthand for this same endpoint) also appears in the [Rhea metabolism tutorial](../rhea/SWAT4HCLS_2019/rhea_tutorial_SWAT4HCLS_2019.html#q30-retrieve-the-rhea-reactions-that-involve-cholesterol-or-cholesterol-derivatives) on this site, searching Rhea reactions instead of UniProt binding sites &mdash; same reasoning applies there.

## Active site chemistry

An active site's position is recorded with [FALDO](https://link.springer.com/article/10.1186/s13326-016-0067-z) (a small ontology for describing sequence positions/ranges), pointing at a specific position on the protein's sequence. Combined with the raw sequence string, you can check what residue is actually sitting there &mdash; here, filtering for active sites where that residue is tyrosine (Y).

```turtle fixture=active-site
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix faldo: <http://biohackathon.org/resource/faldo#>
prefix isoform: <http://purl.uniprot.org/isoforms/>

<P1> up:annotation <P1#AS1> ;
  up:sequence isoform:P1-1 .

<P1#AS1> a up:Active_Site_Annotation ;
  up:range <P1#AS1_range> .

<P1#AS1_range> faldo:begin <P1#AS1_begin> .

<P1#AS1_begin> faldo:position 5 ;
  faldo:reference isoform:P1-1 .

isoform:P1-1 rdf:value "MKTAYIVLRS" .
```

```sparql fixture=active-site
PREFIX faldo: <http://biohackathon.org/resource/faldo#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT
  ?protein
WHERE {
  ?protein up:annotation ?activeSiteAnnotation .
  ?activeSiteAnnotation a up:Active_Site_Annotation ;
    up:range ?range .
  ?range faldo:begin ?begin .
  ?begin faldo:position ?beginPosition ;
    faldo:reference ?sequence .
  ?sequence rdf:value ?sequenceVal .
  FILTER(SUBSTR(?sequenceVal, ?beginPosition, 1) = 'Y')
}
```

## Allosteric ligands

Not every ligand just sits in the active site &mdash; some regulate the enzyme from elsewhere on the protein. UniProt records this kind of detail as free text in `rdfs:comment` on the ligand resource itself, so it's searchable with a simple `REGEX`.

```turtle fixture=allosteric
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix CHEBI: <http://purl.obolibrary.org/obo/CHEBI_>

<P1> up:annotation <P1#BS1> .
<P1#BS1> a up:Binding_Site_Annotation ;
  up:ligand <P1#BS1_ATP> .
<P1#BS1_ATP> rdfs:comment "Allosteric activator" ;
  rdfs:subClassOf CHEBI:30616 ;
  rdfs:label "ATP" .
```

```sparql fixture=allosteric
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT
  ?protein
  ?ligandName
  ?ligandNote
  ?chebi
WHERE {
   ?protein up:annotation ?annotation .
   ?annotation a up:Binding_Site_Annotation .
   ?annotation up:ligand ?ligand .
   ?ligand rdfs:comment ?ligandNote ;
     rdfs:subClassOf ?chebi ;
     rdfs:label ?ligandName .
   FILTER(REGEX(?ligandNote, "allosteric", "i"))
}
```

## Enzyme classification (EC)

Finally, zooming out: every enzyme can be classified with an [EC (Enzyme Commission) number](https://en.wikipedia.org/wiki/Enzyme_Commission_number), which itself forms a small hierarchy down to `ec:1.-.-.-` .. `ec:7.-.-.-` at the top level. An enzyme number can be attached to a whole protein, or (for multi-functional proteins) to just one `up:domain` or `up:component` &mdash; the property path `(up:enzyme | up:domain/up:enzyme | up:component/up:enzyme)` catches all three cases in one go.

```turtle fixture=ec-classification
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix ec: <http://purl.uniprot.org/enzyme/>

ec:1.1.1.1 rdfs:subClassOf ec:1.-.-.- .
ec:2.7.1.1 rdfs:subClassOf ec:2.-.-.- .

<P1> up:enzyme ec:1.1.1.1 .
<P2> up:enzyme ec:1.1.1.1 .
<P3> up:domain <P3#dom1> .
<P3#dom1> up:enzyme ec:2.7.1.1 .
```

```sparql fixture=ec-classification
PREFIX ec: <http://purl.uniprot.org/enzyme/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX up: <http://purl.uniprot.org/core/>

SELECT ?ecClass (COUNT(?protein) as ?size)
WHERE
{
    VALUES (?ecClass) {(ec:1.-.-.-) (ec:2.-.-.-) (ec:3.-.-.-) (ec:4.-.-.-) (ec:5.-.-.-) (ec:6.-.-.-) (ec:7.-.-.-)} .
    ?protein ( up:enzyme | up:domain/up:enzyme | up:component/up:enzyme ) ?enzyme .
    # Enzyme subclasses are materialized on the live endpoint, no need for rdfs:subClassOf+ there
    ?enzyme rdfs:subClassOf ?ecClass .
}
GROUP BY ?ecClass ORDER BY ?ecClass
```
