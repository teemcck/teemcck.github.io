# Portfolio

My personal portfolio site, written in plain HTML, CSS, and JavaScript. It's styled like a terminal window manager, with switchable color themes.

**Live site:** https://teemcck.github.io/

## Structure

- `index.html`: hub page with the home, projects, jams, and skills tabs (keys 1-4 switch tabs)
- `blogs/*-blog.html`: project devlogs
- `css/style.css`: every style on the site; the default theme (kanagawa dragon) is in `:root` and the others are `html[data-theme="..."]` blocks
- `js/settings.js`: the [fx] menu (theme, scanlines, text glow, pixel font), saved in localStorage; also redraws the favicon in the current theme's colors
- `js/hub.js`: tab switching on the hub page
- `js/blog.js`: contents list on the devlogs
- `js/preview.js`: click an image to enlarge it
- `favicon.svg`, `favicon.png`, `apple-touch-icon.png`: the pixel "tm" icon in the default theme's colors
- `images/`, `videos/`: media, grouped by project; `images/og-card.png` is the link preview image

## Themes

Each page has a small inline script in its `<head>` that applies the saved theme before the page paints. When adding or removing a theme, update the theme list in that script on every page, the list in `js/settings.js`, the radio buttons in each page's [fx] menu, and the CSS block.

When changing the icon files, bump the `?v=` tag on the icon links so browsers fetch the new ones.

## Running Locally

Run `python3 -m http.server 8000` in this folder and open `http://localhost:8000`.

Fonts, KaTeX, and Prism load from CDNs, so you need an internet connection for those.
