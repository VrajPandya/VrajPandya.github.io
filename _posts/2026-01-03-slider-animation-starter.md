---
layout: slider
title: Slider Animation Starter
date: 2026-01-03
description: A starter page for SVG scenes controlled by a range slider.
---

This post demonstrates the slider-driven layout. It uses the same basic essay pattern as the scroll template, but each visual updates from a local range control instead of page scroll position.

{% capture curve_copy %}
### Scrubbable diagrams

Use the `slider` layout when the reader should directly control a parameter. The include creates the figure, range input, caption, and SVG canvas.

The scene receives a normalized progress value from `0` to `1`, so page-specific scripts can focus on drawing instead of input plumbing.
{% endcapture %}
{% include slider-section.html scene="curve-morph" label="Blend" value=35 caption="The curve updates continuously as the slider moves." copy=curve_copy %}

{% capture threshold_copy %}
### Parameter sweeps

A slider is useful when the essay compares thresholds, blends, weights, or time steps. Keep the prose in Markdown and register the scene with `SliderDraw.register(name, scene)`.

For a custom essay, add `slider_script: /assets/js/my-essay-slider-scenes.js` in front matter.
{% endcapture %}
{% include slider-section.html scene="threshold-sweep" label="Threshold" value=45 caption="The selected bars change as the threshold moves." copy=threshold_copy %}

