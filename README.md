# Portfolio

My personal portfolio site, written in plain HTML, CSS, and JavaScript.

**Live site:** https://teemcck.github.io/

## Structure

- `index.html`: home page with the About, Projects, Game Jams, and Skills tabs
- `blogs/*-blog.html`: project write-ups
- `css/reset.css`: browser style reset
- `css/base.css`: colors, fonts, and styles shared by every page
- `css/home.css`: home page styles
- `css/blog.css`: write-up styles
- `js/home-nav.js`: tab switching on the home page
- `js/section-reveal.js`: fade-in when a tab opens
- `js/skills-typing.js`: terminal typing on the Skills tab
- `js/blog-nav.js`: contents list on the write-ups
- `js/image-preview.js`: click an image to enlarge it
- `images/`, `videos/`: media, grouped by project

## Running Locally

Run `python3 -m http.server 8000` in this folder and open `http://localhost:8000`.

Fonts, KaTeX, and Prism load from CDNs, so you need an internet connection for those.
