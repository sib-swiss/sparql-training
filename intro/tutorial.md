# What is RDF and linked data?

Before you write a single SPARQL query, it helps to know what you're actually querying. This page is the missing first step before the [SPARQL basics](../basic/tutorial.html) tutorial - it doesn't teach any query syntax at all, just what RDF is, what a "triple" is, and why bioinformatics resources like UniProt and Rhea publish their data this way in the first place. If you already know what a triple is, skip straight to [SPARQL basics](../basic/tutorial.html).

The example below is adapted from a talk given to the ELIXIR track at ECCB, *"Bottom up interoperability using semantics in ELIXIR resources"*

## Why bother with a common format at all?

Every bioinformatics resource historically invented its own thing: its own file format, its own parser, its own database schema, its own loading pipeline - just to make its own data queryable by users. To get UniProt data one had to build such a pipeline, for Bgee another, and if you're building a new resource, you're expected to build a third, for your own. Each of those "parse, parse, parse" steps costs real engineering time and money, and at the end of it you have a database that only speaks its own private schema.

RDF (the Resource Description Framework) is the boring, simple fix for this: instead of everyone inventing their own schema, everyone represents their data as the same kind of thing - a graph made of very small, simple statements, described below. Once two resources are both RDF, you can query them *together*, live, over the network, with SPARQL's `SERVICE` keyword (the [Rhea metabolism tutorial](../Rhea/rhea.html) has real examples of this) - without ever copying either resource's data into some new central warehouse. That's the payoff: one generic format, plus federated SPARQL, instead of yet another bespoke integration project for every pair of resources that want to talk to each other.

## The smallest possible RDF statement: a triple

RDF breaks all data down into statements of exactly the same shape, each with three parts:

- a **subject** - the thing the statement is about
- a **predicate** - the relationship or property being stated
- an **object** - the value, or the other thing it's related to

"Jerven loves ELIXIR" is one such statement: subject `Jerven`, predicate `loves`, object `ELIXIR`. RDF calls one subject&ndash;predicate&ndash;object statement a **triple**, and a collection of triples is called a **graph**, because you can just as well draw it as a diagram: two dots (subject and object) joined by a labelled arrow (the predicate).

## Building "I ❤️ ELIXIR" as a real RDF triple

A sentence like "Jerven loves ELIXIR" is easy for a person to read, but useless for a machine: nothing tells a computer that *this* "Jerven" is the same "Jerven" mentioned somewhere else, or that "loves" here means the same thing as "loves" on some other page. RDF's answer is to stop using plain words for subject, predicate and object, and use **identifiers** instead - specifically, IRIs (internationalized URIs), the same kind of thing as a URL.

Here's the real example from the talk, built up one part at a time:

