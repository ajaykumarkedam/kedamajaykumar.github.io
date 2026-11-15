/* Renders the home page from site.json and projects.json. */
(function () {
  "use strict";
  var P = window.Portfolio, esc = P.esc, $ = P.$;

  function renderHero(site) {
    document.title = site.name ? site.name + " · Portfolio" : "Portfolio";
    $("hero-name").textContent = site.name || "";
    $("hero-headline").textContent = site.headline || "";
    $("hero-location").textContent = site.location || "";
    var photo = $("hero-photo");
    if (site.photo) { photo.src = site.photo; photo.alt = site.name || ""; } else photo.hidden = true;
    var bio = Array.isArray(site.bio) ? site.bio : (site.bio ? [site.bio] : []);
    $("hero-bio").innerHTML = bio.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
    $("hero-actions").innerHTML = P.contactButtons(site, true);
    $("contact-actions").innerHTML = P.contactButtons(site, false);
  }

  function renderSkills(site) {
    var groups = site.skills || [];
    $("skills").hidden = !groups.length;
    $("skills-list").innerHTML = groups.map(function (g) {
      return '<div class="skill-group"><h3>' + esc(g.group) + '</h3><ul class="tags">' +
        (g.items || []).map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul></div>";
    }).join("");
  }

  function timeline(items) {
    return (items || []).map(function (e) {
      return '<li><span class="period">' + esc(e.period) + "</span><h3>" + esc(e.role || e.degree) + "</h3>" +
        '<p class="org">' + esc(e.org) + "</p>" +
        ((e.points && e.points.length) ? "<ul>" + e.points.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : "") +
        "</li>";
    }).join("");
  }

  function renderTimeline(site) {
    $("experience-list").innerHTML = timeline(site.experience);
    $("education-list").innerHTML = timeline(site.education);
    if (!(site.experience || []).length && !(site.education || []).length) $("experience").hidden = true;
  }

  function card(p) {
    var cover = p.cover
      ? '<img src="' + esc(P.projectPath(p.id, p.cover)) + '" alt="" loading="lazy">'
      : "";
    var h = (p.highlights || [])[0];
    var stat = h ? '<div class="card-stat"><strong>' + esc(h.value) + "</strong>" + esc(h.label) + "</div>" : "";
    var tags = (p.tags || []).slice(0, 5).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");
    return '<a class="card" href="project.html?id=' + encodeURIComponent(p.id) + '" data-category="' + esc(p.category) + '">' +
      '<div class="card-cover">' + cover + "</div>" +
      '<div class="card-body">' +
        '<div class="card-top"><span>' + esc(p.category || "") + "</span><span>" +
          (p.featured ? '<span class="badge">Featured</span> ' : "") + esc(P.formatDate(p.date)) + "</span></div>" +
        "<h3>" + esc(p.title || p.id) + "</h3>" +
        "<p>" + esc(p.summary || "") + "</p>" +
        (tags ? '<ul class="tags">' + tags + "</ul>" : "") +
        stat +
      "</div></a>";
  }

  function renderProjects(site, projects) {
    var grid = $("project-grid"), filters = $("filters"), empty = $("project-empty");
    // Categories: the order in site.json first, then any extra ones used by projects.
    var cats = (site.categories || []).slice();
    projects.forEach(function (p) { if (p.category && cats.indexOf(p.category) < 0) cats.push(p.category); });
    var counts = {};
    projects.forEach(function (p) { counts[p.category] = (counts[p.category] || 0) + 1; });
    var used = cats.filter(function (c) { return counts[c]; });

    var params = new URLSearchParams(location.search);
    var active = params.get("cat");
    if (active && used.indexOf(active) < 0) active = null;

    function chip(label, value, n) {
      return '<button type="button" class="chip" data-cat="' + esc(value) + '" aria-pressed="' + ((active || "") === value) + '">' +
        esc(label) + '<span class="count">' + n + "</span></button>";
    }
    filters.innerHTML = used.length > 1
      ? chip("All", "", projects.length) + used.map(function (c) { return chip(c, c, counts[c]); }).join("")
      : "";

    function draw() {
      var shown = projects.filter(function (p) { return !active || p.category === active; });
      grid.innerHTML = shown.map(card).join("");
      empty.hidden = shown.length > 0 || projects.length === 0;
      if (!projects.length) grid.innerHTML = '<p class="empty">No projects yet — add a folder under <code>projects/</code> and list it in <code>projects.json</code>.</p>';
      Array.prototype.forEach.call(filters.querySelectorAll(".chip"), function (b) {
        b.setAttribute("aria-pressed", String((active || "") === b.dataset.cat));
      });
    }

    filters.addEventListener("click", function (e) {
      var b = e.target.closest(".chip");
      if (!b) return;
      active = b.dataset.cat || null;
      var url = new URL(location.href);
      if (active) url.searchParams.set("cat", active); else url.searchParams.delete("cat");
      history.replaceState(null, "", url);
      draw();
    });
    draw();

    if (P.projectErrors && P.projectErrors.length) {
      P.showError("These projects are listed in projects.json but could not be loaded: " +
        P.projectErrors.map(function (p) { return p.id + " (" + p.__error + ")"; }).join("; "));
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    Promise.all([P.loadSite(), P.loadProjects()]).then(function (r) {
      var site = r[0], projects = r[1];
      renderHero(site);
      renderSkills(site);
      renderTimeline(site);
      renderProjects(site, projects);
    }).catch(function (err) {
      $("hero-name").textContent = "";
      P.showError(err.message);
    });
  });
})();
