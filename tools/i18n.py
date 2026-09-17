#!/usr/bin/env python3
"""
Language routes for dariog.it (English, Spanish, Italian).

This file is the ONE place that knows which pages are translations of
each other. Running it rewrites, on every page listed in ROUTES:

  * <html lang="..">
  * the language toggle in the nav (between I18N_TOGGLE_* markers):
    one copy inside the menu (desktop + open mobile menu) and one row
    under the logo on phones
  * the hreflang links and og:locale tags in <head>
    (between I18N_HEAD_START / I18N_HEAD_END)
  * sitemap.xml, with every language version and its alternates

It is safe to run as often as you like: it replaces its own blocks
instead of adding new ones.

    python3 tools/i18n.py

HOW TO ADD A PAGE
  1. Build the English page, then the Spanish and Italian copies
     (e.g. /es/<slug>/index.html and /it/<slug>/index.html).
  2. Add one line to ROUTES below with the three URLs.
  3. Run the script. Every toggle, hreflang tag and the sitemap update.

HOW TO RENAME A TRANSLATED URL
  Move the folder, change the URL in ROUTES, run the script, and search the
  site for the old path (nav, footer and card links are plain HTML).

The page text itself is plain HTML in each file: edit it there.
Words the JavaScript injects (album bar, footer album, form messages)
live in the STRINGS table in js/main.js.
"""

import os
import re
import sys
from datetime import date
from xml.sax.saxutils import escape

SITE = "https://dariog.it"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

LANGS = ["en", "es", "it"]
DEFAULT_LANG = "en"

LANG_INFO = {
    "en": {"label": "English",  "short": "EN", "locale": "en_GB",  "aria": "Language"},
    "es": {"label": "Español",  "short": "ES", "locale": "es_419", "aria": "Idioma"},
    "it": {"label": "Italiano", "short": "IT", "locale": "it_IT",  "aria": "Lingua"},
}

# key: (English URL, Spanish URL, Italian URL, in sitemap?)
ROUTES = {
    "home":           ("/",                "/es/",                    "/it/",               True),
    "services":       ("/services/",       "/es/servicios/",          "/it/percorsi/",      True),
    "individual":     ("/individual/",     "/es/individual/",         "/it/individuale/",   True),
    "couple":         ("/couple/",         "/es/pareja/",             "/it/coppia/",        True),
    "group":          ("/group/",          "/es/grupo/",              "/it/gruppo/",        True),
    "sacred-circles": ("/sacred-circles/", "/es/circulos-sagrados/",  "/it/cerchi-sacri/",  True),
    "saray":          ("/saray/",          "/es/saray/",              "/it/saray/",         True),
    "about":          ("/about/",          "/es/sobre-mi/",           "/it/chi-sono/",      True),
    "contact":        ("/contact/",        "/es/contacto/",           "/it/contatti/",      True),
    "privacy":        ("/privacy/",        "/es/privacidad/",         "/it/privacy/",       True),
    "thankyou":       ("/thankyou.html",   "/es/gracias.html",        "/it/grazie.html",    False),
}


def url_for(key, lang):
    return ROUTES[key][LANGS.index(lang)]


def file_for(url):
    path = url.lstrip("/")
    if path == "" or path.endswith("/"):
        path += "index.html"
    return os.path.join(ROOT, path)


def replace_block(html, name, new_block, insert):
    """Swap the text between <!-- NAME_START --> and <!-- NAME_END -->,
    or call insert(html, block) if the markers are not there yet."""
    start, end = "<!-- %s_START -->" % name, "<!-- %s_END -->" % name
    block = start + new_block + end
    pattern = re.compile(re.escape(start) + r".*?" + re.escape(end), re.S)
    if pattern.search(html):
        return pattern.sub(lambda m: block, html, count=1)
    return insert(html, block)


def toggle_links(key, lang, indent):
    parts = []
    for i, l in enumerate(LANGS):
        info = LANG_INFO[l]
        attrs = 'href="%s" lang="%s" hreflang="%s"' % (url_for(key, l), l, l)
        if l == lang:
            attrs += ' class="active" aria-current="page"'
        parts.append(
            '%s<a %s><span class="nav-lang-full">%s</span><span class="nav-lang-short" aria-hidden="true">%s</span></a>'
            % (indent, attrs, info["label"], info["short"])
        )
        if i < len(LANGS) - 1:
            parts.append('%s<span class="nav-lang-sep" aria-hidden="true">|</span>' % indent)
    return "\n".join(parts)


def toggle_block(key, lang, extra_class, indent):
    cls = "nav-lang" + (" " + extra_class if extra_class else "")
    return "\n%s<div class=\"%s\" role=\"navigation\" aria-label=\"%s\">\n%s\n%s</div>\n%s" % (
        indent, cls, LANG_INFO[lang]["aria"], toggle_links(key, lang, indent + "  "), indent, indent[:-2])


