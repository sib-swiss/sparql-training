# SPARQL and RDF tools

Every other page on this site teaches you to write queries. This one asks a different question: what software actually implements all this - the triple stores, query engines, RDF libraries, validators and visualizers you'd reach for once you're building something real?

Instead of hand-writing that list here and letting it go stale, we ask Wikidata for it. [Wikidata](https://www.wikidata.org/) is itself a big public knowledge graph, edited by volunteers, with its own SPARQL endpoint at [query.wikidata.org](https://query.wikidata.org/) - so asking it "what semantic web software do you know about" is a genuine SPARQL query against a genuine linked-data resource, not a gimmick. It's also a nice full-circle example: everything you've learned about triple patterns, `OPTIONAL` and `SERVICE` on the earlier pages applies directly to a completely different dataset than UniProt or Rhea.

## The query

This asks Wikidata for every item marked as an instance of ["semantic web software"](https://www.wikidata.org/wiki/Q124653107) that has a homepage link, and pulls in each one's English description through Wikidata's label service. It runs live, in your browser, every time you load this page - the results below are whatever Wikidata knows right now.

```sparql live="https://query.wikidata.org/sparql"
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX schema: <http://schema.org/>
PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX bd: <http://www.bigdata.com/rdf#>

SELECT ?toolLabel (SAMPLE(?descr) AS ?description) (SAMPLE(?website) AS ?homepage)
WHERE {
  ?tool wdt:P31 wd:Q124653107 .        # instance of: semantic web software
  ?tool wdt:P856 ?website .            # has an official website
  OPTIONAL {
    ?tool schema:description ?descr .
    FILTER(LANG(?descr) = "en")
  }
  SERVICE wikibase:label {
    bd:serviceParam wikibase:language "en,mul" .
  }
}
GROUP BY ?tool ?toolLabel
ORDER BY ?toolLabel
LIMIT 250
```

Right now that's about 200 tools, everything from triple stores like Blazegraph and Apache Jena's TDB to query engines, ontology editors, RDF converters and reasoners. Some entries are more polished than others - this is exactly what a community-maintained knowledge graph looks like, warts included.

## Is your tool missing?

If a tool you use every day isn't in the list, that's not a bug in this page - it just means nobody has added it to Wikidata yet. Anyone can fix that. Wikidata is community-edited the same way Wikipedia is: create an account, create an item for the tool (or edit it if one already exists but is missing the right statement), and give it an `instance of` (P31) statement pointing at [semantic web software](https://www.wikidata.org/wiki/Q124653107) or a more specific subclass such as [triplestore](https://www.wikidata.org/wiki/Q3539533). Add a website (P856) and a short description while you're there, and the query above will pick it up automatically the next time this page loads. Wikidata's own [introduction for new editors](https://www.wikidata.org/wiki/Wikidata:Introduction) walks through the mechanics in more detail than we will here.

## The ecosystem behind this site

A few of these tools aren't abstract entries in a list - this site runs on them:

- [Comunica](https://comunica.dev/) is the SPARQL engine running in your browser right now, executing every `live=` and `fixture=` query block on this whole site, including the one above.
- [N3.js](https://github.com/rdfjs/N3.js) parses every Turtle fixture you've clicked "Run query" on.
- The SHACL shape in [`basic/shapes.ttl`](../basic/shapes.ttl) describes what valid data looks like for the basics tutorial's dataset, checked with Apache Jena's `shacl` command-line tool - the same kind of validator you'll find several of in the list above.

```note
None of that is special-cased. They're ordinary members of the same ecosystem the query above is listing.
```
