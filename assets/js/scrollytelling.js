(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var scenes = {};
  var activeScenes = [];
  var ticking = false;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function mapRange(value, inMin, inMax, outMin, outMax) {
    if (inMax === inMin) {
      return outMin;
    }
    var t = clamp((value - inMin) / (inMax - inMin), 0, 1);
    return outMin + (outMax - outMin) * t;
  }

  function el(tag, attrs, parent) {
    var node = document.createElementNS(NS, tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (attrs[key] !== null && attrs[key] !== undefined) {
          node.setAttribute(key, attrs[key]);
        }
      });
    }
    if (parent) {
      parent.appendChild(node);
    }
    return node;
  }

  function text(value, x, y, attrs, parent) {
    var node = el("text", Object.assign({ x: x, y: y }, attrs || {}), parent);
    node.textContent = value;
    return node;
  }

  function preparePath(path) {
    var length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
    return length;
  }

  function drawPath(path, progress) {
    var length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length * (1 - clamp(progress, 0, 1));
  }

  function setOpacity(node, progress, start, end) {
    node.setAttribute("opacity", mapRange(progress, start, end, 0, 1).toFixed(3));
  }

  function addArrowDef(svg) {
    var defs = el("defs", null, svg);
    var marker = el("marker", {
      id: "arrowhead",
      viewBox: "0 0 10 10",
      refX: "9",
      refY: "5",
      markerWidth: "6",
      markerHeight: "6",
      orient: "auto-start-reverse"
    }, defs);
    el("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: "var(--viz-line)" }, marker);
  }

  function nodeGroup(svg, label, x, y, width, height) {
    var g = el("g", { class: "scrolly-node", opacity: 0 }, svg);
    el("rect", { x: x, y: y, width: width, height: height, rx: 8, ry: 8 }, g);
    text(label, x + width / 2, y + height / 2 + 6, {
      "text-anchor": "middle"
    }, g);
    return g;
  }

  function register(name, scene) {
    scenes[name] = scene;
  }

  function fallbackScene(name) {
    return {
      caption: "Scene not found: " + name,
      render: function (svg) {
        text("Missing scene", 320, 300, {
          "text-anchor": "middle",
          class: "scrolly-label"
        }, svg);
        text(name, 320, 330, {
          "text-anchor": "middle",
          class: "scrolly-label"
        }, svg);
      },
      update: function () {}
    };
  }

  function createSvg(canvas) {
    var svg = el("svg", {
      viewBox: "0 0 640 640",
      role: "img",
      "aria-hidden": "true",
      focusable: "false"
    });
    canvas.replaceChildren(svg);
    return svg;
  }

  function progressFor(section) {
    var rect = section.getBoundingClientRect();
    var viewport = window.innerHeight || document.documentElement.clientHeight;
    var start = viewport * 0.78;
    var end = Math.min(viewport * 0.18, viewport - rect.height);
    return clamp((start - rect.top) / (start - end), 0, 1);
  }

  function updateCaptions(item, progress) {
    if (!item.captionNode || !item.scene.caption) {
      return;
    }
    if (typeof item.scene.caption === "function") {
      item.captionNode.textContent = item.scene.caption(progress);
    } else {
      item.captionNode.textContent = item.scene.caption;
    }
  }

  function updateAll() {
    activeScenes.forEach(function (item) {
      var progress = progressFor(item.section);
      if (item.scene.update) {
        item.scene.update(item.svg, progress, helpers);
      }
      updateCaptions(item, progress);
    });
    ticking = false;
  }

  function requestUpdate() {
    if (!ticking) {
      window.requestAnimationFrame(updateAll);
      ticking = true;
    }
  }

  function init() {
    activeScenes = Array.prototype.map.call(document.querySelectorAll("[data-scrolly-section]"), function (section) {
      var canvas = section.querySelector("[data-scene]");
      var sceneName = canvas ? canvas.getAttribute("data-scene") : "";
      var scene = scenes[sceneName] || fallbackScene(sceneName);
      var svg = createSvg(canvas);

      if (scene.render) {
        scene.render(svg, helpers);
      }

      return {
        section: section,
        canvas: canvas,
        scene: scene,
        svg: svg,
        captionNode: section.querySelector("[data-scrolly-caption]")
      };
    });

    updateAll();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
  }

  var helpers = {
    NS: NS,
    clamp: clamp,
    mapRange: mapRange,
    el: el,
    text: text,
    preparePath: preparePath,
    drawPath: drawPath,
    setOpacity: setOpacity,
    addArrowDef: addArrowDef,
    nodeGroup: nodeGroup
  };

  register("signal-flow", {
    caption: function (progress) {
      if (progress < 0.35) return "Nodes fade in first.";
      if (progress < 0.72) return "Paths draw as the section advances.";
      return "The full system is available to annotate or extend.";
    },
    render: function (svg, h) {
      h.addArrowDef(svg);

      var path1 = h.el("path", {
        d: "M 180 170 C 260 120, 350 120, 440 170",
        class: "scrolly-draw-path",
        "marker-end": "url(#arrowhead)"
      }, svg);
      var path2 = h.el("path", {
        d: "M 480 250 C 515 330, 500 425, 420 470",
        class: "scrolly-draw-path scrolly-accent",
        "marker-end": "url(#arrowhead)"
      }, svg);
      var path3 = h.el("path", {
        d: "M 300 500 C 210 510, 150 450, 145 345",
        class: "scrolly-draw-path scrolly-muted",
        "marker-end": "url(#arrowhead)"
      }, svg);

      h.preparePath(path1);
      h.preparePath(path2);
      h.preparePath(path3);

      var nodes = [
        h.nodeGroup(svg, "Question", 68, 122, 150, 76),
        h.nodeGroup(svg, "Sketch", 408, 122, 150, 76),
        h.nodeGroup(svg, "Simulate", 392, 442, 166, 76),
        h.nodeGroup(svg, "Write", 76, 304, 140, 76)
      ];

      h.text("scroll-linked SVG", 320, 588, {
        "text-anchor": "middle",
        class: "scrolly-label"
      }, svg);

      svg._signalFlow = { paths: [path1, path2, path3], nodes: nodes };
    },
    update: function (svg, progress, h) {
      var data = svg._signalFlow;
      data.nodes.forEach(function (node, index) {
        h.setOpacity(node, progress, 0.05 + index * 0.08, 0.2 + index * 0.08);
      });
      h.drawPath(data.paths[0], h.mapRange(progress, 0.28, 0.48, 0, 1));
      h.drawPath(data.paths[1], h.mapRange(progress, 0.48, 0.68, 0, 1));
      h.drawPath(data.paths[2], h.mapRange(progress, 0.68, 0.9, 0, 1));
    }
  });

  register("thinking-loop", {
    caption: function (progress) {
      if (progress < 0.4) return "The marker follows a drawn reasoning loop.";
      if (progress < 0.78) return "State can change continuously, not just fade in.";
      return "Use the same hooks for charts, diagrams, or canvas renderers.";
    },
    render: function (svg, h) {
      var track = h.el("path", {
        d: "M 320 116 C 480 116, 540 260, 472 390 C 420 490, 270 540, 170 455 C 58 360, 95 175, 230 130 C 260 120, 290 116, 320 116",
        class: "scrolly-draw-path scrolly-muted"
      }, svg);
      h.preparePath(track);

      var inner = h.el("path", {
        d: "M 250 275 C 290 218, 382 218, 420 276 C 455 330, 420 405, 350 420 C 287 435, 226 390, 220 326 C 218 307, 228 290, 250 275",
        class: "scrolly-draw-path scrolly-accent"
      }, svg);
      h.preparePath(inner);

      var dot = h.el("circle", {
        cx: 320,
        cy: 116,
        r: 12,
        fill: "var(--accent)"
      }, svg);

      var labels = [
        h.text("observe", 320, 88, { "text-anchor": "middle", class: "scrolly-label", opacity: 0 }, svg),
        h.text("reason", 512, 323, { "text-anchor": "middle", class: "scrolly-label", opacity: 0 }, svg),
        h.text("revise", 232, 516, { "text-anchor": "middle", class: "scrolly-label", opacity: 0 }, svg)
      ];

      h.text("custom scenes are JavaScript functions", 320, 588, {
        "text-anchor": "middle",
        class: "scrolly-label"
      }, svg);

      svg._thinkingLoop = { track: track, inner: inner, dot: dot, labels: labels };
    },
    update: function (svg, progress, h) {
      var data = svg._thinkingLoop;
      h.drawPath(data.track, h.mapRange(progress, 0.05, 0.55, 0, 1));
      h.drawPath(data.inner, h.mapRange(progress, 0.45, 0.92, 0, 1));

      var length = data.track.getTotalLength();
      var point = data.track.getPointAtLength(length * progress);
      data.dot.setAttribute("cx", point.x.toFixed(2));
      data.dot.setAttribute("cy", point.y.toFixed(2));
      data.dot.setAttribute("opacity", h.mapRange(progress, 0.02, 0.12, 0, 1).toFixed(3));

      data.labels.forEach(function (label, index) {
        h.setOpacity(label, progress, 0.18 + index * 0.2, 0.28 + index * 0.2);
      });
    }
  });

  window.ScrollyDraw = {
    register: register,
    scenes: scenes,
    helpers: helpers
  };

  document.addEventListener("DOMContentLoaded", init);
})();

