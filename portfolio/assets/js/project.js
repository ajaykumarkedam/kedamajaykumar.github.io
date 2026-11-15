/* Renders project.html?id=<folder-name> from projects/<folder-name>/project.json and its write-up. */
(function () {
  "use strict";
  var P = window.Portfolio, esc = P.esc, $ = P.$;

  function renderMath() {
    var el = $("p-writeup");
    function go() {
      if (window.renderMathInElement) {
        window.renderMathInElement(el, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false }
          ],
          throwOnError: false
        });
      }
    }
    if (window.renderMathInElement) go(); else window.__katexReady = go;
  }

  function lightbox(root) {
    root.addEventListener("click", function (e) {
      var img = e.target.closest("img");
      if (!img || img.closest("a")) return;
      var box = document.createElement("div");
      box.className = "lightbox";
      box.innerHTML = '<img src="' + esc(img.src) + '" alt="' + esc(img.alt) + '">';
      box.addEventListener("click", function () { box.remove(); });
      document.addEventListener("keydown", function k(ev) { if (ev.key === "Escape") { box.remove(); document.removeEventListener("keydown", k); } });
      document.body.appendChild(box);
    });
  }

  function render(p, projects) {
    var id = p.id;
    document.title = (p.title || id) + (P.site && P.site.name ? " · " + P.site.name : "");

    $("p-category").textContent = p.category || "";
    $("p-title").textContent = p.title || id;
    $("p-summary").textContent = p.summary || "";

    var meta = [
      ["Date", P.formatDate(p.date)], ["Context", p.context], ["Role", p.role],
      ["Duration", p.duration], ["Team", p.team], ["Status", p.status]
    ].filter(function (x) { return x[1]; });
    $("p-meta").innerHTML = meta.map(function (x) { return "<div><dt>" + x[0] + "</dt><dd>" + esc(x[1]) + "</dd></div>"; }).join("");

    $("p-tags").innerHTML = (p.tags || []).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");

    $("p-links").innerHTML = (p.links || []).map(function (l, i) {
      return '<a class="btn ' + (i ? "btn-ghost" : "") + '" href="' + esc(P.projectPath(id, l.url)) + '" target="_blank" rel="noopener">' + esc(l.label) + "</a>";
    }).join("");

    if (p.cover) {
      var fig = $("p-cover");
      fig.querySelector("img").src = P.projectPath(id, p.cover);
      fig.querySelector("img").alt = p.coverAlt || p.title || "";
      fig.hidden = false;
    }

    if (p.highlights && p.highlights.length) {
      $("p-stats").innerHTML = p.highlights.map(function (h) {
        return '<div class="stat"><div class="value">' + esc(h.value) + '</div><div class="label">' + esc(h.label) + "</div></div>";
      }).join("");
      $("p-results").hidden = false;
    }

    if (p.demo && p.demo.file) {
      var src = P.projectPath(id, p.demo.file);
      $("p-demo-title").textContent = p.demo.title || "Interactive demo";
      $("p-demo-note").textContent = p.demo.description || "";
      $("p-demo-open").href = src;
      var fr = $("p-demo-frame");
      fr.src = src;
      fr.title = p.demo.title || "Interactive demo";
      if (p.demo.height) fr.style.height = parseInt(p.demo.height, 10) + "px";
      $("p-demo").hidden = false;
    }

    if (p.gallery && p.gallery.length) {
      $("p-gallery").innerHTML = p.gallery.map(function (g) {
        return '<figure><img src="' + esc(P.projectPath(id, g.src)) + '" alt="' + esc(g.caption || "") + '" loading="lazy">' +
          (g.caption ? "<figcaption>" + esc(g.caption) + "</figcaption>" : "") + "</figure>";
      }).join("");
      $("p-gallery-wrap").hidden = false;
      lightbox($("p-gallery"));
    }

    // Previous / next in projects.json order.
    var idx = projects.findIndex(function (x) { return x.id === id; });
    var prev = idx > 0 ? projects[idx - 1] : null, next = idx >= 0 && idx < projects.length - 1 ? projects[idx + 1] : null;
    $("p-pager").innerHTML =
      (prev ? '<a class="prev" href="project.html?id=' + encodeURIComponent(prev.id) + '"><span class="dir">← Previous</span>' + esc(prev.title || prev.id) + "</a>" : "") +
      (next ? '<a class="next" href="project.html?id=' + encodeURIComponent(next.id) + '"><span class="dir">Next →</span>' + esc(next.title || next.id) + "</a>" : "");

    var writeup = p.writeup === undefined ? "writeup.md" : p.writeup;
    if (writeup) {
      return P.fetchText(P.projectPath(id, writeup)).then(function (md) {
        $("p-writeup").innerHTML = window.Markdown.render(md, function (u) { return P.projectPath(id, u); });
        lightbox($("p-writeup"));
        renderMath();
        if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
      }).catch(function (err) { P.showError("Write-up could not be loaded: " + err.message); });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var id = new URLSearchParams(location.search).get("id");
    if (!id) { $("p-title").textContent = "No project selected"; P.showError("Open a project from the home page (the URL needs ?id=<folder-name>)."); return; }

    Promise.all([
      P.loadSite().catch(function () { return {}; }),
      P.loadProjects().catch(function () { return []; }),
      P.fetchJSON(P.projectPath(id, "project.json"))
    ]).then(function (r) {
      var p = r[2]; p.id = id;
      return render(p, r[1]);
    }).catch(function (err) {
      $("p-title").textContent = "Project not found";
      P.showError(err.message);
    });
  });
})();
