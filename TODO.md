[x] Migrate the example ontology from example.org to a https://purl.expasy.org/sparql-examples/training/ namespace.
   Prepare the change in `the purl project (~/git/purl)` the images and the example files and queries in this project
[x] Link tutorial examples to sparql-examples on that project
[x] Enable code highlighthing for the turle and SPARQL examples
[x] For each section on a UniProt entry page. Start in a different branch a mini tutorial using queries that are already written in ~/git/sparql-examples/examples/UniProt
[x] Investigate a UniProt mini tutorial arround chemistry. Ligands, Co-Factors, PTMs and Catalytic Activity. Include federated queries to IDSM/Sachem
[x] Generate a SHACL shape for the basic tutorial data. 
[x] Search for a SHACL shape client side diagram renderer and propose on a different branch each visualization
[x] Make an export to Jupyther notebooks. As that was usefull functionality
[x] Add a basic RDF and linked data tutorial
   * Build on the "I Love X" example in the downloaded presentation given to Elixir at ECCB 4_Tuesday_1145_Bolleman.pdf
[x] Make a contributing.md that explains the structure of the markdown and the special tags. Where you need to add a file to build.mjs etc.
[x] See if we can reduce the need to explicitly add files to build.mjs
[x] Update BioSoda bgee example to use www.bgee.org/sparql
[x] Notes about comunica not working for a certain example should be styled explicitly as a comunica limitation using color and a comunica logo.
[x] The D3.js visualization does not show literal and prefixes. We should fix that.
[x] There should be a basic drop down with RDF & Linked Data and SPARQL for questions
[x] Add a watch command to npm run that builds and serves the site and watches for changes in the repository
[x] Add a new introduction page introducing the different file formats for RDF (RDF/XML, Json-LD, TTL, NTriples)
   * But make clear that each of these formats contain the same triples and have the same information in them.
[x] Show more the linked open data use-cases.
   * Use the wikidata and orcid linked data capability to add their triples to the graph and visualize them.
   * If possible color the nodes from the page, wikidata and orcid differently
[x] Make a page about schema.org and (bio)schema.org
[x] Create a tip and tricks page for creating your own RDF resource in the life sciences
[x] Make one more page with tools and ecosytems.
   * Use wikidata to create this life and show the SPARQL query required to do so.
   * Note that if a tool is missing that they can add it to wikidata themselves
[x] Make a new Rhea tutorial about how citations in Rhea and cross-references to other databases.
  * then make a single dropdown for Rhea metabolism and Rhea citations+xrefs
[x] Orcid website do not have CORS headers. We can't seem to access them in JS, is there a way we can circumvent this?
   * Not actually missing on the final response - orcid.org's content-negotiation redirect chain (orcid.org -> pub.orcid.org -> pub.orcid.org/experimental_rdf_v1/...) has no Access-Control-Allow-Origin on the intermediate redirects, only the final response, which is what a browser fetch() checks at every hop. Fixed by fetching the already-resolved pub.orcid.org/experimental_rdf_v1/<id> URL directly, skipping the redirects.
