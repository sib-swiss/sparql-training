# Taxonomy

This page shows you how taxonomy data is represented in UniProt.

UniProtKB taxonomy data is manually curated (see details [here](https://www.uniprot.org/taxonomy/)). The organism that is the source of a protein sequence is identified by a unique identifier (often called *taxon* or *taxid*) from the [NCBI taxonomy](https://www.ncbi.nlm.nih.gov/taxonomy) database. This is the only taxonomy information stored directly on a UniProtKB entry &mdash; the full NCBI taxonomy is modeled and available separately.

## Organism identifier

The organism identifier (taxon) is stored in the `organism` property of a UniProt entry.

```turtle fixture=p05067
base <http://purl.uniprot.org/uniprot/>
prefix up: <http://purl.uniprot.org/core/>
prefix taxon: <http://purl.uniprot.org/taxonomy/>

<P05067> a up:Protein ;
         up:organism taxon:9606 .
```

## Retrieve the taxon (organism id) of a protein

```sparql fixture=p05067
PREFIX up: <http://purl.uniprot.org/core/>

SELECT ?protein ?taxon
WHERE {
  ?protein a up:Protein ;
           up:organism ?taxon .
}
```

## Taxonomy data

Common properties on a taxon resource:

- `rank`
- `mnemonic`
- `scientificName`
- `commonName`
- `otherName`
- `seeAlso` (cross-reference)
- `subClassOf` (hierarchy)

```turtle fixture=taxon title="The taxon:9606 (Homo sapiens) entry and its parent"
base <http://purl.uniprot.org/taxonomy/>
prefix up: <http://purl.uniprot.org/core/>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix skos: <http://www.w3.org/2004/02/skos/core#>

<9606> a up:Taxon ;
       up:rank up:Species ;
       up:mnemonic "HUMAN" ;
       up:scientificName "Homo sapiens" ;
       up:commonName "Human" ;
       up:otherName "Home sapiens", "Homo sapiens Linnaeus, 1758", "man" ;
       rdfs:seeAlso <http://www.ensembl.org/Homo_sapiens/Info/Index> ;
       rdfs:subClassOf <9605> ;
       skos:narrowerTransitive <63221>, <741158> ;
       up:partOfLineage false .

<9605> a up:Taxon ;
       up:rank up:Genus ;
       up:scientificName "Homo" ;
       up:otherName "Homo Linnaeus, 1758", "humans" ;
       rdfs:subClassOf <207598> ;
       skos:narrowerTransitive <9606>, <1425170>, <2665952> ;
       up:partOfLineage true .
```

### Retrieve the rank and the scientific name of the organism

The `rank` and `scientificName` are by far the most queried properties of a taxon.

```sparql fixture=taxon
PREFIX up: <http://purl.uniprot.org/core/>

SELECT ?taxon ?rank ?scientificName
WHERE {
  ?taxon a up:Taxon ;
         up:rank ?rank ;
         up:scientificName ?scientificName .
}
```

## Taxonomy hierarchy

Querying the taxonomic hierarchy is straightforward with the `rdfs:subClassOf` property. In the taxon example above:

- `<9605>` (*Homo*, genus) `rdfs:subClassOf` `<207598>`
- `<9606>` (*Homo sapiens*, species) `rdfs:subClassOf` `<9605>`

The UniProt SPARQL endpoint materializes all these relationships, so you don't need a SPARQL property path to query across levels of the taxonomy. Note that on other endpoints you might need `rdfs:subClassOf+` to reach higher levels.

```sparql fixture=taxon
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?species ?genus
WHERE {
  ?species a up:Taxon ;
           up:rank up:Species ;
           rdfs:subClassOf ?genus .
  ?genus a up:Taxon ;
         up:rank up:Genus .
}
```

## Host organisms

Sometimes an organism is known to be hosted inside another one (e.g. a parasite, a symbiont, an infection). The `host` property links an organism to its host.

```turtle fixture=host
base <http://purl.uniprot.org/taxonomy/>
prefix up: <http://purl.uniprot.org/core/>

<1241371> a up:Taxon ;
          up:mnemonic "ABHV" ;
          up:host <6451> .
```

```sparql fixture=host
PREFIX up: <http://purl.uniprot.org/core/>

SELECT ?virus ?host
WHERE {
  ?virus up:host ?host .
}
```

## Try it yourself: whole-database questions

The following question needs to be answered against the full UniProtKB dataset (counting reviewed entries across every domain of life), so it isn't something a small in-page fixture can meaningfully demonstrate. It's also, we found by actually testing it, too expensive to offer as a live "Run query" button here: joining every reviewed entry's organism against `rdfs:subClassOf` for all four taxonomic domains is a genuinely heavy query over the full dataset, and it timed out (30s+) both through this site's engine and with a raw request straight to the endpoint itself &mdash; a real performance limit of the query at this scale, not a client-side or federation issue. Try running it yourself, patiently, against the live endpoint at [sparql.uniprot.org](https://sparql.uniprot.org/sparql).

```sparql reference="How many organisms have at least one reviewed (Swiss-Prot) entry, per taxonomic domain?"
PREFIX taxon: <http://purl.uniprot.org/taxonomy/>
PREFIX up: <http://purl.uniprot.org/core/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?taxid ?scientificName ?domain ?domainName
WHERE {
  # reviewed entries
  ?uniprot up:reviewed true .
  # taxid
  ?uniprot up:organism ?taxid .
  ?taxid up:scientificName ?scientificName .

  VALUES ?domain { taxon:2      # bacteria
                    taxon:2157  # archaea
                    taxon:2759  # eukaryota
                    taxon:10239 # viruses
                  }
  ?taxid rdfs:subClassOf ?domain .
}
LIMIT 3
```
