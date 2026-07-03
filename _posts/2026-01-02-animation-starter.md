---
layout: scrollytelling
title: Animated Essay Starter
date: 2026-01-02
description: A starter page for scroll-linked SVG diagrams and interactive writing.
epigraph: A minimal scaffold for essays where drawings move with the text.
epigraph_source: Site setup note
---

This post demonstrates the interactive layout. The text remains normal Markdown, while each section can pin a drawing beside it and update that drawing as the reader scrolls.

{% capture signal_copy %}
### Scroll-linked diagrams

Use the `scrollytelling` layout when a post needs a sticky visual column. Each section names a scene, and `assets/js/scrollytelling.js` renders the matching SVG.

The runtime exposes helpers for SVG nodes, paths, captions, and progress values from `0` to `1`.
{% endcapture %}
{% include scrolly-section.html scene="signal-flow" caption="A diagram scene can fade nodes and draw arrows as the section progresses." copy=signal_copy %}

{% capture loop_copy %}
### Custom drawing scenes

Scenes are just JavaScript functions registered with `ScrollyDraw.register(name, scene)`. A scene can draw SVG paths, move markers, reveal labels, or delegate to a canvas renderer.

For a one-off essay, add a page-specific script in front matter with `scrolly_script: /assets/js/my-post-scenes.js`.
{% endcapture %}
{% include scrolly-section.html scene="thinking-loop" caption="The same hook supports continuous animation, not only static reveals." copy=loop_copy %}

That is enough to start drafting. The rest of the page can return to ordinary Markdown whenever a full-width visual is not needed.

