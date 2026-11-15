/* A small, dependency-free Markdown renderer for project write-ups.
   Supports: # headings, paragraphs, **bold**, *italic*, `code`, ``` fenced code ```, links,
   images (a lone image line becomes a captioned figure), > quotes, - / 1. lists (nested by indent),
   | tables |, --- rules, and $inline$ / $$display$$ math (rendered by KaTeX on the page).
   Raw HTML is shown as text on purpose, so a write-up can never break the page. */
(function () {
  "use strict";

  var NUL = "\u0000";

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function slug(s) {
    return s.toLowerCase().replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, "").replace(/[^\w\s-]/g, "")
      .trim().replace(/\s+/g, "-").slice(0, 60);
  }

  function safeUrl(u) { return /^\s*(javascript|vbscript|data:text\/html)/i.test(u) ? "#" : u; }

  function render(src, resolveUrl) {
    resolveUrl = resolveUrl || function (u) { return u; };
    var blocks = [];
    function stash(html) { blocks.push(html); return NUL + "B" + (blocks.length - 1) + NUL; }

    src = String(src || "").replace(/\r\n?/g, "\n").replace(/\t/g, "    ");

    // Fenced code blocks.
    src = src.replace(/^(\s*)(```|~~~)\s*([\w+-]*)[^\n]*\n([\s\S]*?)\n\s*\2\s*$/gm, function (_, ind, f, lang, code) {
      return ind + stash('<pre><code' + (lang ? ' class="language-' + esc(lang) + '"' : "") + ">" + esc(code) + "</code></pre>");
    });
    // Display math $$ … $$ (may span lines).
    src = src.replace(/^[ \t]*\$\$([\s\S]+?)\$\$[ \t]*$/gm, function (_, tex) {
      return stash('<div class="math-display">$$' + esc(tex.trim()) + "$$</div>");
    });

    var lines = src.split("\n");
    return renderBlocks(lines);

    /* ---------- inline ---------- */
    function inline(text) {
      var keep = [];
      function k(html) { keep.push(html); return NUL + "I" + (keep.length - 1) + NUL; }
      var s = text;
      // Protect code spans and inline math before escaping/formatting.
      s = s.replace(/`([^`]+)`/g, function (_, c) { return k("<code>" + esc(c) + "</code>"); });
      s = s.replace(/\$(?=\S)([^$\n]*?\S)\$(?!\d)/g, function (_, m) { return k("$" + esc(m) + "$"); });
      s = esc(s);
      // Images, then links.
      s = s.replace(/!\[([^\]]*)\]\(\s*([^)\s]+)(?:\s+&quot;(.*?)&quot;)?\s*\)/g, function (_, alt, url, title) {
        return k('<img src="' + esc(safeUrl(resolveUrl(unesc(url)))) + '" alt="' + alt + '"' + (title ? ' title="' + title + '"' : "") + ' loading="lazy">');
      });
      s = s.replace(/\[([^\]]+)\]\(\s*([^)\s]+)(?:\s+&quot;(.*?)&quot;)?\s*\)/g, function (_, label, url, title) {
        var u = unesc(url), ext = /^https?:/i.test(u);
        return '<a href="' + esc(safeUrl(u.charAt(0) === "#" ? u : resolveUrl(u))) + '"' + (title ? ' title="' + title + '"' : "") +
          (ext ? ' target="_blank" rel="noopener"' : "") + ">" + label + "</a>";
      });
      s = s.replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, function (_, pre, u) {
        return pre + '<a href="' + u + '" target="_blank" rel="noopener">' + u + "</a>";
      });
      s = s.replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, "<strong>$1</strong>");
      s = s.replace(/__(?=\S)([\s\S]*?\S)__/g, "<strong>$1</strong>");
      s = s.replace(/(^|[^*\w])\*(?=\S)([^*]*?\S)\*(?!\*)/g, "$1<em>$2</em>");
      s = s.replace(/(^|[^\w])_(?=\S)([^_]*?\S)_(?!\w)/g, "$1<em>$2</em>");
      s = s.replace(/~~(?=\S)(.*?\S)~~/g, "<del>$1</del>");
      s = s.replace(/(?: {2,}|\\)\n/g, "<br>\n");
      s = s.replace(new RegExp(NUL + "I(\\d+)" + NUL, "g"), function (_, i) { return keep[+i]; });
      return s;
    }

    function unesc(s) { return s.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"); }

    /* ---------- blocks ---------- */
    function renderBlocks(lines) {
      var out = [], para = [], i = 0;
      function flush() {
        if (para.length) { out.push("<p>" + inline(para.join("\n")) + "</p>"); para = []; }
      }
      var reBlock = new RegExp("^\\s*" + NUL + "B(\\d+)" + NUL + "\\s*$");
      var reList = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
      var reSep = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/;

      while (i < lines.length) {
        var line = lines[i], m;

        if (!line.trim()) { flush(); i++; continue; }

        if ((m = reBlock.exec(line))) { flush(); out.push(blocks[+m[1]]); i++; continue; }

        if ((m = /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line))) {
          flush();
          var lvl = m[1].length, h = inline(m[2]);
          out.push("<h" + lvl + ' id="' + slug(h) + '">' + h + "</h" + lvl + ">");
          i++; continue;
        }

        if (/^\s{0,3}([-*_])(\s*\1){2,}\s*$/.test(line)) { flush(); out.push("<hr>"); i++; continue; }

        if (/^\s{0,3}>/.test(line)) {
          flush();
          var q = [];
          while (i < lines.length && /^\s{0,3}>/.test(lines[i])) { q.push(lines[i].replace(/^\s{0,3}>\s?/, "")); i++; }
          out.push("<blockquote>" + renderBlocks(q) + "</blockquote>");
          continue;
        }

        if (line.indexOf("|") >= 0 && i + 1 < lines.length && reSep.test(lines[i + 1])) {
          flush();
          var head = cells(line), aligns = cells(lines[i + 1]).map(function (c) {
            return /^:-+:$/.test(c) ? "center" : /-+:$/.test(c) ? "right" : "";
          });
          i += 2;
          var rows = [];
          while (i < lines.length && lines[i].trim() && lines[i].indexOf("|") >= 0) { rows.push(cells(lines[i])); i++; }
          out.push(table(head, aligns, rows));
          continue;
        }

        if (reList.test(line)) {
          flush();
          var chunk = [];
          var base = reList.exec(line)[1].length;
          while (i < lines.length) {
            var l = lines[i];
            if (!l.trim()) {
              // A blank line ends the list unless the next line continues it.
              var nx = lines[i + 1];
              if (nx && (reList.test(nx) || /^\s{2,}\S/.test(nx)) && indent(nx) >= base) { chunk.push(""); i++; continue; }
              break;
            }
            if (reList.test(l) || indent(l) > base) { chunk.push(l); i++; continue; }
            break;
          }
          out.push(list(chunk));
          continue;
        }

        if ((m = /^\s*!\[([^\]]*)\]\(\s*([^)\s]+)(?:\s+"(.*?)")?\s*\)\s*$/.exec(line))) {
          flush();
          var cap = m[3] || m[1];
          out.push('<figure><img src="' + esc(safeUrl(resolveUrl(m[2]))) + '" alt="' + esc(m[1]) + '" loading="lazy">' +
            (cap ? "<figcaption>" + inline(cap) + "</figcaption>" : "") + "</figure>");
          i++; continue;
        }

        para.push(line.replace(/^\s+/, ""));
        i++;
      }
      flush();
      return out.join("\n");
    }

    function indent(l) { return /^\s*/.exec(l)[0].length; }

    function list(chunk) {
      var reList = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
      var first = reList.exec(chunk[0]);
      var base = first[1].length;
      var ordered = /\d/.test(first[2]);
      var start = ordered ? parseInt(first[2], 10) : 1;
      var items = [], cur = null;
      chunk.forEach(function (l) {
        var m = reList.exec(l);
        if (m && m[1].length <= base + 1) { cur = [m[3]]; items.push(cur); }
        else if (cur) cur.push(l.length > base + 2 ? l.slice(Math.min(indent(l), base + 2)) : l.trim());
      });
      var tag = ordered ? "ol" : "ul";
      return "<" + tag + (ordered && start !== 1 ? ' start="' + start + '"' : "") + ">" + items.map(function (it) {
        if (it.length === 1) return "<li>" + inline(it[0]) + "</li>";
        var rest = it.slice(1);
        var firstNested = rest.findIndex(function (x) { return reList.test(x) || !x.trim(); });
        var lead = firstNested < 0 ? it : it.slice(0, firstNested + 1);
        var tail = firstNested < 0 ? [] : rest.slice(firstNested);
        return "<li>" + inline(lead.join("\n")) + (tail.length ? renderBlocks(tail) : "") + "</li>";
      }).join("") + "</" + tag + ">";
    }

    function cells(row) {
      row = row.trim().replace(/^\|/, "").replace(/\|$/, "");
      return row.split(/(?<!\\)\|/).map(function (c) { return c.trim().replace(/\\\|/g, "|"); });
    }

    function table(head, aligns, rows) {
      function td(tag, c, j) {
        var a = aligns[j];
        var num = /^[-+−]?[\d.,]+\s*(%|[a-zA-Z°/·²³µ]+)?$/.test(c);
        var cls = num && !a && j > 0 ? ' class="num"' : "";
        return "<" + tag + cls + (a ? ' style="text-align:' + a + '"' : "") + ">" + inline(c) + "</" + tag + ">";
      }
      return '<div class="table-wrap"><table><thead><tr>' + head.map(function (c, j) { return td("th", c, j); }).join("") +
        "</tr></thead><tbody>" + rows.map(function (r) {
          return "<tr>" + head.map(function (_, j) { return td("td", r[j] || "", j); }).join("") + "</tr>";
        }).join("") + "</tbody></table></div>";
    }
  }

  window.Markdown = { render: render };
})();
