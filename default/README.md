This directory holds the classic introductory SPARQL tutorial originally from [SPARQL playground](https://github.com/calipho-sib/sparql-playground) (SIB's earlier standalone training tool), carried over as-is into this site. It's a simple people-and-pets dataset used to teach basic triple patterns, property paths, `OPTIONAL`/`FILTER`, aggregation, and a few federated (DBpedia) examples.

Read it on the [published site](https://sib-swiss.github.io/sparql-training/default/tutorial.html), or as plain Markdown in [tutorial.md](./tutorial.md).

[shapes.ttl](./shapes.ttl) is a [SHACL](https://www.w3.org/TR/shacl/) shape describing that same dataset's class hierarchy and properties, validated clean against the real fixture with Apache Jena's `shacl` CLI:

```sh
shacl validate --shapes default/shapes.ttl --data <(sed -n '/```turtle fixture=family/,/```/p' default/tutorial.md | sed '1d;$d')
```
