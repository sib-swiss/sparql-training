# RDF file formats: same triples, different clothes

The [previous page](tutorial.html) built one triple - "I love ELIXIR" - out of three IRIs, then wrote it out in Turtle with `@prefix` shortcuts. That was one way of writing that triple down on disk or over the network. It's not the only way, and it's worth seeing the others before you go any further, so that when you meet an RDF/XML file in the wild (UniProt hands you one of these by default if you don't ask otherwise) you recognise it for what it is, instead of mistaking it for something unrelated to what you just learned.

## One model, several syntaxes

RDF itself is not a file format. It's a data model: a graph made of subject-predicate-object triples, full stop. A **serialization** is just a concrete text syntax for writing that graph down - the same way a phone number is still the same phone number whether you write it `+41 22 379 50 50` or `0041223795050` or space it out differently. Turtle, N-Triples, RDF/XML and JSON-LD are four serializations in common use. Parse any one of them and you get back the exact same set of triples; nothing about the graph itself changes depending on which syntax you chose to write it in.

Below is the same "I love ELIXIR" triple from the previous page, written out four times.

## Turtle - what you already know

You've seen this one already. Prefixes declared once with `@prefix`, then `subject predicate object .`:

```turtle fixture=ilovex title="I love ELIXIR, in Turtle"
@prefix orcid: <https://orcid.org/> .
@prefix wd: <http://www.wikidata.org/entity/> .
@prefix ror: <https://ror.org/> .

orcid:0000-0002-7449-1266 wd:Q316 ror:044rwnt51 .
```

It's still real, queryable data - the same fixture mechanism as every other example on this site:

```sparql fixture=ilovex
PREFIX orcid: <https://orcid.org/>
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX ror: <https://ror.org/>

SELECT ?person ?organisation WHERE {
  ?person wd:Q316 ?organisation .
}
```

## N-Triples - Turtle with no shortcuts at all

N-Triples is what you get if you take Turtle and ban every convenience: no `@prefix`, no grouping several predicates under one subject, nothing. Every triple is spelled out with full IRIs in angle brackets, one triple per line, each ending in a period. This is in fact exactly the form the previous page's triple started in, before prefixes were introduced:

```turtle
<https://orcid.org/0000-0002-7449-1266> <http://www.wikidata.org/entity/Q316> <https://ror.org/044rwnt51> .
```

Compare it line by line with the Turtle block above: `orcid:0000-0002-7449-1266` is just `<https://orcid.org/0000-0002-7449-1266>` with the `https://orcid.org/` part hidden behind the `orcid:` prefix, and the same goes for the other two terms. A prefix declaration is a promise to a parser - "wherever you see `wd:`, mentally substitute `http://www.wikidata.org/entity/`" - and N-Triples is what's left once every such promise has already been kept. It's tedious to write by hand on anything bigger than one triple, but that same bluntness makes it trivial for software to generate, stream line by line, and diff.

## RDF/XML - the original, and still everywhere

RDF/XML was the first standard RDF serialization, wrapping the same triple in XML. It's verbose and nobody enjoys writing it by hand, but a lot of established life-science resources still serve it as their default format - UniProt is one of them - so you'll run into it whether you choose to or not:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rdf:RDF
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:wd="http://www.wikidata.org/entity/">
  <rdf:Description rdf:about="https://orcid.org/0000-0002-7449-1266">
    <wd:Q316 rdf:resource="https://ror.org/044rwnt51"/>
  </rdf:Description>
</rdf:RDF>
```

The pieces map onto the Turtle version directly, just spelled with XML instead of Turtle's own punctuation: `rdf:about` on the `<rdf:Description>` element is the subject, the nested `<wd:Q316>` element is the predicate (using an XML namespace, `xmlns:wd`, to play exactly the role `@prefix wd:` played in Turtle), and its `rdf:resource` attribute is the object. Same three IRIs, same one triple.

## JSON-LD - RDF as JSON

JSON-LD is RDF written as ordinary JSON, with one extra key, `@context`, doing the same job as Turtle's `@prefix` block: mapping short names to full IRIs so the rest of the document can stay readable.

```json
{
  "@context": {
    "orcid": "https://orcid.org/",
    "wd": "http://www.wikidata.org/entity/",
    "ror": "https://ror.org/"
  },
  "@id": "orcid:0000-0002-7449-1266",
  "wd:Q316": {
    "@id": "ror:044rwnt51"
  }
}
```

`@context` reads exactly like the three `@prefix` lines in the Turtle block above, just as a JSON object instead of Turtle syntax. `@id` gives the subject, the key `wd:Q316` is the predicate, and its own `@id` is the object. If you've ever looked at [schema.org](https://schema.org/) markup embedded in an ordinary web page (the stuff that lets search engines show rich results for a recipe or a product), it's very often written as JSON-LD exactly like this - so this format is one you'll meet again, even outside bioinformatics.

## The point of all this

Four blocks of text above, one triple. Any RDF-aware tool can read any of the four and produce the identical graph - the same subject, the same predicate, the same object - because the format is only ever a question of how the graph gets written to disk, never what the graph says. Which one you reach for is a practical choice, not a correctness one: Turtle for anything a human is going to read or write, N-Triples when you want the dumbest possible format to generate or stream, RDF/XML because a resource you don't control chose it for you, JSON-LD when you're already living in JSON (a web page, a JavaScript app) and don't want to bring in a separate RDF library just to parse a small amount of linked data.

This site sticks to Turtle for every example after this page, for the same reason most people prefer it when they have the choice: it's the one built for humans.

## What's next

1. [SPARQL basics](../basic/tutorial.html) - the classic introductory tutorial, with a small people-and-pets dataset, covering the actual query syntax: triple patterns, `OPTIONAL`/`FILTER`, property paths, and aggregation.
2. [UniProt: SPARQL and RDF](../UniProt/00_introduction.html) - a real resource that serves its data as RDF/XML by default, among other formats.
