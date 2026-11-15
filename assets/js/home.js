/* Renders the home page from site.json and projects.json. */
(function () {
  "use strict";
  var P = window.Portfolio, esc = P.esc, $ = P.$, T = P.text;

  function renderIntro(site, projects) {
    document.title = site.name ? site.name + " | " + (site.label || "Portfolio") : "Portfolio";
    $("brand-name").textContent = site.name || "Portfolio";
    $("brand-sub").textContent = site.label || "";
    $("hero-label").textContent = site.label || "";
    $("hero-name").textContent = site.name || "";
    $("hero-tag").innerHTML = T(site.tagline);
    $("hero-tag").hidden = !site.tagline;
    var bio = Array.isArray(site.bio) ? site.bio : (site.bio ? [site.bio] : []);
    $("hero-intro").innerHTML = bio.map(function (p) { return "<p>" + T(p) + "</p>"; }).join("");

    var resume = $("hero-resume");
    if (site.resume) resume.href = site.resume; else resume.hidden = true;

    if (site.photo) {
      $("profile-photo").src = site.photo; $("profile-photo").alt = site.name || "";
      $("profile-text").innerHTML = T(site.photoCaption || "");
      $("profile-card").hidden = false;
    }

    var focus = site.focus || [];
    $("focus-list").innerHTML = focus.map(function (f) { return "<li>" + T(f) + "</li>"; }).join("");
    $("focus-card").hidden = !focus.length;

    var facts = (site.facts || []).slice();
    facts.push({ label: "Projects", value: String(projects.length) });
    $("facts").innerHTML = facts.map(function (f) {
      var wide = String(f.value).length > 30;
      return '<div class="' + (wide ? "wide" : "") + '"><dt>' + esc(f.label) + "</dt><dd>" + T(f.value) + "</dd></div>";
    }).join("");

    $("contact-note").innerHTML = T(site.contactNote || "");
    $("contact-actions").innerHTML = P.contactButtons(site);

    $("footer-name").textContent = site.name || "";
    $("footer-line").innerHTML = T(site.footerLine || "");
    $("footer-copy").textContent = "© " + new Date().getFullYear() + " " + (site.name || "");
  }

  function renderProjects(projects) {
    var featured = projects.filter(function (p) { return p.featured; });
    if (!featured.length) featured = projects.slice(0, 4);
    $("featured").innerHTML = featured.map(function (p) {
      var url = "project.html?id=" + encodeURIComponent(p.id);
      return '<article class="card pcard">' +
        '<a class="thumb" href="' + url + '" tabindex="-1" aria-hidden="true">' + P.coverHTML(p) + "</a>" +
        '<div class="body"><p class="label">' + esc(p.category || "") + "</p>" +
        '<h3><a href="' + url + '">' + esc(p.title || p.id) + "</a></h3>" +
        "<p>" + esc(p.summary || "") + "</p>" +
        '<a class="btn open" href="' + url + '">Open project</a></div></article>';
    }).join("") || '<p class="muted">No projects yet. Add a folder under projects/ and list its name in projects.json.</p>';
    $("projects").hidden = !projects.length;

    $("project-count").textContent = projects.length ? projects.length + (projects.length === 1 ? " project" : " projects") : "";
    $("project-rows").innerHTML = projects.map(function (p) {
      var url = "project.html?id=" + encodeURIComponent(p.id);
      var year = (/^(\d{4})/.exec(String(p.date || "")) || [])[1] || "";
      var status = p.status && !/^complete/i.test(p.status) ? '<span class="status">' + esc(p.status) + "</span>" : "";
      return "<tr><td class=\"title\">" + esc(p.title || p.id) + status + "</td>" +
        '<td class="area">' + esc(p.category || "") + "</td>" +
        '<td class="tools">' + esc((p.tags || []).slice(0, 3).join(", ")) + "</td>" +
        '<td class="year">' + esc(year) + "</td>" +
        '<td><a href="' + url + '">Open project</a></td></tr>';
    }).join("");
    $("all-projects").hidden = !projects.length;

    if (P.projectErrors && P.projectErrors.length) {
      P.showError("These projects are listed in projects.json but could not be loaded: " +
        P.projectErrors.map(function (p) { return p.id + " (" + p.__error + ")"; }).join("; "));
    }
  }

  function renderSkills(site) {
    var groups = site.skills || [];
    $("skills").hidden = !groups.length;
    $("skills-list").innerHTML = groups.map(function (g) {
      return '<div class="card card-pad skill accent-left"><h3>' + esc(g.group) + "</h3><p>" + (g.items || []).map(T).join(", ") + "</p></div>";
    }).join("");
  }

  function renderBackground(site) {
    var exp = site.experience || [];
    $("experience-list").innerHTML = exp.map(function (e) {
      return '<div class="exp-item"><div class="exp-head"><h3>' + T(e.role) + '</h3><span class="when">' + T(e.period) + "</span></div>" +
        '<p class="org">' + T(e.org) + "</p>" +
        ((e.points || []).length ? "<ul>" + e.points.map(function (x) { return "<li>" + T(x) + "</li>"; }).join("") + "</ul>" : "") + "</div>";
    }).join("");
    $("experience").hidden = !exp.length;

    var act = site.activities || [];
    $("activities").innerHTML = act.length ? '<h3>Workshops and activities</h3><ul class="plain-list">' + act.map(function (a) { return "<li>" + T(a) + "</li>"; }).join("") + "</ul>" : "";
    $("activities").hidden = !act.length;

    var edu = site.education || [];
    $("education-list").innerHTML = edu.map(function (e) {
      return "<tr><td><strong>" + T(e.degree) + '</strong><span class="org">' + T(e.org) + "</span></td>" +
        '<td><span class="score">' + T(e.score || "") + "</span><br>" + T(e.period) + "</td></tr>";
    }).join("");
    $("education").hidden = !edu.length;

    var cw = site.coursework || [];
    $("coursework").innerHTML = cw.length ? "<h3>Coursework</h3>" + cw.map(function (c) {
      return '<p class="small-h">' + esc(c.level) + '</p><p class="muted" style="margin:0">' + (c.items || []).map(T).join(", ") + "</p>";
    }).join("") : "";
    $("coursework").hidden = !cw.length;
  }

  document.addEventListener("DOMContentLoaded", function () {
    Promise.all([P.loadSite(), P.loadProjects()]).then(function (r) {
      var site = r[0], projects = r[1];
      renderIntro(site, projects);
      renderProjects(projects);
      renderSkills(site);
      renderBackground(site);
      if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
    }).catch(function (err) { P.showError(err.message); });
  });
})();
