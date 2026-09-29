# Tips and tricks: publishing your own RDF resource

So you've read [what RDF is](../intro/tutorial.html) and worked through [SPARQL basics](../basic/tutorial.html), and now you have a dataset of your own - proteins, samples, variants, whatever your lab produces - that you want to publish as RDF instead of (or alongside) a CSV file or a bespoke database. This page is the practical checklist for that: the decisions to make, in a sensible order, and the mistakes people commonly make along the way.

It isn't more theory. For the "why" behind any of this, the [RDF and linked data](../intro/tutorial.html) page already covers it. This page is "what do I actually do."

## 1. Choose your identifiers before you write a single triple

Every resource in your dataset needs an IRI (an identifier that looks like a URL). Get this decision right first, because changing identifiers later breaks everyone who already linked to them.

**Check whether an identifier already exists before minting one.** This is the linked data principle from the intro page, applied to your own data: if the thing you're describing is a person, a chemical, a disease, an organism, or anything else that's likely already in [Wikidata](https://www.wikidata.org/), an existing ontology, or one of the life science identifier schemes (UniProt accessions, ChEBI IDs, NCBI Taxonomy IDs, ORCID for people, ROR for organisations...), reuse that identifier. Only mint a new one for the parts of your data that are genuinely yours - a sample you collected, a measurement you made, a result specific to your study.

**Use a domain you control, or a persistent-identifier service.** A URI under your lab's own website is fine as long as that website is going to exist in ten years. If you're not sure it will (lab websites move, projects end, institutions restructure their web servers), use a persistent-identifier redirector instead. SIB runs one of these for exactly this reason: [purl.expasy.org](https://purl.expasy.org) is a PURL (Persistent URL) service - a small redirector that sits in front of your identifiers and points them at wherever the actual data lives today, so the identifier itself never has to change even if the server behind it does. [w3id.org](https://w3id.org/) is the same idea, run by the W3C community. This site's own example data uses exactly this pattern: `https://purl.expasy.org/sparql-examples/training/ontology#` and `.../resource#` are PURLs, not a raw GitHub Pages or web server URL.

**Make identifiers stable by not encoding anything that might change into them.** Don't put a version number in a resource's identifier (`.../protein/P12345/v3`) - use a separate `dcterms:hasVersion` or similar triple instead, and let the identifier itself stay put across versions. The same goes for any other mutable attribute: a person's job title, a sample's current storage location, a gene's current preferred name. If it can change, it doesn't belong in the URI - it belongs in a triple that has that URI as its subject.

## 2. Reuse vocabulary instead of inventing it

Once you have identifiers for your *things*, you need identifiers for the *properties* and *classes* that describe them - and the same rule applies: check whether something already exists before you invent your own.

- For generic, cross-domain concepts (names, titles, dates, descriptions), [schema.org](https://schema.org/) is a large, well-known vocabulary that basically every RDF consumer already recognizes.
- For life-science-specific concepts, look at the [OBO Foundry](https://obofoundry.org/) ontologies - there's very likely already an ontology for your domain (organisms, diseases, anatomy, sequence features, chemical entities...) with terms other tools already understand.
- Only mint your own vocabulary term when the concept is genuinely specific to your resource and nothing generic covers it.

This site's own [`basic/`](https://github.com/sib-swiss/sparql-training/tree/master/basic) tutorial data is a real, small example of exactly this mix. Its ontology ([`basic/ontology.ttl`](https://github.com/sib-swiss/sparql-training/blob/master/basic/ontology.ttl)) reuses `rdf:type` and `rdfs:subClassOf` (from RDF/RDFS itself) and DBpedia's own `dbo:Person` and `dbp:name` rather than declaring an equivalent `tto:Person`/`tto:name` - there's no reason to invent those, DBpedia already has them and plenty of tools already know what they mean. But it does mint its own `tto:Creature`, `tto:Animal`, `tto:pet`, `tto:weight` and `tto:color` terms, because there is no existing generic vocabulary for "a person's pet and its weight and color" - that's genuinely specific to this teaching example, so it gets its own small ontology under the site's own namespace.

Every term in that ontology also carries an `rdfs:label`, which matters enough that it's worth trying out live. Here's an excerpt, with a query pulling the human-readable label back out for each term:

```turtle fixture=tto-ontology title="excerpt of basic/ontology.ttl"
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix dbo: <http://dbpedia.org/ontology/> .
@prefix tto: <https://purl.expasy.org/sparql-examples/training/ontology#> .

tto:Creature
	rdf:type rdfs:Class;
	rdfs:label "creature"^^xsd:string;
	rdfs:isDefinedBy tto: .

dbo:Person
	rdfs:subClassOf tto:Creature .

tto:Animal
	rdf:type rdfs:Class;
	rdfs:label "animal"^^xsd:string;
	rdfs:subClassOf tto:Creature ;
	rdfs:isDefinedBy tto: .

tto:pet
	rdf:type rdf:Property;
	rdfs:label "domestic animal"^^xsd:string;
	rdfs:domain dbo:Person ;
	rdfs:range tto:Animal ;
	rdfs:isDefinedBy tto: .
```

```sparql fixture=tto-ontology
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?term ?label WHERE {
  ?term rdfs:label ?label .
}
```

Every one of your own custom classes and properties should get a query result like that - a label a person can actually read, not just an IRI they have to go look up. More on that under pitfalls below.

## 3. Serve both a human page and machine-readable RDF at the same URI

A person clicking your identifier in a browser wants an HTML page. A script dereferencing the same identifier wants Turtle, RDF/XML, or JSON-LD. The standard way to give both is **content negotiation**: the same URI serves different representations depending on the `Accept` header the client sends.

You've already seen this in action twice on this site:

- The [intro tutorial](../intro/tutorial.html#building-i-elixir-as-a-real-rdf-triple) uses `orcid.org` researcher identifiers as an example subject - `orcid.org` itself content-negotiates, so fetching an ORCID with `Accept: text/turtle` gets you Turtle, while a plain browser visit gets an HTML profile page.
- This site's own `basic/ontology.ttl` and `basic/resource.ttl` are dereferenceable the same way, at `https://purl.expasy.org/sparql-examples/training/ontology` and `.../resource`: `Accept: text/turtle` gets you the raw Turtle file, anything else redirects to this site's own tutorial page.

A PURL-style redirector is a real, working implementation of exactly this pattern. SIB's own [PURL service](https://purl.expasy.org) is built on Apache's `mod_rewrite`: a `.htaccess` rule inspects the incoming `Accept` header and redirects to a Turtle file, an RDF/XML file, or a JSON-LD file if the client asked for RDF, and to a normal HTML page otherwise. You don't need to build this yourself from scratch - if you publish through a PURL or [w3id.org](https://w3id.org/), content negotiation is part of what the redirector already gives you. If you're serving files yourself, the same `Accept`-header logic works on any web server that can inspect request headers, Apache or otherwise.

Practically: publish your data as plain Turtle (and RDF/XML and/or JSON-LD if you have consumers who need them) as static files, and make sure whatever serves your identifier URIs can tell them apart by `Accept` header.

## 4. Publish a shape describing what your data looks like

Once your data has a URI, a vocabulary and an HTML/RDF split, tell people what "valid" looks like. A [SHACL](https://www.w3.org/TR/shacl/) shapes graph does this: it's itself just RDF, describing constraints like "every `dbo:Person` must have exactly one `dbp:name`" or "every `tto:weight` value must be a non-negative decimal."

This site has a real, worked SHACL example for the `basic/` tutorial dataset, in [`basic/shapes.ttl`](https://github.com/sib-swiss/sparql-training/blob/master/basic/shapes.ttl) - reproduced on the [SPARQL basics page](../basic/tutorial.html#data-shape-shacl) with a diagram. It defines a base `ex:CreatureShape` that every person and animal shares (a `tto:sex` with exactly one value, from a fixed set), and builds `ex:PersonShape`, `ex:AnimalShape`, `ex:CatShape` and friends on top of it with `sh:node`, the SHACL way of reusing one shape from another. It's small enough to read start to finish in a few minutes, and it's validated clean against the real tutorial data with Apache Jena's `shacl` command-line tool - the same way you'd validate your own data against your own shape:

```sh
shacl validate --shapes your-shapes.ttl --data your-data.ttl
```

A shape file costs little to write once your vocabulary is settled, and it saves everyone who wants to load your data the trouble of reverse-engineering what fields to expect by reading example triples.

## 5. Make your data queryable, not just downloadable

A Turtle file people have to download and load into their own tool is already useful. A live SPARQL endpoint is more useful again, because people can ask questions across your data (and, if you also support federated queries, across your data *and* someone else's) without downloading anything.

You don't need to build this yourself from nothing:

- A triple store (for example [Apache Jena Fuseki](https://jena.apache.org/documentation/fuseki2/), [Virtuoso](https://virtuoso.openlinksw.com/), or [QLever](https://github.com/ad-freiburg/qlever)) will load your Turtle files and give you a SPARQL endpoint with comparatively little setup.
- If running a server isn't realistic for your project, publishing a downloadable RDF dump (Turtle, N-Triples, or a compressed version of either) is a legitimate minimum - it's still far more reusable than a CSV, because anyone can load it straight into whatever triple store they already run, with no format conversion.

Running and tuning a production SPARQL endpoint is its own topic, well outside a tips page - the point here is just: know that "queryable" and "downloadable" are two different, both worthwhile, levels of publishing, and pick at least the second.

## Common pitfalls

A short list of things that trip people up the first time they publish RDF:

- **Blank nodes where a real identifier would do.** A blank node (an anonymous resource with no IRI) can't be linked to, referenced from other datasets, or dereferenced by anyone. If something is a real, identifiable thing in your data - a sample, a measurement, an observation - give it a real IRI, even a simple one under your own namespace. Save blank nodes for genuinely structural, "this only ever exists inside this one triple" cases.
- **Forgetting `rdfs:label` (or `dcterms:title`) on your own resources.** A graph made entirely of obscure IRIs is unreadable to a human exploring it, even though it's perfectly valid RDF. Every class, property and instance you mint yourself should carry a plain-text label, the same way every term in `basic/ontology.ttl` does above - it's what turns "what is `tto:pet`?" into an obvious answer with no lookup required.
- **Inconsistent or missing prefixes.** If your documentation, your example queries and your actual data don't all bind the same prefix to the same namespace, people copy-pasting your examples get confusing errors. Pick your prefixes once, write them down, and reuse them everywhere - including in any SHACL shapes or SPARQL examples you publish alongside the data.
- **Reinventing a property that already exists.** Before adding `myonto:createdOn` to your vocabulary, check whether `dcterms:created` already says what you mean. The fewer properties you invent, the more tools already understand your data on day one.

## Recap

In order: pick stable identifiers, checking for existing ones first; reuse existing vocabulary and only mint your own where nothing fits; serve both HTML and RDF from the same URI via content negotiation; publish a SHACL shape so consumers know what to expect; make the data queryable, at least as a downloadable dump; and label everything you mint yourself. None of this requires much infrastructure to start - a handful of static Turtle files behind a PURL, with labels and a shape, already gets you most of the way there.
