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

  function parseFixtureText(turtle) {
    var runner = window.SparqlRunner;
    var store = new runner.Store();
    var parser = new runner.Parser({ baseIRI: 'https://sparql-training.example/' });
    store.addQuads(parser.parse(turtle));
    return store;
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

    resultsEl.innerHTML = '';
    resultsEl.classList.add('is-loading');
    button.disabled = true;

    try {
      var store = getFixtureStore(fixtureId);
      if (!store) {
        throw new Error('No fixture data found for id "' + fixtureId + '"');
      }
      var query = queryEl.textContent.trim();
      var engine = new window.SparqlRunner.QueryEngine();
      var isAsk = isAskQuery(query);

      if (isAsk) {
        var boolResult = await engine.queryBoolean(query, { sources: [store] });
        var p = document.createElement('p');
        p.className = 'sparql-ask-result';
        p.textContent = boolResult ? 'true' : 'false';
        resultsEl.appendChild(p);
      } else {
        var bindingsStream = await engine.queryBindings(query, { sources: [store] });
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

  function shortLabel(iri) {
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

  function buildGraphData(store) {
    var nodesMap = new Map();
    var links = [];

    function ensureNode(id) {
      if (!nodesMap.has(id)) {
        nodesMap.set(id, { id: id, label: shortLabel(id), degree: 0 });
      }
      return nodesMap.get(id);
    }

    store.forEach(
      function (quad) {
        if (quad.object.termType === 'Literal') return;
        var s = ensureNode(quad.subject.value);
        var o = ensureNode(quad.object.value);
        s.degree++;
        o.degree++;
        links.push({ source: quad.subject.value, target: quad.object.value, label: shortLabel(quad.predicate.value) });
      },
      null,
      null,
      null,
      null
    );

    return { nodes: Array.from(nodesMap.values()), links: links };
  }

  function nodeRadius(d) {
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

  function renderGraph(container, store) {
    var G = window.SparqlGraph;
    container.innerHTML = '';

    if (!G) {
      renderGraphError(container, 'Graph visualization failed to load.');
      return;
    }

    var data = buildGraphData(store);
    if (data.links.length === 0) {
      renderGraphError(
        container,
        'No relationships between resources to draw here \u2014 every property in this example has a literal value (a string, number, date...), not a link to another resource.'
      );
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
      .call(dragBehavior(G, simulation));

    node
      .append('circle')
      .attr('r', nodeRadius)
      .attr('fill', function (d, i) {
        return PALETTE[i % PALETTE.length];
      });

    node
      .append('text')
      .attr('dy', function (d) {
        return -(nodeRadius(d) + 6);
      })
      .text(function (d) {
        return d.label;
      });

    node.append('title').text(function (d) {
      return d.id;
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

  function refreshGraphIfOpen(fixture) {
    var container = fixture.querySelector('.sparql-graph');
    if (!container || container.hasAttribute('hidden')) return;
    try {
      var store = parseFixtureText(fixture.querySelector('.sparql-fixture-data').textContent);
      renderGraph(container, store);
    } catch (err) {
      renderGraphError(container, 'Could not parse this data: ' + (err && err.message ? err.message : String(err)));
    }
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
