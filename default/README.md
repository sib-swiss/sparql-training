This directory holds the classic introductory SPARQL tutorial originally from [SPARQL playground](https://github.com/calipho-sib/sparql-playground) (SIB's earlier standalone training tool), carried over as-is into this site. It's a simple people-and-pets dataset used to teach basic triple patterns, property paths, `OPTIONAL`/`FILTER`, aggregation, and a few federated (DBpedia) examples.

Read it on the [published site](https://sib-swiss.github.io/sparql-training/default/tutorial.html), or as plain Markdown in [tutorial.md](./tutorial.md).

[ontology.ttl](./ontology.ttl) and [resource.ttl](./resource.ttl) are the same dataset shown in `tutorial.md`'s embedded, editable fixture, split back out into the two plain files the original [SPARQL playground](https://github.com/calipho-sib/sparql-playground) source had. They're dereferenceable at `https://purl.expasy.org/sparql-examples/training/ontology` and `.../resource` (content-negotiated: `Accept: text/turtle` gets you these files directly; anything else redirects to the tutorial page). **Known limitation:** the diagram images on the tutorial page still show the dataset's old placeholder namespace (`example.org/tuto/...`) baked into the picture as text, from before this namespace migration &mdash; regenerating them is future work.

[shapes.ttl](./shapes.ttl) is a [SHACL](https://www.w3.org/TR/shacl/) shape describing that same dataset's class hierarchy and properties, validated clean against the real data with Apache Jena's `shacl` CLI:

```sh
shacl validate --shapes default/shapes.ttl --data default/ontology.ttl --data default/resource.ttl
```
