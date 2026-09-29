# schema.org and Bioschemas

The [RDF and linked data](../intro/tutorial.html) page mentioned in passing that [schema.org](https://schema.org/) markup on ordinary web pages is RDF-shaped data, in its section [RDF is more common than it looks](../intro/tutorial.html#rdf-is-more-common-than-it-looks). This page picks that thread up properly: what schema.org actually is, what Bioschemas adds for life sciences, and a worked example you can run right here.

If you haven't seen a triple, a subject, a predicate or an object before, read [RDF and linked data](../intro/tutorial.html) first - everything below assumes you know what those words mean.

## schema.org: one shared vocabulary for describing web pages

Every web page can, in principle, say what it's about in whatever words it likes. That's fine for a human reader, but useless for software: a page about a protein and a page about a used car both just look like "some text" to a machine unless something marks up what kind of thing is on the page, and which parts of the text mean what.

[schema.org](https://schema.org/) is a shared vocabulary - a set of classes (called "types") and properties - that anyone can reuse for exactly this. It was started in 2011 by Google, Microsoft, Yahoo and Yandex, and is maintained today as an open, community-governed project. It defines types like `Dataset`, `Person`, `Organization`, `SoftwareApplication` and `Article`, and properties like `name`, `description`, `author`, `identifier` and `license` that those types can carry.

Crucially for this site, schema.org's types and properties are real IRIs under the `https://schema.org/` namespace, exactly like `up:Protein` or `wd:Q316` were real IRIs in the [RDF and linked data](../intro/tutorial.html) examples. `schema:Dataset` is short for `<https://schema.org/Dataset>`, `schema:name` is short for `<https://schema.org/name>`, and so on - schema.org is just a very widely reused set of predicates and classes, nothing more exotic than that.

Pages usually publish this markup as **JSON-LD**, a JSON syntax for RDF, embedded in a `<script type="application/ld+json">` tag (often in the page's `<head>`). It can also be written as Microdata or RDFa attributes directly on the visible HTML, but JSON-LD is now the common, recommended way, because it sits next to the page's content instead of being woven into it. Search engines (and other tools) parse this markup to understand structured facts about the page - not just its text - which is what lets Google show a recipe's cook time, a product's price and star rating, or a dataset in [Google Dataset Search](https://datasetsearch.research.google.com/) as a "rich result" instead of a plain blue link.

## Bioschemas: schema.org's life-science profile

schema.org's vocabulary is deliberately general - it has to work for recipes, movies, and job postings as much as for anything else - so it doesn't, by itself, say how a bioinformatics resource should describe a protein record, a training course, or a dataset of reactions. That's what [Bioschemas](https://bioschemas.org/) is for.

Bioschemas is a community initiative, developed within the ELIXIR community, that defines **profiles**: specifications for exactly which schema.org types and properties to use, and how, to describe a given kind of life-science resource consistently. There are profiles covering things like datasets, software tools, training material, and records such as proteins, genes and samples. A profile doesn't invent a new vocabulary from scratch - it picks schema.org types and properties (`Dataset`, `SoftwareSourceCode`, `Person`, `name`, `description`, `creator`, ...) and pins down which ones a conformant record should carry, adding a small number of life-science-specific terms only where schema.org genuinely has no suitable property yet.

The payoff is the same one RDF gives you generally: if UniProt, Rhea, and every other Bioschemas-conformant resource describe their datasets the same way, a harvester (or a search engine, or Google Dataset Search) can find and compare "this URL is a Dataset, about this organism, with this license" across all of them, the same way a shopping site's product listings are all discoverable and comparable because they all use `schema:Product` the same way.

## A worked example: a UniProt entry as schema.org data

The [UniProt introduction](../UniProt/00_introduction.html) page builds a small RDF fixture around one real UniProtKB entry, `P0A877` (`TRPE_ECOLI`, anthranilate synthase component 1 from *E. coli*). Here's roughly how that same entry could be described for search engines and harvesters, as JSON-LD:

```json
{
  "@context": "https://schema.org/",
  "@type": "Dataset",
  "@id": "http://purl.uniprot.org/uniprot/P0A877",
  "name": "TRPE_ECOLI - Anthranilate synthase component 1",
  "description": "UniProtKB entry for Anthranilate synthase component 1 from Escherichia coli (strain K12).",
  "url": "http://purl.uniprot.org/uniprot/P0A877",
  "identifier": {
    "@type": "PropertyValue",
    "propertyID": "UniProtKB",
    "value": "P0A877"
  },
  "creator": {
    "@type": "Organization",
    "name": "UniProt Consortium",
    "url": "https://www.uniprot.org/help/about"
  },
  "license": "https://creativecommons.org/licenses/by/4.0/"
}
```

None of this is new syntax once you know what a triple is - it's the exact same idea as everywhere else on this site, just written as JSON instead of Turtle:

- `"@id"` is the **subject** - the thing this whole block is a statement about, an IRI exactly like `orcid:0000-0002-7449-1266` was in the "I love ELIXIR" example.
- `"@type": "Dataset"` says the subject is an instance of `schema:Dataset` - a class, the same role `up:Protein` played for `P0A877` in the UniProt fixture.
- Every other key (`"name"`, `"description"`, `"url"`, `"identifier"`, `"creator"`, `"license"`) is a **predicate** under the `https://schema.org/` namespace (because of the `"@context"` at the top), and its value is the **object** of that triple.
- A nested object, like the value of `"identifier"` or `"creator"`, is just another resource with its own `@type` and its own properties - an anonymous one here, with no `@id` of its own, which RDF calls a *blank node*.

If you haven't seen JSON-LD as an RDF serialization before, [RDF formats](../intro/formats.html) covers the format itself in more depth; the mapping above is enough to follow the rest of this page.

Written out as the plain RDF triples that JSON-LD block actually means, it looks like this - and because it's real data, you can run it the same way as every other example on this site:

```turtle fixture=schemaorg title="The same UniProt entry, as schema.org triples"
prefix schema: <https://schema.org/>
prefix uniprot: <http://purl.uniprot.org/uniprot/>

uniprot:P0A877 a schema:Dataset ;
  schema:name "TRPE_ECOLI - Anthranilate synthase component 1" ;
  schema:description "UniProtKB entry for Anthranilate synthase component 1 from Escherichia coli (strain K12)." ;
  schema:url "https://www.uniprot.org/uniprotkb/P0A877" ;
  schema:license <https://creativecommons.org/licenses/by/4.0/> ;
  schema:identifier [
    a schema:PropertyValue ;
    schema:propertyID "UniProtKB" ;
    schema:value "P0A877"
  ] ;
  schema:creator [
    a schema:Organization ;
    schema:name "UniProt Consortium" ;
    schema:url "https://www.uniprot.org/"
  ] .
```

```sparql fixture=schemaorg
PREFIX schema: <https://schema.org/>

SELECT ?dataset ?name ?creatorName WHERE {
  ?dataset a schema:Dataset ;
    schema:name ?name ;
    schema:creator ?creator .
  ?creator schema:name ?creatorName .
}
```

A Bioschemas profile for `Dataset` would go a step further than plain schema.org and say, precisely, which of these properties a conformant record must, should, or may carry, so that every resource publishing a `Dataset` record fills in the same handful of fields. Some Bioschemas profiles also add a `dct:conformsTo` property (from Dublin Core, another widely reused vocabulary) pointing at the profile's own URL, as a machine-readable way of saying "this record follows that specification" - worth knowing the pattern exists, without needing to memorize every profile's exact fields here.

Note: we use the same purl.uniprot.org identifiers in our schema.org markup. Because we want to describe the entity and not the webpage.

## Checking or adding markup on your own site

If you maintain a page for a dataset, tool, or resource and want it to be found this way:

- Add a `<script type="application/ld+json">` block to the page's HTML, with schema.org (and, for life-science resources, Bioschemas-profile) types and properties describing what's on the page - the JSON-LD block above is a reasonable starting shape for a `Dataset`.
- Check what you wrote actually parses and means what you think with a validator rather than guessing. Google's [Rich Results Test](https://search.google.com/test/rich-results) checks general schema.org markup and shows what a search engine would extract from it. Bioschemas also publishes its own tooling (linked from [bioschemas.org](https://bioschemas.org/)) for checking markup against a specific life-science profile - reach for that once you know which profile you're targeting.

## What's next

- [RDF and linked data](../intro/tutorial.html) - if any of "triple", "IRI" or "prefix" above wasn't already familiar.
- [RDF formats](../intro/formats.html) - JSON-LD alongside Turtle and other ways to write the same triples down.
- [UniProt: SPARQL and RDF](../UniProt/00_introduction.html) - the full RDF model behind the `P0A877` entry used above.