- **Subject** - the speaker's own [ORCID](https://orcid.org/) researcher identifier: `<https://orcid.org/0000-0002-7449-1266>`
- **Predicate** - not the English word "love", but [Wikidata](https://www.wikidata.org/)'s item for the *concept* of love: `<http://www.wikidata.org/entity/Q316>` (shown on the original slide as a ❤️, which is easier to read but means exactly this IRI)
- **Object** - ELIXIR's identifier in the [Research Organization Registry](https://ror.org/) (ROR): `<https://ror.org/044rwnt51>`

Put together, with a period to end the statement (exactly the way a sentence ends with a full stop), that's a complete, valid RDF triple:

```
<https://orcid.org/0000-0002-7449-1266> <http://www.wikidata.org/entity/Q316> <https://ror.org/044rwnt51> .
```

Read literally: *the thing identified by that ORCID* stands in *the relationship identified by that Wikidata item* to *the thing identified by that ROR ID*. In other words: "I ❤️ ELIXIR" - except every single part of it is a real, resolvable identifier, minted by three completely independent registries (a researcher-ID registry, a general-knowledge database, and an organisation registry) that don't know about each other and didn't have to agree on anything in advance.

As a note RDF that looks like this is RDF in the ntriples format.

## Prefixes: the same triple, easier to read and write

Full IRIs in angle brackets are precise but tedious to type out and re-type for every triple that reuses them. Turtle (the RDF text format used throughout this site) lets you declare a short **prefix** for the repeated, unchanging part of an IRI (its *namespace*) with `@prefix`, and then write `prefix:localpart` instead of the whole thing - the two are interchangeable; `prefix:localpart` is just shorthand that expands back to `<namespace><localpart>` before anything reads it.

```turtle fixture=ilovex title="I love ELIXIR, as one RDF triple"
@prefix orcid: <https://orcid.org/> .
@prefix wd: <http://www.wikidata.org/entity/> .
@prefix ror: <https://ror.org/> .

orcid:0000-0002-7449-1266 wd:Q316 ror:044rwnt51 .
```

That's the exact same triple as above, just written with prefixes instead of full angle-bracketed IRIs - click **Visualize as graph** to see it drawn out as one subject, one predicate-labelled arrow, and one object, the same shape every RDF triple has, however big the graph around it eventually gets.

Because it's real data, you can also query it, the same way every other example dataset on this site works:

```sparql fixture=ilovex
PREFIX orcid: <https://orcid.org/>
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX ror: <https://ror.org/>

SELECT ?person ?organisation WHERE {
  ?person wd:Q316 ?organisation .
}
```

`?person` and `?organisation` are variables - SPARQL fills them in with whatever matches the fixed part of the pattern (here, the predicate `wd:Q316`, "love"). With only one triple in the graph, there's only one possible answer, but this is exactly the same mechanism the [SPARQL basics](../basic/tutorial.html) tutorial builds on with a bigger dataset.

## Why use someone else's identifier instead of just a string?

It would have been much simpler to write the predicate as the plain word `"love"` instead of `wd:Q316`. The reason not to is sitting on Wikidata's own page for that item, [wikidata.org/wiki/Q316](https://www.wikidata.org/wiki/Q316): a real, dereferenceable identifier is a door into everything else somebody else has already recorded about that concept - a description, labels in dozens of languages, and links to related items - none of which a private string like `"love"` could ever give you. Follow the identifier, and you get more than you asked for, for free.

That's also the whole idea behind the phrase **linked data**: whenever a concept, an organisation, a gene, a disease, a chemical, or anything else you want to talk about already has a published, resolvable identifier somewhere, reuse *that* one instead of inventing your own string. Do it enough, across enough independent resources, and everyone's data starts pointing at the same shared set of identifiers - which means it's already linked together, without anyone having agreed on it in a meeting first.

## Prove it: pull in the real data

Everything above is a claim about what a real identifier lets you do. Here's the claim actually happening, live, in your own browser, right now: `<http://www.wikidata.org/entity/Q316>` and `<https://orcid.org/0000-0002-7449-1266>` are both ordinary web addresses, and both Wikidata and ORCID will answer a plain request for one with real Turtle - no API key, no special client, and nothing on this site's own server involved.

The button below makes your browser send two independent requests, straight to wikidata.org and orcid.org, asking for Turtle instead of a web page (an HTTP `Accept: text/turtle` header does that). Whatever comes back gets parsed and merged straight into the graph above: ORCID's own facts about the ORCID identifier (a name, a location, a link to a social profile), and Wikidata's own facts about the "love" item (its label, its description, an alternate name, and what kind of thing Wikidata classifies it as), all get added as new nodes and edges around the original triple. Each node is colored by where it came from, so you can tell at a glance what was already on this page and what your browser just fetched.

One honest caveat: both records publish far more than what gets added here. Wikidata's page for "love" alone carries well over a thousand statements about that one item - identifiers in other library and reference databases, links to related items in dozens of languages, and more. Merging in everything either source returns would draw an unreadable tangle instead of a graph anyone could actually read, so this keeps only each record's own direct statements, filtered down further for Wikidata to just its label, description, alternate label, and its two most direct classification links (`instance of` and `subclass of`). Everything else really is there - follow the identifiers yourself, using the links earlier on this page, to see the rest.

<!-- data-orcid-url intentionally points at pub.orcid.org's resolved RDF endpoint, not the
     pretty https://orcid.org/... identifier: content-negotiating that identifier goes through
     two redirects (orcid.org -> pub.orcid.org -> pub.orcid.org/experimental_rdf_v1/...) and
     the redirect responses themselves carry no Access-Control-Allow-Origin header, so a
     browser fetch() fails with a CORS error partway through even though the final response
     is CORS-open. Fetching the already-resolved URL directly skips the redirects entirely.
     data-orcid-subject stays the real https://orcid.org/... identifier, since that's still
     the subject IRI the fetched triples themselves use. -->
<div class="sparql-live-fetch" data-fixture-id="ilovex" data-wikidata-url="https://www.wikidata.org/wiki/Special:EntityData/Q316.ttl" data-wikidata-subject="http://www.wikidata.org/entity/Q316" data-orcid-url="https://pub.orcid.org/experimental_rdf_v1/0000-0002-7449-1266" data-orcid-subject="https://orcid.org/0000-0002-7449-1266">
<button type="button" class="sparql-btn sparql-live-fetch-btn">Fetch live data from Wikidata &amp; ORCID</button>
<p class="sparql-live-fetch-legend"><span class="sparql-live-fetch-swatch sparql-live-fetch-swatch-wikidata"></span>added from Wikidata<span class="sparql-live-fetch-swatch sparql-live-fetch-swatch-orcid"></span>added from ORCID</p>
<p class="sparql-live-fetch-status" aria-live="polite">Not fetched yet.</p>
</div>

This is a real network call over the open internet, not a canned demo, so it can fail the same way any other request can: if wikidata.org or orcid.org is briefly rate-limiting, slow, or down, the status line above says so honestly instead of quietly showing nothing.

### A predicate can also be a subject

Once you've fetched the live data, look closely at `wd:Q316` in the graph. It shows up twice: once as the label on the arrow connecting Jerven to ELIXIR (where it's a **predicate**), and once as its own node with a label ("love"), a description and a couple of classification links (where it's a **subject**) - because that's exactly what Wikidata's own data about it looks like: a bunch of triples with `wd:Q316` as their subject. A faint dashed line ties the two together, since they're not two different things that happen to share a name - they're the exact same node, just seen playing two different roles.

That's not a special case or a coincidence: in RDF, a predicate is nothing more than an IRI, and an IRI is never permanently "a predicate" any more than a word is permanently "a verb" - it's whatever role it's playing in the sentence you're looking at right now. The very same `wd:Q316` is a predicate in the triple `orcid:... wd:Q316 ror:...`, and a subject in the triple `wd:Q316 rdfs:label "love"`. Nothing about the identifier itself changes between those two triples; only its position does. This is one of the things that makes RDF a genuine *graph* rather than a tree or a fixed schema: relationships are first-class resources too, capable of having their own facts, and there's no separate namespace or syntax keeping "things" and "relationships between things" apart.

## Abuse your abbreviation power (a fun aside)

A `@prefix` name is just a label you choose for yourself - nothing says it has to be a tidy abbreviation like `wd` or `orcid`. Lets push this to its limit with a slide that binds each prefix straight to one of the three *whole* IRIs from the example above, rather than to a shared namespace stem:

```turtle
@prefix jerven: <https://orcid.org/0000-0002-7449-1266> .
@prefix wd: <http://www.wikidata.org/entity/> .
@prefix ELIXIR: <https://ror.org/044rwnt51> .

jerven: wd:Q316 ELIXIR: .
```

That's a real, parseable Turtle triple, and it says exactly the same thing as every version above - `jerven:` and `ELIXIR:` are what Turtle calls a *prefixed name with an empty local part*: a colon with nothing after it is valid on its own, and it expands to precisely the IRI the prefix was bound to, no local part needed. It reads almost like English: `jerven: wd:Q316 ELIXIR:` - "Jerven loves ELIXIR".

Either way, treat this as a trick, not the normal pattern: everywhere else on this site (and in almost everything you'll read elsewhere), a prefix is bound once to a shared namespace stem - like `wd:` above - and then reused across many different terms (`wd:Q316`, `wd:Q42`, `wd:Q5`, ...), not declared fresh for every single term the way `jerven:` and `ELIXIR:` are here. However, in some datasets this can turn a soup of identifiers into a very readable set of knowledge.

## There's more: semantics via rules (optional, just a taste)

Triples on their own are just facts; RDF has companion languages for stating *rules* about those facts, so software can derive new ones. [OWL](https://www.w3.org/OWL/) (the Web Ontology Language) is the usual one. As a single example, back on Wikidata, the item for "love" and the Wikidata *lexeme* for "hate" can be declared mutually exclusive:

```turtle
@prefix wd: <http://www.wikidata.org/entity/> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .

wd:Q316 owl:disjointWith wd:L4473 .
```

That one extra triple lets a reasoner conclude that nothing can simultaneously be an instance of both "love" and "hate". This is a genuinely deep topic (description logics, reasoners, inference) and well outside the scope of this page - it's here so you know the word OWL exists and roughly what it's for, not to teach it.

## RDF is more common than it looks

You've probably already produced or consumed RDF-like structured data without calling it that:

- Many web pages embed [schema.org](https://schema.org/) markup describing what's on the page (an article, a recipe, a product) - that's RDF-shaped data, and it's why search engines can show rich results.
- PDF files, spreadsheets and office documents carry metadata (author, creation date, revision history) in a similarly structured, subject&ndash;predicate&ndash;object way.
- Flight and hotel bookings in your email, and the ontologies and controlled vocabularies used throughout bioinformatics, all encode the same basic pattern.

None of this is exotic. It's a big part of what the FAIR data principles mean by "Findable" and "Interoperable" (**F1**, **I1**): stable identifiers, in a common, machine-readable structure.

## Who actually publishes this in bioinformatics?

RDF and SPARQL aren't an academic exercise here: a long list of ELIXIR and SIB resources already publish their data this way and answer SPARQL queries live, including [UniProt](https://sparql.uniprot.org/sparql), [Rhea](https://sparql.rhea-db.org/sparql), ChEBI, [Bgee](https://www.bgee.org/sparql), ChEMBL, SwissLipids, OrthoDB, HAMAP, Cellosaurus, BRENDA and IDSM/Sachem (used for chemical similarity search), among others.

## What's next

Now that you know what a triple is, why RDF exists, and what "linked data" means in practice, you're ready for:

1. [SPARQL basics](../basic/tutorial.html) - the classic introductory tutorial, with a small people-and-pets dataset, covering the actual query syntax: triple patterns, `OPTIONAL`/`FILTER`, property paths, and aggregation.
2. [UniProt: SPARQL and RDF](../UniProt/00_introduction.html) - the same ideas applied to a real, large-scale bioinformatics resource.
3. [Rhea: metabolism tutorial](../Rhea/rhea.html) - including federated queries across several of the real resources listed above.
