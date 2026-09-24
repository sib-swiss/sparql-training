(function () {
  'use strict';

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

  function buildStore(turtle, Parser, Store) {
    var store = new Store();
    var parser = new Parser({ baseIRI: 'https://sparql-training.example/' });
    store.addQuads(parser.parse(turtle));
    return store;
  }

  async function runExample(example, stores) {
    var runner = window.SparqlRunner;
    var resultsEl = example.querySelector('.sparql-results');
    var queryEl = example.querySelector('.sparql-query');
    var button = example.querySelector('.sparql-run');
    var fixtureId = example.getAttribute('data-fixture-id');
    var store = stores[fixtureId];

    resultsEl.innerHTML = '';
    resultsEl.classList.add('is-loading');
    button.disabled = true;

    try {
      if (!store) {
        throw new Error('No fixture data found for id "' + fixtureId + '"');
      }
      var query = queryEl.textContent.trim();
      var engine = new runner.QueryEngine();
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

  function init() {
    if (!window.SparqlRunner) {
      console.error('SparqlRunner engine bundle failed to load; run buttons are disabled.');
      return;
    }
    var Parser = window.SparqlRunner.Parser;
    var Store = window.SparqlRunner.Store;
    var stores = {};

    document.querySelectorAll('.sparql-fixture').forEach(function (fixture) {
      var id = fixture.getAttribute('data-fixture-id');
      var turtle = fixture.querySelector('pre').textContent;
      try {
        stores[id] = buildStore(turtle, Parser, Store);
      } catch (err) {
        console.error('Failed to parse fixture "' + id + '":', err);
      }
    });

    document.querySelectorAll('.sparql-example').forEach(function (example) {
      var button = example.querySelector('.sparql-run');
      if (!button) return;
      button.addEventListener('click', function () {
        runExample(example, stores);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