def head_block(key, lang):
    lines = [""]
    for l in LANGS:
        lines.append('  <link rel="alternate" hreflang="%s" href="%s%s">' % (l, SITE, url_for(key, l)))
    lines.append('  <link rel="alternate" hreflang="x-default" href="%s%s">' % (SITE, url_for(key, DEFAULT_LANG)))
    if ROUTES[key][3]:
        lines.append('  <meta property="og:locale" content="%s">' % LANG_INFO[lang]["locale"])
        for l in LANGS:
            if l != lang:
                lines.append('  <meta property="og:locale:alternate" content="%s">' % LANG_INFO[l]["locale"])
    lines.append("  ")
    return "\n".join(lines)


def sync_page(key, lang):
    path = file_for(url_for(key, lang))
    if not os.path.exists(path):
        print("  missing: %s" % os.path.relpath(path, ROOT))
        return False
    html = open(path, encoding="utf-8").read()
    before = html

    html = re.sub(r'<html lang="[^"]*">', '<html lang="%s">' % lang, html, count=1)

    # og:locale now lives inside the managed head block
    def strip_loose_locale(h):
        return re.sub(r'\n\s*<meta property="og:locale" content="[^"]*">', "", h, count=1)

    if "<!-- I18N_HEAD_START -->" not in html:
        html = strip_loose_locale(html)

    def insert_head(h, block):
        m = re.search(r'(\n[ \t]*<link rel="canonical"[^>]*>)', h)
        if not m:
            m = re.search(r"(\n)(?=</head>)", h)
            return h[:m.end()] + "  " + block + "\n" + h[m.end():]
        return h[:m.end()] + "\n  " + block + h[m.end():]

    html = replace_block(html, "I18N_HEAD", head_block(key, lang), insert_head)

    nav_m = re.search(r'<nav class="nav" id="nav">.*?</nav>', html, re.S)
    if nav_m:
        nav = nav_m.group(0)

        def insert_menu(n, block):
            i = n.rfind("</div>")
            j = n.rfind("\n", 0, i)
            return n[:j] + "\n      " + block + n[j:]

        def insert_bar(n, block):
            i = n.rfind("</nav>")
            j = n.rfind("\n", 0, i)
            return n[:j] + "\n    " + block + n[j:]

        nav = replace_block(nav, "I18N_TOGGLE", toggle_block(key, lang, "", "        "), insert_menu)
        nav = replace_block(nav, "I18N_TOGGLE_BAR", toggle_block(key, lang, "nav-lang--bar", "      "), insert_bar)
        html = html[:nav_m.start()] + nav + html[nav_m.end():]
    else:
        print("  no nav found: %s" % os.path.relpath(path, ROOT))

    if html != before:
        open(path, "w", encoding="utf-8").write(html)
    return True


def write_sitemap():
    path = os.path.join(ROOT, "sitemap.xml")
    old = open(path, encoding="utf-8").read() if os.path.exists(path) else ""
    known = {}
    for m in re.finditer(r"<url>(.*?)</url>", old, re.S):
        loc = re.search(r"<loc>(.*?)</loc>", m.group(1))
        mod = re.search(r"<lastmod>(.*?)</lastmod>", m.group(1))
        pri = re.search(r"<priority>(.*?)</priority>", m.group(1))
        if loc:
            known[loc.group(1)] = (mod.group(1) if mod else None, pri.group(1) if pri else None)

    managed = set()
    for key, route in ROUTES.items():
        for lang in LANGS:
            managed.add(SITE + url_for(key, lang))
    # <url> entries this script does not manage (e.g. standalone landing
    # pages) are kept exactly as they are, at the end of the file.
    unmanaged = []
    for m in re.finditer(r"[ \t]*<url>.*?</url>", old, re.S):
        loc = re.search(r"<loc>(.*?)</loc>", m.group(0))
        if loc and loc.group(1) not in managed:
            unmanaged.append(m.group(0).rstrip())

    today = date.today().isoformat()
    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
           '        xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for key, route in ROUTES.items():
        if not route[3]:
            continue
        en_loc = SITE + url_for(key, "en")
        en_pri = (known.get(en_loc) or (None, None))[1] or "0.8"
        for lang in LANGS:
            loc = SITE + url_for(key, lang)
            mod, pri = known.get(loc, (None, None))
            out.append("  <url>")
            out.append("    <loc>%s</loc>" % escape(loc))
            out.append("    <lastmod>%s</lastmod>" % (mod or today))
            out.append("    <priority>%s</priority>" % (pri or en_pri))
            for l in LANGS:
                out.append('    <xhtml:link rel="alternate" hreflang="%s" href="%s%s"/>' % (l, SITE, url_for(key, l)))
            out.append('    <xhtml:link rel="alternate" hreflang="x-default" href="%s"/>' % en_loc)
            out.append("  </url>")
    out.extend(unmanaged)
    out.append("</urlset>")
    open(path, "w", encoding="utf-8").write("\n".join(out) + "\n")


def main():
    ok = True
    for key in ROUTES:
        for lang in LANGS:
            ok = sync_page(key, lang) and ok
    write_sitemap()
    print("done" if ok else "done, with missing pages (see above)")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
