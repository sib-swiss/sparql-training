# sparql-training

This repository contains training material for querying SIB (Swiss Institute of Bioinformatics) resources with SPARQL.

**Read it here: <https://sib-swiss.github.io/sparql-training/>**

Every worked example on the site runs directly in your browser, powered by the [Comunica](https://comunica.dev/) SPARQL engine &mdash; no server, no installation, no account.

- [SPARQL basics](basic/) &mdash; the classic introductory tutorial (people & pets)
- [UniProt: SPARQL and RDF tutorials](UniProt/)
- [Rhea: metabolism tutorial](Rhea/)

## Developing this site

The site is plain Markdown, built into static HTML by a small Node.js script and published with GitHub Actions.

```sh
npm install
npm run verify   # runs every example query through Comunica and checks it returns results
npm run build    # builds the site into _site/
npm run serve    # serves _site/ locally
npm run watch    # builds, serves, and rebuilds automatically whenever a source file changes
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the Markdown/fence-block conventions and where to register a new page.
