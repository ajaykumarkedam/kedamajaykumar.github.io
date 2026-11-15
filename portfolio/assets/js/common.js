/* Shared helpers for the home page and the project page.
   You should not need to edit this file to add projects — edit projects.json instead. */
(function () {
  "use strict";

  var P = (window.Portfolio = {});

  P.esc = function (s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };

  P.$ = function (id) { return document.getElementById(id); };

  P.isAbsolute = function (u) { return /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(u || ""); };

  /** Resolve a path written inside a project folder (e.g. "images/cover.png") to a site path. */
  P.projectPath = function (id, path) {
    if (!path) return "";
    if (P.isAbsolute(path) || path.charAt(0) === "/") return path;
    return "projects/" + encodeURIComponent(id) + "/" + path.replace(/^\.\//, "");
  };

  P.fetchJSON = function (url) {
    return fetch(url, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(url + " → HTTP " + r.status);
      return r.text();
    }).then(function (txt) {
      try { return JSON.parse(txt); }
      catch (e) { throw new Error(url + " is not valid JSON (" + e.message + ")"); }
    });
  };

  P.fetchText = function (url) {
    return fetch(url, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(url + " → HTTP " + r.status);
      return r.text();
    });
  };

  P.showError = function (msg) {
    var box = P.$("load-error");
    if (!box) return;
    var hint = location.protocol === "file:"
      ? "<p>You opened this page straight from disk. Browsers block loading JSON files that way. " +
        "Run <code>python3 -m http.server</code> in the portfolio folder and open " +
        "<code>http://localhost:8000</code>, or view the site on GitHub Pages.</p>"
      : "";
    box.innerHTML = "<div><strong>Something didn’t load.</strong><p>" + P.esc(msg) + "</p>" + hint + "</div>";
    box.hidden = false;
  };

  /* ---------- Theme toggle ---------- */
  P.initTheme = function () {
    var btn = P.$("theme-toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var root = document.documentElement;
      var current = root.dataset.theme ||
        (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      var next = current === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  };

  /* ---------- Site config ---------- */
  P.loadSite = function () {
    return P.fetchJSON("site.json").then(function (site) {
      P.site = site;
      var brand = P.$("brand");
      if (brand && site.name) brand.textContent = site.name;
      var resume = P.$("nav-resume");
      if (resume) {
        if (site.resume) resume.href = site.resume;
        else resume.hidden = true;
      }
      var foot = P.$("footer-text");
      if (foot) foot.textContent = "© " + new Date().getFullYear() + " " + (site.name || "") +
        (site.footer ? " · " + site.footer : "");
      return site;
    });
  };

  /* ---------- Projects ---------- */
  /** Loads projects.json (list of folder names) and each projects/<id>/project.json, in list order. */
  P.loadProjects = function () {
    return P.fetchJSON("projects.json").then(function (ids) {
      if (!Array.isArray(ids)) throw new Error("projects.json must be a list of folder names, e.g. [\"my-project\"]");
      ids = ids.filter(function (x) { return typeof x === "string" && x.trim(); }).map(function (x) { return x.trim(); });
      return Promise.all(ids.map(function (id) {
        return P.fetchJSON(P.projectPath(id, "project.json")).then(function (p) {
          p.id = id; // the folder name is the source of truth
          return p;
        }).catch(function (err) { return { id: id, __error: err.message }; });
      }));
    }).then(function (list) {
      P.projectErrors = list.filter(function (p) { return p.__error; });
      P.projects = list.filter(function (p) { return !p.__error && !p.hidden; });
      return P.projects;
    });
  };

  P.formatDate = function (d) {
    if (!d) return "";
    var m = /^(\d{4})(?:-(\d{1,2}))?/.exec(String(d));
    if (!m) return String(d);
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return m[2] ? months[parseInt(m[2], 10) - 1] + " " + m[1] : m[1];
  };

  /** Contact buttons used in the hero and the contact section. */
  P.contactButtons = function (site, withResume) {
    var c = site.contact || {};
    var out = [];
    if (withResume && site.resume) out.push('<a class="btn" href="' + P.esc(site.resume) + '" target="_blank" rel="noopener">Download résumé</a>');
    if (c.email) out.push('<a class="btn btn-ghost" href="mailto:' + P.esc(c.email) + '">' + P.esc(c.email) + "</a>");
    if (c.linkedin) out.push('<a class="btn btn-ghost" href="' + P.esc(c.linkedin) + '" target="_blank" rel="noopener">LinkedIn</a>');
    if (c.github) out.push('<a class="btn btn-ghost" href="' + P.esc(c.github) + '" target="_blank" rel="noopener">GitHub</a>');
    if (c.scholar) out.push('<a class="btn btn-ghost" href="' + P.esc(c.scholar) + '" target="_blank" rel="noopener">Google Scholar</a>');
    return out.join("");
  };

  document.addEventListener("DOMContentLoaded", P.initTheme);
})();
