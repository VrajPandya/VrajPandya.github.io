(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var scenes = {};

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

  function register(name, scene) {
    scenes[name] = scene;
  }

  function fallbackScene(name) {
    return {
      caption: "Scene not found: " + name,
      output: function (progress) {
        return Math.round(progress * 100) + "%";
      },
      render: function (svg) {
        text("Missing scene", 320, 300, {
          "text-anchor": "middle",
          class: "slider-label"
        }, svg);
        text(name, 320, 330, {
          "text-anchor": "middle",
          class: "slider-label"
        }, svg);
      },
      update: function () {}
    };
  }

  function progressFromInput(input) {
    var min = Number(input.min || 0);
    var max = Number(input.max || 100);
    var value = Number(input.value || 0);
    return clamp((value - min) / (max - min), 0, 1);
  }

  function updateItem(item) {
    var progress = progressFromInput(item.input);
    if (item.scene.update) {
      item.scene.update(item.svg, progress, helpers);
    }
    if (item.captionNode && item.scene.caption) {
      item.captionNode.textContent = typeof item.scene.caption === "function"
        ? item.scene.caption(progress)
        : item.scene.caption;
    }
    if (item.outputNode) {
      item.outputNode.textContent = item.scene.output
        ? item.scene.output(progress, item.input.value)
        : Math.round(progress * 100) + "%";
    }
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-slider-section]"), function (section) {
      var canvas = section.querySelector("[data-slider-scene]");
      var input = section.querySelector("[data-slider-input]");
      var sceneName = canvas ? canvas.getAttribute("data-slider-scene") : "";
      var scene = scenes[sceneName] || fallbackScene(sceneName);
      var svg = createSvg(canvas);
      var item = {
        section: section,
        canvas: canvas,
        input: input,
        outputNode: section.querySelector("[data-slider-output]"),
        captionNode: section.querySelector("[data-slider-caption]"),
        scene: scene,
        svg: svg
      };

      if (scene.render) {
        scene.render(svg, helpers);
      }
      updateItem(item);
      input.addEventListener("input", function () {
        window.requestAnimationFrame(function () {
          updateItem(item);
        });
      });
    });
  }

  var helpers = {
    NS: NS,
    clamp: clamp,
    mapRange: mapRange,
    el: el,
    text: text,
    preparePath: preparePath,
    drawPath: drawPath,
    setOpacity: setOpacity
  };

  register("curve-morph", {
    caption: function (progress) {
      if (progress < 0.33) return "Low values keep the response smooth and conservative.";
      if (progress < 0.66) return "Middle values reveal a sharper bend in the model.";
      return "High values emphasize the late-stage response.";
    },
    output: function (progress) {
      return Math.round(progress * 100) + "%";
    },
    render: function (svg, h) {
      h.el("path", {
        d: "M 96 500 H 548 M 96 500 V 112",
        class: "slider-axis"
      }, svg);

      var guide = h.el("path", {
        d: "M 118 468 C 230 440, 250 255, 344 248 C 430 242, 460 152, 528 136",
        class: "slider-guide"
      }, svg);
      var path = h.el("path", {
        d: "",
        class: "slider-draw-path"
      }, svg);

      var dot = h.el("circle", {
        cx: 118,
        cy: 468,
        r: 10,
        class: "slider-dot"
      }, svg);

      h.text("input", 548, 536, { "text-anchor": "end", class: "slider-label" }, svg);
      h.text("response", 66, 124, { "text-anchor": "start", class: "slider-label" }, svg);
      h.text("drag to morph the curve", 320, 588, {
        "text-anchor": "middle",
        class: "slider-label"
      }, svg);

      h.preparePath(guide);
      h.drawPath(guide, 1);
      svg._curveMorph = { path: path, dot: dot };
    },
    update: function (svg, progress) {
      var data = svg._curveMorph;
      var c1y = 468 - progress * 190;
      var c2y = 360 - progress * 150;
      var midY = 350 - progress * 160;
      var endY = 258 - progress * 130;
      var pathData = [
        "M 118 468",
        "C 204 " + c1y.toFixed(1) + ", 254 " + c2y.toFixed(1) + ", 320 " + midY.toFixed(1),
        "S 452 " + (endY + 70).toFixed(1) + ", 528 " + endY.toFixed(1)
      ].join(" ");

      data.path.setAttribute("d", pathData);
      var length = data.path.getTotalLength();
      var point = data.path.getPointAtLength(length * progress);
      data.dot.setAttribute("cx", point.x.toFixed(2));
      data.dot.setAttribute("cy", point.y.toFixed(2));
    }
  });

  register("threshold-sweep", {
    caption: function (progress) {
      if (progress < 0.4) return "The threshold starts permissive.";
      if (progress < 0.75) return "Moving the handle changes which region is selected.";
      return "The selected region narrows as the threshold rises.";
    },
    output: function (progress) {
      return "threshold " + Math.round(progress * 100);
    },
    render: function (svg, h) {
      h.el("path", {
        d: "M 90 500 H 550",
        class: "slider-axis"
      }, svg);

      var bars = [];
      var values = [0.22, 0.38, 0.66, 0.78, 0.52, 0.86, 0.61, 0.34];
      values.forEach(function (value, index) {
        var x = 116 + index * 52;
        var height = 300 * value;
        bars.push(h.el("rect", {
          x: x,
          y: 500 - height,
          width: 34,
          height: height,
          rx: 5,
          class: "slider-bar"
        }, svg));
      });

      var threshold = h.el("path", {
        d: "M 100 500 V 126",
        class: "slider-threshold"
      }, svg);
      var label = h.text("", 100, 110, {
        "text-anchor": "middle",
        class: "slider-label"
      }, svg);

      h.text("selected bars", 320, 588, {
        "text-anchor": "middle",
        class: "slider-label"
      }, svg);
      svg._thresholdSweep = { bars: bars, values: values, threshold: threshold, label: label };
    },
    update: function (svg, progress) {
      var data = svg._thresholdSweep;
      var thresholdValue = progress;
      var x = 116 + progress * (7 * 52) + 17;
      data.threshold.setAttribute("d", "M " + x.toFixed(1) + " 500 V 126");
      data.label.setAttribute("x", x.toFixed(1));
      data.label.textContent = Math.round(progress * 100);
      data.bars.forEach(function (bar, index) {
        var selected = data.values[index] >= thresholdValue;
        bar.setAttribute("class", selected ? "slider-bar slider-bar-selected" : "slider-bar");
      });
    }
  });

  window.SliderDraw = {
    register: register,
    scenes: scenes,
    helpers: helpers
  };

  document.addEventListener("DOMContentLoaded", init);
})();

