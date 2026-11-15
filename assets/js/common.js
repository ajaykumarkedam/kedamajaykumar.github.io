/* Shared helpers for the home page and the project page.
   You should not need to edit this file to add projects; edit projects.json instead. */
(function () {
  "use strict";

  var P = (window.Portfolio = window.Portfolio || {});

  P.esc = function (s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };
  P.$ = function (id) { return document.getElementById(id); };

  /** Text still in [square brackets] is an unfilled placeholder: show it in a warning colour. */
  P.isPlaceholder = function (s) { return /\[[^\]]+\]/.test(String(s || "")); };
  P.text = function (s) {
    var e = P.esc(s);
    return P.isPlaceholder(s) ? '<span class="placeholder">' + e + "</span>" : e;
  };

  P.isAbsolute = function (u) { return /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(u || ""); };

  /** Resolve a path written inside a project folder (e.g. "images/cover.png") to a site path. */
  P.projectPath = function (id, path) {
    if (!path) return "";
    if (P.isAbsolute(path) || path.charAt(0) === "/") return path;
    return "projects/" + encodeURIComponent(id) + "/" + path.replace(/^\.\//, "");
  };

  P.fetchJSON = function (url) {
    return fetch(url, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(url + " could not be found (HTTP " + r.status + ")");
      return r.text();
    }).then(function (txt) {
      try { return JSON.parse(txt); }
      catch (e) { throw new Error(url + " is not valid JSON: " + e.message); }
    });
  };
  P.fetchText = function (url) {
    return fetch(url, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(url + " could not be found (HTTP " + r.status + ")");
      return r.text();
    });
  };

  P.showError = function (msg) {
    var box = P.$("load-error");
    if (!box) return;
    var hint = location.protocol === "file:"
      ? "<p>This page was opened straight from disk, and browsers block loading data files that way. " +
        "View it on GitHub Pages, or run <code>python3 -m http.server</code> in the portfolio folder and open <code>http://localhost:8000</code>.</p>"
      : "";
    box.innerHTML = "<div><strong>Part of this page did not load.</strong><p>" + P.esc(msg) + "</p>" + hint + "</div>";
    box.hidden = false;
  };

  /* ---------- Site config ---------- */
  P.loadSite = function () {
    return P.fetchJSON("site.json").then(function (site) {
      P.site = site;
      if (P.$("brand-name")) P.$("brand-name").textContent = site.name || "Portfolio";
      if (P.$("brand-sub")) P.$("brand-sub").textContent = site.label || "";
      var resume = P.$("nav-resume");
      if (resume) { if (site.resume) resume.href = site.resume; else resume.hidden = true; }
      if (P.$("footer-name")) P.$("footer-name").textContent = site.name || "";
      if (P.$("footer-copy")) P.$("footer-copy").textContent = "© " + new Date().getFullYear() + " " + (site.name || "");
      return site;
    });
  };

  /* ---------- Projects ---------- */
  /** Loads projects.json (folder names) and each projects/<name>/project.json, keeping list order. */
  P.loadProjects = function () {
    return P.fetchJSON("projects.json").then(function (ids) {
      if (!Array.isArray(ids)) throw new Error('projects.json must be a list of folder names, e.g. ["my-project"]');
      ids = ids.filter(function (x) { return typeof x === "string" && x.trim(); }).map(function (x) { return x.trim(); });
      return Promise.all(ids.map(function (id) {
        return P.fetchJSON(P.projectPath(id, "project.json")).then(function (p) { p.id = id; return p; })
          .catch(function (err) { return { id: id, __error: err.message }; });
      }));
    }).then(function (list) {
      P.projectErrors = list.filter(function (p) { return p.__error; });
      P.projects = list.filter(function (p) { return !p.__error && !p.hidden; });
      return P.projects;
    });
  };

  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  P.formatDate = function (d) {
    if (!d) return "";
    var m = /^(\d{4})(?:-(\d{1,2}))?/.exec(String(d));
    if (!m) return String(d);
    return m[2] ? MONTHS[parseInt(m[2], 10) - 1] + " " + m[1] : m[1];
  };
  /** "period" (free text, e.g. "Oct 2025 – Nov 2025") wins over "date". */
  P.when = function (p) { return p.period || P.formatDate(p.date); };

  /** Cover image if there is one, otherwise a line drawing for the project's area. */
  P.coverHTML = function (p) {
    if (p.cover) return '<img src="' + P.esc(P.projectPath(p.id, p.cover)) + '" alt="' + P.esc(p.coverAlt || "") + '" loading="lazy">';
    return P.art ? P.art(p.drawing || p.category, p.id) : "";
  };


  P.contactButtons = function (site) {
    var c = site.contact || {}, out = [];
    function btn(cls, href, label, ext) {
      return '<a class="' + cls + '" href="' + P.esc(href) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">" + P.text(label) + "</a>";
    }
    if (c.email) out.push(btn("btn btn-primary", "mailto:" + c.email, c.email));
    if (c.linkedin) out.push(btn("btn", c.linkedin, P.isPlaceholder(c.linkedin) ? "LinkedIn [add link]" : "LinkedIn", true));
    if (c.github) out.push(btn("btn", c.github, P.isPlaceholder(c.github) ? "GitHub [add link]" : "GitHub", true));
    if (c.scholar) out.push(btn("btn", c.scholar, "Google Scholar", true));
    if (site.resume) out.push(btn("btn", site.resume, "Résumé (PDF)", true));
    return out.join("");
  };
})();
