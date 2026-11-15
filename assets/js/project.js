/* Renders project.html?id=<folder-name> from projects/<folder-name>/project.json and its write-up. */
(function () {
  "use strict";
  var P = window.Portfolio, esc = P.esc, $ = P.$;

  function renderMath(el) {
    function go() {
      if (window.renderMathInElement) {
        window.renderMathInElement(el, {
          delimiters: [{ left: "$$", right: "$$", display: true }, { left: "$", right: "$", display: false }],
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
      box.setAttribute("role", "dialog");
      box.innerHTML = '<img src="' + esc(img.src) + '" alt="' + esc(img.alt) + '">';
      function close() { box.remove(); document.removeEventListener("keydown", key); }
      function key(ev) { if (ev.key === "Escape") close(); }
      box.addEventListener("click", close);
      document.addEventListener("keydown", key);
      document.body.appendChild(box);
    });
  }

  function buildToc(article) {
    var hs = article.querySelectorAll("h2[id]"), toc = $("p-toc");
    if (hs.length < 3) { toc.hidden = true; toc.parentNode.classList.add("no-toc"); return; }
    toc.innerHTML = "<p>On this page</p><ol>" + Array.prototype.map.call(hs, function (h) {
      return '<li><a href="#' + h.id + '">' + esc(h.textContent) + "</a></li>";
    }).join("") + "</ol>";
  }

  function render(p, projects) {
    var id = p.id;
    document.title = (p.title || id) + (P.site && P.site.name ? " | " + P.site.name : "");

    $("p-category").textContent = p.category || "";
    $("p-title").textContent = p.title || id;
    $("p-summary").textContent = p.summary || "";

    var info = [["When", P.when(p)], ["Context", p.context], ["Role", p.role], ["Duration", p.duration], ["Team", p.team], ["Status", p.status]]
      .filter(function (x) { return x[1]; });
    $("p-info").innerHTML = info.map(function (x) { return "<div><dt>" + x[0] + "</dt><dd>" + P.text(x[1]) + "</dd></div>"; }).join("");
    $("p-tags").innerHTML = (p.tags || []).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");
    $("p-tags").hidden = !(p.tags || []).length;
    $("p-links").innerHTML = (p.links || []).map(function (l, i) {
      return '<a class="btn' + (i ? "" : " btn-primary") + '" href="' + esc(P.projectPath(id, l.url)) + '" target="_blank" rel="noopener">' + P.text(l.label) + "</a>";
    }).join("");
    $("p-links").hidden = !(p.links || []).length;

    if (p.cover) {
      var fig = $("p-cover"), img = fig.querySelector("img");
      img.src = P.projectPath(id, p.cover); img.alt = p.coverAlt || p.title || "";
      fig.hidden = false;
    }

    if ((p.highlights || []).length) {
      $("p-results").innerHTML = p.highlights.map(function (h) {
        return '<div class="card result"><strong>' + esc(h.value) + "</strong><span>" + esc(h.label) + "</span></div>";
      }).join("");
      $("p-results").hidden = false;
    }

    if (p.demo && p.demo.file) {
      var src = P.projectPath(id, p.demo.file), fr = $("p-demo-frame");
      $("p-demo-title").textContent = p.demo.title || "Interactive model";
      $("p-demo-note").textContent = p.demo.description || "";
      $("p-demo-open").href = src;
      fr.src = src; fr.title = p.demo.title || "Interactive model";
      if (p.demo.height) fr.style.height = parseInt(p.demo.height, 10) + "px";
      $("p-demo").hidden = false;
    }

    if ((p.gallery || []).length) {
      $("p-gallery").innerHTML = p.gallery.map(function (g) {
        return '<figure><img src="' + esc(P.projectPath(id, g.src)) + '" alt="' + esc(g.caption || "") + '" loading="lazy">' +
          (g.caption ? "<figcaption>" + esc(g.caption) + "</figcaption>" : "") + "</figure>";
      }).join("");
      $("p-gallery-wrap").hidden = false;
      lightbox($("p-gallery"));
    }

    var idx = projects.findIndex(function (x) { return x.id === id; });
    var prev = idx > 0 ? projects[idx - 1] : null, next = idx >= 0 && idx < projects.length - 1 ? projects[idx + 1] : null;
    $("p-pager").innerHTML =
      (prev ? '<a class="card prev" href="project.html?id=' + encodeURIComponent(prev.id) + '"><span class="dir">Previous project</span>' + esc(prev.title || prev.id) + "</a>" : "") +
      (next ? '<a class="card next" href="project.html?id=' + encodeURIComponent(next.id) + '"><span class="dir">Next project</span>' + esc(next.title || next.id) + "</a>" : "");

    var writeup = p.writeup === undefined ? "writeup.md" : p.writeup, art = $("p-writeup");
    if (!writeup) { $("p-toc").hidden = true; $("p-toc").parentNode.classList.add("no-toc"); art.closest(".p-body").hidden = true; return; }
    return P.fetchText(P.projectPath(id, writeup)).then(function (md) {
      art.innerHTML = window.Markdown.render(md, function (u) { return P.projectPath(id, u); });
      lightbox(art);
      buildToc(art);
      renderMath(art);
      if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
    }).catch(function (err) { P.showError("The write-up could not be loaded: " + err.message); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var id = new URLSearchParams(location.search).get("id");
    if (!id) { $("p-title").textContent = "No project selected"; P.showError("Open a project from the home page. The address needs ?id=<folder-name> at the end."); return; }
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
