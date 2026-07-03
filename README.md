# VrajPandya.github.io

Personal blog scaffold built with Jekyll for GitHub Pages.

## Local development

With a modern Ruby:

```sh
bundle install
bundle exec jekyll serve --livereload
```

Then open <http://127.0.0.1:4000>.

If macOS system Ruby fails on native gems, use Docker instead:

```sh
docker run --rm --platform linux/amd64 -p 4000:4000 -v "$PWD":/srv/jekyll -w /srv/jekyll jekyll/jekyll:4.2.2 jekyll serve --host 0.0.0.0
```

## Writing posts

Plain posts live in `_posts/YYYY-MM-DD-title.md`:

```md
---
layout: post
title: My Post
date: 2026-01-03
description: Optional one-line summary.
---

Markdown content goes here.
```

Interactive posts use the scrollytelling layout:

```md
---
layout: scrollytelling
title: My Animated Essay
date: 2026-01-04
scrolly_script: /assets/js/my-essay-scenes.js
---
```

Use `_includes/scrolly-section.html` to pair Markdown copy with a named drawing scene. Scenes are registered in JavaScript with `ScrollyDraw.register(...)`; see `assets/js/scrollytelling.js` and `_posts/2026-01-02-animation-starter.md` for the starter pattern.

Slider-driven posts use the same pattern with `layout: slider`, `_includes/slider-section.html`, and scenes registered with `SliderDraw.register(...)`. See `_posts/2026-01-03-slider-animation-starter.md`.
