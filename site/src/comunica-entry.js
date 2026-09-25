// The full query-sparql engine (not the -rdfjs-lite variant) is needed here:
// it's the only one that supports the SPARQL `SERVICE` keyword, which several
// examples on this site use for real federated queries against live public
// endpoints (sparql.uniprot.org, sparql.rhea-db.org, idsm.elixir-czech.cz,
// dbpedia.org -- all CORS-enabled). rdfjs-lite explicitly excludes SERVICE
// support in exchange for a smaller bundle; that tradeoff isn't worth it here.
import { QueryEngine } from '@comunica/query-sparql';
import { Parser, Store } from 'n3';

window.SparqlRunner = { QueryEngine, Parser, Store };
