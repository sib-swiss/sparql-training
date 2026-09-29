(function () {
  'use strict';

  var originalText = new WeakMap();
  var PALETTE = ['#4493f8', '#3fb950', '#d29922', '#db61a2', '#a371f7', '#f85149', '#39c5cf'];

  function reHighlight(pre) {
    if (!window.Prism) return;
    var code = pre.querySelector('code');
    if (!code) return;
    // Flatten any markup left over from a previous highlight (or from editing
    // around it) back to plain text before re-tokenizing.
    code.textContent = code.textContent;
    window.Prism.highlightElement(code);
  }

  function collectVariables(bindings) {
    var seen = {};
    var vars = [];
    bindings.forEach(function (binding) {
      Array.from(binding.keys()).forEach(function (v) {
        if (!seen[v.value]) {
          seen[v.value] = true;
          vars.push(v.value);
        }
      });
    });
    return vars;
  }

  function renderTable(bindings) {
    if (bindings.length === 0) {
      var empty = document.createElement('p');
      empty.className = 'sparql-empty';
      empty.textContent = 'No results.';
      return empty;
    }
    var vars = collectVariables(bindings);
    var table = document.createElement('table');
    var thead = document.createElement('thead');
    var headRow = document.createElement('tr');
    vars.forEach(function (v) {
      var th = document.createElement('th');
      th.textContent = '?' + v;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    var tbody = document.createElement('tbody');
    bindings.forEach(function (binding) {
      var row = document.createElement('tr');
      vars.forEach(function (v) {
        var td = document.createElement('td');
        var term = binding.get(v);
        td.textContent = term ? term.value : '';
        row.appendChild(td);
      });
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    return table;
  }

  function isAskQuery(query) {
    var withoutComments = query.replace(/#[^\n]*/g, '');
    var withoutPrologue = withoutComments.replace(/^\s*(PREFIX|BASE)\b[^\n]*$/gim, '');
    return /^\s*ASK\b/i.test(withoutPrologue);
  }

  function renderError(err) {
    var pre = document.createElement('pre');
    pre.className = 'sparql-error';
    pre.textContent = 'Query failed: ' + (err && err.message ? err.message : String(err));
    return pre;
  }

  // Finds distinct `SERVICE <uri>` targets in a query so they can be
  // pre-registered as `{ type: 'sparql', value: uri }` sources. Comunica's
  // federation support otherwise tries to auto-discover the endpoint type by
  // fetching the bare URI first; several real endpoints (e.g. IDSM/Sachem)
  // respond to that discovery probe with an error instead of a normal 404,
  // which aborts the whole query before it ever sends the real one.
  // Pre-registering the type skips that broken discovery step.
  function extractServiceUris(query) {
    var uris = [];
    var seen = {};
    var re = /SERVICE\s+(?:SILENT\s+)?<([^>]+)>/gi;
    var m;
    while ((m = re.exec(query))) {
      if (!seen[m[1]]) {
        seen[m[1]] = true;
        uris.push(m[1]);
      }
    }
    return uris;
  }

  // `lenient: true` keeps the query going even if the extra pre-registered
  // SERVICE sources end up also being probed for the *rest* of the query
  // (Comunica unions all `sources` by default) and that probe fails -- the
  // SERVICE clause's own explicit results still come back either way.
  function buildQueryContext(query, store) {
    var sources = [store];
    extractServiceUris(query).forEach(function (uri) {
      sources.push({ type: 'sparql', value: uri });
    });
    return { sources: sources, lenient: true };
  }

  // For `sparql live="<endpoint>"` blocks: no local fixture at all, the query
  // runs directly against a real public endpoint (needed for examples like
  // FROM/GRAPH clauses over named graphs that only exist on that endpoint,
  // or whole-database questions a small fixture can't meaningfully answer).
  function buildLiveQueryContext(query, endpoint) {
    var sources = [{ type: 'sparql', value: endpoint }];
    extractServiceUris(query).forEach(function (uri) {
      if (uri !== endpoint) sources.push({ type: 'sparql', value: uri });
    });
    return { sources: sources, lenient: true };
  }

  // `baseIRI` defaults to a fixed placeholder for this site's own fixtures
  // (which never contain relative IRIs); the live-fetch feature below passes
  // the real fetch URL instead, since that's what a relative IRI in fetched
  // Turtle would actually be resolved against.
  function parseFixtureText(turtle, baseIRI) {
    var runner = window.SparqlRunner;
    var store = new runner.Store();
    var parser = new runner.Parser({ baseIRI: baseIRI || 'https://sparql-training.example/' });
    store.addQuads(parser.parse(turtle));
    return store;
  }

  // Re-parses the same turtle just for its `prefix`/`@prefix` declarations, so
  // the graph view can render terms as `prefix:local` instead of always
  // stripping down to a bare local name. N3's Parser.parse() still runs (and
  // returns) synchronously when only the prefix callback is given, so this is
  // a second, cheap pass over the same (small) fixture text, not a real cost.
  function extractPrefixes(turtle, baseIRI) {
    var prefixes = {};
    try {
      var runner = window.SparqlRunner;
      var parser = new runner.Parser({ baseIRI: baseIRI || 'https://sparql-training.example/' });
      parser.parse(turtle, undefined, function (prefix, iri) {
        prefixes[prefix] = iri.value;
      });
    } catch (e) {
      // ignore; parseFixtureText() surfaces parse errors to the user already
    }
    return prefixes;
  }

  function getFixtureStore(fixtureId) {
    var fixture = document.querySelector('.sparql-fixture[data-fixture-id="' + cssEscape(fixtureId) + '"]');
    if (!fixture) return null;
    var pre = fixture.querySelector('.sparql-fixture-data');
    return parseFixtureText(pre.textContent);
  }

  function cssEscape(value) {
    return window.CSS && CSS.escape ? CSS.escape(value) : value.replace(/["\\]/g, '\\$&');
  }

  async function runExample(example) {
    var resultsEl = example.querySelector('.sparql-results');
    var queryEl = example.querySelector('.sparql-query');
    var button = example.querySelector('.sparql-run');
    var fixtureId = example.getAttribute('data-fixture-id');
    var liveEndpoint = example.getAttribute('data-live-endpoint');

    resultsEl.innerHTML = '';
    resultsEl.classList.add('is-loading');
    button.disabled = true;

    try {
      var query = queryEl.textContent.trim();
      var engine = new window.SparqlRunner.QueryEngine();
      var isAsk = isAskQuery(query);
      var context;
      if (liveEndpoint) {
        context = buildLiveQueryContext(query, liveEndpoint);
      } else {
        var store = getFixtureStore(fixtureId);
        if (!store) {
          throw new Error('No fixture data found for id "' + fixtureId + '"');
        }
        context = buildQueryContext(query, store);
      }

      if (isAsk) {
        var boolResult = await engine.queryBoolean(query, context);
        var p = document.createElement('p');
        p.className = 'sparql-ask-result';
        p.textContent = boolResult ? 'true' : 'false';
        resultsEl.appendChild(p);
      } else {
        var bindingsStream = await engine.queryBindings(query, context);
        var bindings = await bindingsStream.toArray();
        resultsEl.appendChild(renderTable(bindings));
      }
    } catch (err) {
      resultsEl.appendChild(renderError(err));
    } finally {
      resultsEl.classList.remove('is-loading');
      button.disabled = false;
    }
  }

  // --- graph visualization -------------------------------------------------

  // Shortens an IRI for display. With a `prefixes` map (as extracted by
  // extractPrefixes()), tries a `prefix:local` form first -- matching the
  // longest declared namespace so e.g. both `up:` and a more specific
  // sub-namespace resolve to the more precise one -- and only falls back to
  // a bare local name (the old behavior) when nothing declared matches.
  function shortLabel(iri, prefixes) {
    if (prefixes) {
      var bestPrefix = null;
      var bestNs = '';
      Object.keys(prefixes).forEach(function (p) {
        var ns = prefixes[p];
        if (ns && ns.length > bestNs.length && iri.indexOf(ns) === 0 && iri.length > ns.length) {
          bestPrefix = p;
          bestNs = ns;
        }
      });
      if (bestPrefix !== null) {
        return bestPrefix + ':' + iri.slice(bestNs.length);
      }
    }
    var value = iri.replace(/[#/]+$/, '');
    var idx = Math.max(value.lastIndexOf('#'), value.lastIndexOf('/'));
    var local = idx >= 0 ? value.slice(idx + 1) : value;
    try {
      local = decodeURIComponent(local);
    } catch (e) {
      // keep raw local part if it isn't validly percent-encoded
    }
    return local || iri;
  }

  // Renders a literal term as a short, quoted label, e.g. `"male"` or
  // `"1942-02-02"^^xsd:date` or `"Home"@en` -- so a graph reader can tell it's
  // a plain value (not another linked resource) and still see its datatype
  // or language tag.
  function literalLabel(term, prefixes) {
    var text = term.value;
    if (text.length > 28) text = text.slice(0, 25) + '…';
    var suffix = '';
    if (term.language) {
      suffix = '@' + term.language;
    } else if (term.datatype && term.datatype.value && term.datatype.value !== 'http://www.w3.org/2001/XMLSchema#string') {
      suffix = '^^' + shortLabel(term.datatype.value, prefixes);
    }
    return '"' + text + '"' + suffix;
  }

  function buildGraphData(store, prefixes) {
    var nodesMap = new Map();
    var links = [];
    var literalCount = 0;

    function ensureNode(id, kind, label, tooltip) {
      if (!nodesMap.has(id)) {
        nodesMap.set(id, { id: id, label: label, tooltip: tooltip, degree: 0, kind: kind });
      }
      return nodesMap.get(id);
    }

    store.forEach(
      function (quad) {
        var s = ensureNode(quad.subject.value, 'resource', shortLabel(quad.subject.value, prefixes), quad.subject.value);
        var o;
        if (quad.object.termType === 'Literal') {
          // Each literal gets its own node (never shared across triples,
          // even with an identical value) -- two people both having the
          // literal "male" doesn't mean they're the same node.
          var label = literalLabel(quad.object, prefixes);
          o = ensureNode('literal:' + literalCount++ + ':' + quad.subject.value, 'literal', label, label);
        } else {
          o = ensureNode(quad.object.value, 'resource', shortLabel(quad.object.value, prefixes), quad.object.value);
        }
        s.degree++;
        o.degree++;
        links.push({ source: s.id, target: o.id, label: shortLabel(quad.predicate.value, prefixes) });
      },
      null,
      null,
      null,
      null
    );

    return { nodes: Array.from(nodesMap.values()), links: links };
  }

  // Same shape as buildGraphData(), but for the live-fetch feature: merges
  // several quad lists (the local fixture, plus whatever got fetched from
  // Wikidata/ORCID) into one graph, tagging every node with a `source` --
  // `'local'`, `'wikidata'`, `'orcid'` -- taken from whichever group first
  // introduces that node. Each group keeps its own `prefixes` map, since the
  // fetched turtle declares its own `@prefix` names, unrelated to this page's.
  function buildMergedGraphData(groups) {
    var nodesMap = new Map();
    var links = [];

    function ensureNode(id, kind, label, tooltip, source) {
      if (!nodesMap.has(id)) {
        nodesMap.set(id, { id: id, label: label, tooltip: tooltip, degree: 0, kind: kind, source: source });
      }
      return nodesMap.get(id);
    }

    groups.forEach(function (group) {
      var literalCount = 0;
      group.quads.forEach(function (quad) {
        var s = ensureNode(quad.subject.value, 'resource', shortLabel(quad.subject.value, group.prefixes), quad.subject.value, group.source);
        var o;
        if (quad.object.termType === 'Literal') {
          var label = literalLabel(quad.object, group.prefixes);
          var literalId = 'literal:' + group.source + ':' + literalCount++ + ':' + quad.subject.value;
          o = ensureNode(literalId, 'literal', label, label, group.source);
        } else {
          o = ensureNode(quad.object.value, 'resource', shortLabel(quad.object.value, group.prefixes), quad.object.value, group.source);
        }
        s.degree++;
        o.degree++;
        links.push({ source: s.id, target: o.id, label: shortLabel(quad.predicate.value, group.prefixes) });
      });
    });

    return { nodes: Array.from(nodesMap.values()), links: links };
  }

  function nodeRadius(d) {
    if (d.kind === 'literal') return 7;
    return 9 + Math.min(14, Math.sqrt(d.degree) * 4);
  }

  function dragBehavior(G, simulation) {
    function started(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    function ended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    return G.drag().on('start', started).on('drag', dragged).on('end', ended);
  }

  function renderGraphError(container, message) {
    container.innerHTML = '';
    var p = document.createElement('p');
    p.className = 'sparql-graph-empty';
    p.textContent = message;
    container.appendChild(p);
  }

  // The ordinary path: one fixture's own store, all nodes implicitly `local`.
  function renderGraph(container, store, prefixes) {
    renderGraphData(container, buildGraphData(store, prefixes));
  }

  // The shared drawing code, taking already-built `{ nodes, links }` data --
  // used both by renderGraph() above and by the live-fetch feature below,
  // which builds its data with buildMergedGraphData() instead.
  function renderGraphData(container, data) {
    var G = window.SparqlGraph;
    container.innerHTML = '';

    if (!G) {
      renderGraphError(container, 'Graph visualization failed to load.');
      return;
    }

    if (data.links.length === 0) {
      renderGraphError(container, 'No triples in this example to draw yet.');
      return;
    }

    var width = container.clientWidth || 600;
    var height = 380;

    var svg = G.select(container)
      .append('svg')
      .attr('viewBox', [0, 0, width, height])
      .attr('width', '100%')
      .attr('height', height)
      .attr('class', 'sparql-graph-svg');

    svg
      .append('defs')
      .append('marker')
      .attr('id', 'sparql-graph-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('class', 'sparql-graph-arrowhead');

    var zoomLayer = svg.append('g');

    svg.call(
      G.zoom()
        .scaleExtent([0.3, 4])
        .on('zoom', function (event) {
          zoomLayer.attr('transform', event.transform);
        })
    );

    var simulation = G.forceSimulation(data.nodes)
      .force(
        'link',
        G.forceLink(data.links)
          .id(function (d) {
            return d.id;
          })
          .distance(95)
      )
      .force('charge', G.forceManyBody().strength(-220))
      .force('center', G.forceCenter(width / 2, height / 2))
      .force(
        'collide',
        G.forceCollide().radius(function (d) {
          return nodeRadius(d) + 14;
        })
      );

    var link = zoomLayer
      .append('g')
      .attr('class', 'sparql-graph-links')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('marker-end', 'url(#sparql-graph-arrow)');

    var linkLabel = zoomLayer
      .append('g')
      .attr('class', 'sparql-graph-link-labels')
      .selectAll('text')
      .data(data.links)
      .join('text')
      .text(function (d) {
        return d.label;
      });

    var node = zoomLayer
      .append('g')
      .attr('class', 'sparql-graph-nodes')
      .selectAll('g')
      .data(data.nodes)
      .join('g')
      .attr('class', function (d) {
        // Ordinary fixtures never set `source`, so every graph elsewhere on
        // this site keeps exactly its current class list. Only the
        // live-fetch feature (buildMergedGraphData()) tags nodes with a
        // fetched `source`, which adds a second class style.css uses to
        // color that node by where it came from.
        var cls = 'sparql-graph-node-' + d.kind;
        if (d.source && d.source !== 'local') cls += ' sparql-graph-node-source-' + d.source;
        return cls;
      })
      .call(dragBehavior(G, simulation));

    node.each(function (d, i) {
      var g = G.select(this);
      if (d.kind === 'literal') {
        var w = Math.max(34, d.label.length * 6.2 + 12);
        var h = 22;
        g.append('rect').attr('x', -w / 2).attr('y', -h / 2).attr('width', w).attr('height', h).attr('rx', 5);
        g.append('text').attr('dy', 4).text(d.label);
      } else {
        var r = nodeRadius(d);
        var circle = g.append('circle').attr('r', r);
        // A `local` (or untagged) node keeps the existing round-robin
        // palette; a node tagged with a fetched source gets its fill from
        // that source's CSS class instead (see .sparql-graph-node-source-*
        // in style.css), so the fill logic doesn't fight the CSS class.
        if (!d.source || d.source === 'local') {
          circle.attr('fill', PALETTE[i % PALETTE.length]);
        }
        g.append('text')
          .attr('dy', -(r + 6))
          .text(d.label);
      }
    });

    node.append('title').text(function (d) {
      return d.tooltip || d.id;
    });

    simulation.on('tick', function () {
      link
        .attr('x1', function (d) {
          return d.source.x;
        })
        .attr('y1', function (d) {
          return d.source.y;
        })
        .attr('x2', function (d) {
          return d.target.x;
        })
        .attr('y2', function (d) {
          return d.target.y;
        });

      linkLabel
        .attr('x', function (d) {
          return (d.source.x + d.target.x) / 2;
        })
        .attr('y', function (d) {
          return (d.source.y + d.target.y) / 2;
        });

      node.attr('transform', function (d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      });
    });
  }

  // --- live linked-data fetch (Wikidata + ORCID) ----------------------------
  //
  // A one-off feature for the "I love ELIXIR" example on the RDF & linked
  // data intro page: fetches the real Turtle Wikidata and ORCID publish for
  // the two identifiers used in that triple, filters each down to a legible
  // slice, and merges it into the same graph the fixture's own "Visualize as
  // graph" button draws -- tagging every node with where it came from
  // (`local`, `wikidata`, `orcid`) so style.css can color it accordingly.

  // Wikidata's own page for a single item can carry well over a thousand
  // statements about it (external-database identifiers, sitelinks in dozens
  // of languages, and more) -- merging in everything would draw an
  // unreadable tangle. This keeps only the handful of predicates that
  // actually explain what the item is; everything else Wikidata knows about
  // it is still there for a reader who follows the identifier themselves.
  var WIKIDATA_KEEP_PREDICATES = [
    'http://www.w3.org/2000/01/rdf-schema#label',
    'http://schema.org/description',
    'http://www.w3.org/2004/02/skos/core#altLabel',
    'http://www.wikidata.org/prop/direct/P31', // instance of
    'http://www.wikidata.org/prop/direct/P279', // subclass of
    'http://www.w3.org/2002/07/owl#sameAs',
  ];
  var WIKIDATA_FETCH_LIMIT = 20;

  // ORCID's own record isn't nearly as sprawling, so a plain cap (rather
  // than a predicate allow-list) already keeps it legible.
  var ORCID_FETCH_LIMIT = 25;

  // Keeps only quads whose subject IS the fetched identifier itself (not
  // every triple the response happens to mention), optionally restricted to
  // an allow-listed set of predicates, and drops literals tagged with a
  // language other than English (both Wikidata and ORCID can carry labels in
  // dozens of languages) -- then caps the result so the merged graph stays
  // readable.
  function filterFetchedQuads(quads, subjectIri, predicateAllowlist, limit) {
    var allow = predicateAllowlist ? new Set(predicateAllowlist) : null;
    var kept = [];
    for (var i = 0; i < quads.length && kept.length < limit; i++) {
      var q = quads[i];
      if (q.subject.value !== subjectIri) continue;
      if (allow && !allow.has(q.predicate.value)) continue;
      if (q.object.termType === 'Literal' && q.object.language && q.object.language !== 'en') continue;
      kept.push(q);
    }
    return kept;
  }

  // Fetches Turtle for one identifier and returns its filtered quads plus its
  // own `@prefix` map (a fetched document declares its own prefixes,
  // unrelated to this page's). Left to reject on a network/HTTP/parse
  // failure -- the caller (runLiveFetch) decides how to show that honestly.
  async function fetchLinkedDataGroup(url, subjectIri, predicateAllowlist, limit) {
    var res = await fetch(url, { headers: { Accept: 'text/turtle' } });
    if (!res.ok) {
      throw new Error('HTTP ' + res.status + ' from ' + url);
    }
    var text = await res.text();
    var runner = window.SparqlRunner;
    var quads = new runner.Parser({ baseIRI: url }).parse(text);
    var prefixes = extractPrefixes(text, url);
    return { quads: filterFetchedQuads(quads, subjectIri, predicateAllowlist, limit), prefixes: prefixes };
  }

  function setLiveFetchStatus(statusEl, text, isError) {
    statusEl.textContent = text;
    statusEl.classList.toggle('is-error', !!isError);
  }

  async function runLiveFetch(block, button, statusEl) {
    var fixtureId = block.getAttribute('data-fixture-id');
    var fixture = document.querySelector('.sparql-fixture[data-fixture-id="' + cssEscape(fixtureId) + '"]');
    var graphContainer = fixture && fixture.querySelector('.sparql-graph');
    var graphToggle = fixture && fixture.querySelector('.sparql-graph-toggle');
    var dataEl = fixture && fixture.querySelector('.sparql-fixture-data');
    if (!fixture || !graphContainer || !dataEl) {
      setLiveFetchStatus(statusEl, 'Could not find the example graph to merge this into.', true);
      return;
    }

    button.disabled = true;
    setLiveFetchStatus(statusEl, 'Fetching live data from wikidata.org and orcid.org...', false);

    var localTurtle = dataEl.textContent;
    var groups = [
      {
        quads: parseFixtureText(localTurtle).getQuads(null, null, null, null),
        prefixes: extractPrefixes(localTurtle),
        source: 'local',
      },
    ];

    var sources = [
      {
        label: 'Wikidata',
        id: 'wikidata',
        url: block.getAttribute('data-wikidata-url'),
        subject: block.getAttribute('data-wikidata-subject'),
        predicates: WIKIDATA_KEEP_PREDICATES,
        limit: WIKIDATA_FETCH_LIMIT,
      },
      {
        // `data-orcid-url` is pub.orcid.org's already-resolved RDF endpoint,
        // not the pretty https://orcid.org/<id> identifier -- see the HTML
        // comment above that attribute in intro/tutorial.md for why: the
        // pretty URL's own redirect chain isn't CORS-enabled at every hop,
        // only its final destination is.
        label: 'ORCID',
        id: 'orcid',
        url: block.getAttribute('data-orcid-url'),
        subject: block.getAttribute('data-orcid-subject'),
        predicates: null,
        limit: ORCID_FETCH_LIMIT,
      },
    ];

    var results = await Promise.allSettled(
      sources.map(function (source) {
        return fetchLinkedDataGroup(source.url, source.subject, source.predicates, source.limit);
      })
    );

    var counts = [];
    var problems = [];
    results.forEach(function (result, i) {
      var source = sources[i];
      if (result.status === 'fulfilled') {
        groups.push({ quads: result.value.quads, prefixes: result.value.prefixes, source: source.id });
        counts.push(result.value.quads.length + ' triples from ' + source.label);
      } else {
        var message = result.reason && result.reason.message ? result.reason.message : String(result.reason);
        problems.push(source.label + ' (' + message + ')');
      }
    });

    if (graphContainer.hasAttribute('hidden')) {
      graphContainer.removeAttribute('hidden');
      if (graphToggle) graphToggle.innerHTML = '&#9679; Hide graph';
    }

    try {
      renderGraphData(graphContainer, buildMergedGraphData(groups));
    } catch (err) {
      renderGraphError(graphContainer, 'Could not draw the merged graph: ' + (err && err.message ? err.message : String(err)));
    }

    button.disabled = false;
    button.textContent = 'Re-fetch live data from Wikidata & ORCID';

    if (problems.length === 0) {
      setLiveFetchStatus(statusEl, 'Loaded ' + counts.join(' and ') + ', merged into the graph above.', false);
    } else if (counts.length === 0) {
      setLiveFetchStatus(statusEl, 'Both fetches failed: ' + problems.join('; ') + '. Nothing was added.', true);
    } else {
      setLiveFetchStatus(
        statusEl,
        'Loaded ' + counts.join(' and ') + '. This failed, so it is not shown: ' + problems.join('; ') + '.',
        true
      );
    }
  }

  function initLiveFetchBlocks() {
    document.querySelectorAll('.sparql-live-fetch').forEach(function (block) {
      var button = block.querySelector('.sparql-live-fetch-btn');
      var statusEl = block.querySelector('.sparql-live-fetch-status');
      if (!button || !statusEl) return;
      button.addEventListener('click', function () {
        runLiveFetch(block, button, statusEl).catch(function (err) {
          button.disabled = false;
          setLiveFetchStatus(statusEl, 'Fetch failed: ' + (err && err.message ? err.message : String(err)), true);
        });
      });
    });
  }

  function refreshGraphIfOpen(fixture) {
    var container = fixture.querySelector('.sparql-graph');
    if (!container || container.hasAttribute('hidden')) return;
    try {
      var turtle = fixture.querySelector('.sparql-fixture-data').textContent;
      var store = parseFixtureText(turtle);
      var prefixes = extractPrefixes(turtle);
      renderGraph(container, store, prefixes);
    } catch (err) {
      renderGraphError(container, 'Could not parse this data: ' + (err && err.message ? err.message : String(err)));
    }
  }

  // --- SHACL shape diagram ---------------------------------------------------
  //
  // Reuses the same n3 (parsing) + d3-force (layout) infrastructure as the
  // triple graph above, but with a SHACL-aware model instead of a plain
  // triple graph: nodes are shapes / target classes / datatypes, and edges
  // are sh:node ("extends") and sh:property (with the path + cardinality as
  // the edge label) -- the shape-graph equivalent of a UML class diagram.

  var SH_NS = 'http://www.w3.org/ns/shacl#';
  var RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';

  function cardinalityLabel(attrs) {
    if (attrs.minCount === undefined && attrs.maxCount === undefined) return '';
    var lo = attrs.minCount !== undefined ? attrs.minCount : '0';
    var hi = attrs.maxCount !== undefined ? attrs.maxCount : '*';
    return ' [' + lo + '..' + hi + ']';
  }

  function constraintSuffix(attrs) {
    var bits = [];
    if (attrs.hasIn) bits.push('enum');
    if (attrs.minInclusive !== undefined) bits.push('≥' + attrs.minInclusive);
    if (attrs.pattern !== undefined) bits.push('pattern');
    return bits.length ? ' (' + bits.join(', ') + ')' : '';
  }

  // Walks the store once, sorting every quad into the handful of SHACL
  // predicates this diagram understands. Property shapes are usually blank
  // nodes, so they're tracked by whatever term id n3 assigned them.
  function buildShaclGraphData(store) {
    var shapeIds = new Set();
    var targetClassOf = new Map();
    var nodeRefsOf = new Map(); // shapeId -> [baseShapeId, ...]  (sh:node)
    var propertyRefsOf = new Map(); // shapeId -> [propShapeId, ...]  (sh:property)
    var propAttrs = new Map(); // propShapeId -> {path, datatype, class, minCount, maxCount, hasIn, minInclusive, pattern}

    function ensurePropAttrs(id) {
      if (!propAttrs.has(id)) propAttrs.set(id, {});
      return propAttrs.get(id);
    }

    store.forEach(
      function (quad) {
        var s = quad.subject.value;
        var p = quad.predicate.value;
        var o = quad.object;

        if (p === RDF_TYPE && o.value === SH_NS + 'NodeShape') {
          shapeIds.add(s);
        } else if (p === SH_NS + 'targetClass') {
          targetClassOf.set(s, o.value);
        } else if (p === SH_NS + 'node') {
          if (!nodeRefsOf.has(s)) nodeRefsOf.set(s, []);
          nodeRefsOf.get(s).push(o.value);
        } else if (p === SH_NS + 'property') {
          if (!propertyRefsOf.has(s)) propertyRefsOf.set(s, []);
          propertyRefsOf.get(s).push(o.value);
        } else if (p === SH_NS + 'path') {
          ensurePropAttrs(s).path = o.value;
        } else if (p === SH_NS + 'datatype') {
          ensurePropAttrs(s).datatype = o.value;
        } else if (p === SH_NS + 'class') {
          ensurePropAttrs(s).class = o.value;
        } else if (p === SH_NS + 'minCount') {
          ensurePropAttrs(s).minCount = o.value;
        } else if (p === SH_NS + 'maxCount') {
          ensurePropAttrs(s).maxCount = o.value;
        } else if (p === SH_NS + 'minInclusive') {
          ensurePropAttrs(s).minInclusive = o.value;
        } else if (p === SH_NS + 'pattern') {
          ensurePropAttrs(s).pattern = o.value;
        } else if (p === SH_NS + 'in') {
          ensurePropAttrs(s).hasIn = true;
        }
      },
      null,
      null,
      null,
      null
    );

    var nodesMap = new Map();
    var links = [];

    function ensureNode(id, kind, label) {
      if (!nodesMap.has(id)) nodesMap.set(id, { id: id, kind: kind, label: label });
      return nodesMap.get(id);
    }

    shapeIds.forEach(function (shapeId) {
      var label = shortLabel(shapeId);
      var targetClass = targetClassOf.get(shapeId);
      if (targetClass) label += '\n→ ' + shortLabel(targetClass);
      ensureNode(shapeId, 'shape', label);
    });

    nodeRefsOf.forEach(function (bases, shapeId) {
      ensureNode(shapeId, 'shape', shortLabel(shapeId));
      bases.forEach(function (baseId) {
        ensureNode(baseId, 'shape', shortLabel(baseId));
        links.push({ source: shapeId, target: baseId, label: 'sh:node', kind: 'extends' });
      });
    });

    propertyRefsOf.forEach(function (propIds, shapeId) {
      ensureNode(shapeId, 'shape', shortLabel(shapeId));
      propIds.forEach(function (propId) {
        var attrs = propAttrs.get(propId);
        if (!attrs || !attrs.path) return;
        var pathLabel = shortLabel(attrs.path) + cardinalityLabel(attrs) + constraintSuffix(attrs);
        if (attrs.class) {
          ensureNode(attrs.class, 'class', shortLabel(attrs.class));
          links.push({ source: shapeId, target: attrs.class, label: pathLabel, kind: 'property' });
        } else if (attrs.datatype) {
          var dtId = 'datatype:' + attrs.datatype;
          ensureNode(dtId, 'datatype', shortLabel(attrs.datatype));
          links.push({ source: shapeId, target: dtId, label: pathLabel, kind: 'property' });
        }
      });
    });

    return { nodes: Array.from(nodesMap.values()), links: links };
  }

  function shaclLabelLines(label) {
    return label.split('\n');
  }

  // Shape nodes are drawn as a rounded rect sized to fit their (possibly
  // two-line) label, UML-class-box style; class/datatype nodes stay simple
  // circles like the triple graph's nodes.
  function shaclNodeMetrics(d) {
    var lines = shaclLabelLines(d.label);
    var maxLen = lines.reduce(function (m, l) {
      return Math.max(m, l.length);
    }, 0);
    return { w: Math.max(76, maxLen * 6.6 + 24), h: 22 + lines.length * 16 };
  }

  function shaclNodeRadius(d) {
    return d.kind === 'class' ? 20 : 15;
  }

  function shaclCollideRadius(d) {
    if (d.kind === 'shape') {
      var m = shaclNodeMetrics(d);
      return Math.max(m.w, m.h) / 2 + 16;
    }
    return shaclNodeRadius(d) + 18;
  }

  function renderShaclGraph(container, store) {
    var G = window.SparqlGraph;
    container.innerHTML = '';

    if (!G) {
      renderGraphError(container, 'Graph visualization failed to load.');
      return;
    }

    var data = buildShaclGraphData(store);
    if (data.nodes.length === 0) {
      renderGraphError(container, 'No sh:NodeShape / sh:property constraints found to draw here.');
      return;
    }

    var width = container.clientWidth || 640;
    var height = 460;

    var svg = G.select(container)
      .append('svg')
      .attr('viewBox', [0, 0, width, height])
      .attr('width', '100%')
      .attr('height', height)
      .attr('class', 'sparql-graph-svg sparql-shacl-graph-svg');

    svg
      .append('defs')
      .append('marker')
      .attr('id', 'sparql-shacl-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('class', 'sparql-graph-arrowhead');

    var zoomLayer = svg.append('g');

    svg.call(
      G.zoom()
        .scaleExtent([0.3, 4])
        .on('zoom', function (event) {
          zoomLayer.attr('transform', event.transform);
        })
    );

    var simulation = G.forceSimulation(data.nodes)
      .force(
        'link',
        G.forceLink(data.links)
          .id(function (d) {
            return d.id;
          })
          .distance(130)
      )
      .force('charge', G.forceManyBody().strength(-420))
      .force('center', G.forceCenter(width / 2, height / 2))
      .force('collide', G.forceCollide().radius(shaclCollideRadius));

    var link = zoomLayer
      .append('g')
      .attr('class', 'sparql-graph-links')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('class', function (d) {
        return d.kind === 'extends' ? 'sparql-shacl-edge-extends' : 'sparql-shacl-edge-property';
      })
      .attr('marker-end', 'url(#sparql-shacl-arrow)');

    var linkLabel = zoomLayer
      .append('g')
      .attr('class', 'sparql-graph-link-labels')
      .selectAll('text')
      .data(data.links)
      .join('text')
      .text(function (d) {
        return d.label;
      });

    var node = zoomLayer
      .append('g')
      .attr('class', 'sparql-graph-nodes sparql-shacl-graph-nodes')
      .selectAll('g')
      .data(data.nodes)
      .join('g')
      .attr('class', function (d) {
        return 'sparql-shacl-node sparql-shacl-node-' + d.kind;
      })
      .call(dragBehavior(G, simulation));

    node.each(function (d) {
      var g = G.select(this);
      if (d.kind === 'shape') {
        var m = shaclNodeMetrics(d);
        g.append('rect')
          .attr('x', -m.w / 2)
          .attr('y', -m.h / 2)
          .attr('width', m.w)
          .attr('height', m.h)
          .attr('rx', 8);
        var lines = shaclLabelLines(d.label);
        var text = g.append('text').attr('text-anchor', 'middle');
        lines.forEach(function (line, i) {
          text
            .append('tspan')
            .attr('x', 0)
            .attr('dy', i === 0 ? -((lines.length - 1) * 7) : 14)
            .text(line);
        });
      } else {
        g.append('circle').attr('r', shaclNodeRadius(d));
        g.append('text')
          .attr('dy', -(shaclNodeRadius(d) + 6))
          .attr('text-anchor', 'middle')
          .text(d.label);
      }
      g.append('title').text(d.id);
    });

    simulation.on('tick', function () {
      link
        .attr('x1', function (d) {
          return d.source.x;
        })
        .attr('y1', function (d) {
          return d.source.y;
        })
        .attr('x2', function (d) {
          return d.target.x;
        })
        .attr('y2', function (d) {
          return d.target.y;
        });

      linkLabel
        .attr('x', function (d) {
          return (d.source.x + d.target.x) / 2;
        })
        .attr('y', function (d) {
          return (d.source.y + d.target.y) / 2;
        });

      node.attr('transform', function (d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      });
    });
  }

  function refreshShaclGraphIfOpen(fixture) {
    var container = fixture.querySelector('.sparql-shacl-graph');
    if (!container || container.hasAttribute('hidden')) return;
    try {
      var store = parseFixtureText(fixture.querySelector('.sparql-fixture-data').textContent);
      renderShaclGraph(container, store);
    } catch (err) {
      renderGraphError(container, 'Could not parse this data: ' + (err && err.message ? err.message : String(err)));
    }
  }

  function initShaclFixtures() {
    document.querySelectorAll('.sparql-shacl-fixture').forEach(function (fixture) {
      var toggle = fixture.querySelector('.sparql-shacl-graph-toggle');
      var container = fixture.querySelector('.sparql-shacl-graph');
      if (!toggle || !container) return;

      toggle.addEventListener('click', function (event) {
        event.preventDefault();
        var isHidden = container.hasAttribute('hidden');
        if (isHidden) {
          fixture.setAttribute('open', '');
          container.removeAttribute('hidden');
          toggle.innerHTML = '&#9679; Hide shape diagram';
          refreshShaclGraphIfOpen(fixture);
        } else {
          container.setAttribute('hidden', '');
          container.innerHTML = '';
          toggle.innerHTML = '&#9679; Visualize shape diagram';
        }
      });
    });
  }

  // --- wiring ---------------------------------------------------------------

  function initFixtures() {
    document.querySelectorAll('.sparql-fixture').forEach(function (fixture) {
      var dataEl = fixture.querySelector('.sparql-fixture-data');
      if (dataEl) originalText.set(dataEl, dataEl.textContent);

      var graphToggle = fixture.querySelector('.sparql-graph-toggle');
      var graphContainer = fixture.querySelector('.sparql-graph');
      if (graphToggle && graphContainer) {
        graphToggle.addEventListener('click', function (event) {
          event.preventDefault();
          var isHidden = graphContainer.hasAttribute('hidden');
          if (isHidden) {
            graphContainer.removeAttribute('hidden');
            graphToggle.innerHTML = '&#9679; Hide graph';
            refreshGraphIfOpen(fixture);
          } else {
            graphContainer.setAttribute('hidden', '');
            graphContainer.innerHTML = '';
            graphToggle.innerHTML = '&#9679; Visualize as graph';
          }
        });
      }

      var resetButton = fixture.querySelector('.sparql-reset[data-reset-target="fixture"]');
      if (resetButton && dataEl) {
        resetButton.addEventListener('click', function (event) {
          event.preventDefault();
          dataEl.textContent = originalText.get(dataEl);
          reHighlight(dataEl);
          refreshGraphIfOpen(fixture);
        });
      }
    });
  }

  function initExamples() {
    document.querySelectorAll('.sparql-example').forEach(function (example) {
      var queryEl = example.querySelector('.sparql-query');
      if (queryEl) originalText.set(queryEl, queryEl.textContent);

      var button = example.querySelector('.sparql-run');
      if (button) {
        button.addEventListener('click', function () {
          runExample(example);
        });
      }

      var resetButton = example.querySelector('.sparql-reset[data-reset-target="query"]');
      if (resetButton && queryEl) {
        resetButton.addEventListener('click', function (event) {
          event.preventDefault();
          queryEl.textContent = originalText.get(queryEl);
          reHighlight(queryEl);
        });
      }
    });
  }

  function initNavDropdowns() {
    var dropdowns = Array.from(document.querySelectorAll('.nav-dropdown'));
    if (dropdowns.length === 0) return;

    dropdowns.forEach(function (dropdown) {
      dropdown.addEventListener('toggle', function () {
        if (!dropdown.open) return;
        dropdowns.forEach(function (other) {
          if (other !== dropdown) other.removeAttribute('open');
        });
      });
    });

    document.addEventListener('click', function (event) {
      dropdowns.forEach(function (dropdown) {
        if (dropdown.open && !dropdown.contains(event.target)) {
          dropdown.removeAttribute('open');
        }
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      dropdowns.forEach(function (dropdown) {
        dropdown.removeAttribute('open');
      });
    });
  }

  function initSyntaxHighlighting() {
    if (!window.Prism) {
      console.error('Prism syntax highlighter failed to load; examples will show as plain text.');
      return;
    }
    window.Prism.highlightAll();

    document.querySelectorAll('.sparql-fixture-data, .sparql-query').forEach(function (pre) {
      // Re-highlight once the user is done editing, rather than on every
      // keystroke, so the cursor never jumps mid-edit.
      pre.addEventListener('blur', function () {
        reHighlight(pre);
      });
    });
  }

  function init() {
    initNavDropdowns();
    initSyntaxHighlighting();

    if (!window.SparqlRunner) {
      console.error('SparqlRunner engine bundle failed to load; run buttons are disabled.');
      return;
    }
    initFixtures();
    initExamples();
    initShaclFixtures();
    initLiveFetchBlocks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
