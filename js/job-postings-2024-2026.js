(function () {
  var X = null;
  var Q = [], charts = {}, W = 600, FONT = "sans-serif";
  function tok() {
    var dark = document.documentElement.classList.contains("dark");
    return {fg: dark ? "#e8e8e3" : "#1f1f1a", fg2: dark ? "#b3b3ab" : "#5a5955", grid: dark ? "#3a3a36" : "#e6e5e1",
      s: dark ? ["#3987e5", "#d95926", "#199e70"] : ["#2a78d6", "#eb6834", "#1baf7a"], dim: dark ? "#55554f" : "#c9c7bf"};
  }
  function base(t) { return {backgroundColor: "transparent", textStyle: {fontFamily: FONT, color: t.fg2}, animation: false, tooltip: {trigger: "axis", valueFormatter: function (v) { return Math.round(v) + "%"; }}}; }
  function axX(t) { return {type: "category", data: Q, boundaryGap: false, axisLine: {lineStyle: {color: t.grid}}, axisTick: {show: false}, axisLabel: {color: t.fg2, interval: 3, formatter: function (v) { return v.slice(-2) === "Q1" ? v.slice(0, 4) : ""; }}}; }
  function axY(t, max) { return {type: "value", min: 0, max: max, axisLabel: {formatter: "{value}%", color: t.fg2}, splitLine: {lineStyle: {color: t.grid}}}; }
  function line(t, name, data, color) { return {name: name, type: "line", data: data, symbol: "none", lineStyle: {width: 2.5, color: color}, itemStyle: {color: color}, endLabel: {show: true, formatter: function (p) { return p.seriesName + " " + Math.round(p.value) + "%"; }, color: t.fg, fontSize: 12, fontWeight: 500}, labelLayout: {moveOverlap: "shiftY"}}; }
  var cv;
  function tw(s) { cv = cv || document.createElement("canvas").getContext("2d"); cv.font = "12px " + FONT; return cv.measureText(s).width; }
  function keyed(t, o) {
    if (W >= 560) return o;
    var names = o.series.map(function (s) { return s.name; }), rows = 1, x = 0, room = W - 24;
    names.forEach(function (n) { var w = 30 + tw(n) + 14; if (x && x + w - 14 > room) { rows++; x = 0; } x += w; });
    o.series.forEach(function (s) { s.endLabel.formatter = function (p) { return Math.round(p.value) + "%"; }; });
    o.legend = {bottom: 0, left: "center", width: room, itemGap: 14, textStyle: {color: t.fg2}, data: names};
    o.grid.right = 40; o.grid.bottom += rows * 24 + 4;
    return o;
  }
  function lines(t, series, max, right) { return keyed(t, Object.assign(base(t), {grid: {left: 40, right: right || 150, top: 14, bottom: 30}, xAxis: axX(t), yAxis: axY(t, max), series: series})); }
  function hbar(t, cats, series, max, left) { var two = series.length <= 2 || W > 700; return Object.assign(base(t), {legend: {bottom: 0, left: "center", width: W - 24, itemGap: 14, textStyle: {color: t.fg2}}, grid: {left: left || 112, right: 48, top: 8, bottom: two ? 52 : 76},
    xAxis: {type: "value", min: 0, max: max, axisLabel: {formatter: "{value}%", color: t.fg2}, splitLine: {lineStyle: {color: t.grid}}},
    yAxis: {type: "category", data: cats, inverse: true, axisLine: {show: false}, axisTick: {show: false}, axisLabel: {color: t.fg2}},
    series: series.map(function (s, i) { return {name: s.name, type: "bar", data: s.data, barWidth: 12, itemStyle: {color: s.color || t.s[i], borderRadius: [0, 3, 3, 0]}, label: {show: true, position: "right", formatter: function (p) { return Math.round(p.value) + "%"; }, color: t.fg, fontSize: 11}}; })}); }
  function axH(t) { return {type: "category", data: X.skills.halves, boundaryGap: false, axisLine: {lineStyle: {color: t.grid}}, axisTick: {show: false}, axisLabel: {color: t.fg2, interval: 0, formatter: function (v) { return W <= 700 ? v.replace(" ", "\n") : v; }}}; }
  function linesH(t, series, max, right) { return keyed(t, Object.assign(base(t), {grid: {left: 40, right: right || 150, top: 14, bottom: W <= 700 ? 44 : 30}, xAxis: axH(t), yAxis: axY(t, max), series: series})); }
  function stackH(t, series) { var narrow = W <= 700; return Object.assign(base(t), {legend: {bottom: 0, left: "center", width: W - 24, itemGap: 14, textStyle: {color: t.fg2}}, grid: {left: 40, right: 16, top: 20, bottom: narrow ? 100 : 52},
    xAxis: Object.assign(axH(t), {boundaryGap: true}), yAxis: axY(t, 100),
    series: series.map(function (s) { return {name: s.name, type: "bar", stack: "d", data: s.data, barWidth: "55%", itemStyle: {color: s.color}, label: {show: true, formatter: function (p) { return p.value >= 8 ? Math.round(p.value) + "%" : ""; }, color: s.color === t.dim ? t.fg : "#fff", fontSize: 11}}; })}); }
  function sk(t, group, keys, colors, max, right) { var S = X.skills; return linesH(t, keys.map(function (k, i) { return line(t, S.labels[k], S[group][k], colors[i]); }), max, right); }
  var OPT = {
    sk_up: function (t) { return sk(t, "up", ["agent_development", "llm_evaluation", "guardrails_security", "observability_llmops"], [t.s[1], t.s[0], t.s[2], t.dim], 60, 130); },
    sk_down: function (t) { return sk(t, "down", ["fine_tuning", "llm_fundamentals", "model_research", "pretraining_training_infra"], [t.s[1], t.s[0], t.s[2], t.dim], 25, 170); },
    sk_new: function (t) { return sk(t, "new", ["mcp_agent_protocols", "tool_calling", "context_memory", "inference_optimization"], [t.s[1], t.s[0], t.s[2], t.dim], 15, 150); },
    sk_flat: function (t) { return sk(t, "flat", ["llm_app_integration", "rag_retrieval", "prompt_engineering"], [t.s[0], t.s[1], t.s[2]], 50, 130); },
    sk_depth: function (t) { var D = X.skills.depth; return stackH(t, [{name: "모델을 학습시키는 일", data: D.train_model, color: t.s[1]}, {name: "LLM 시스템을 만드는 일", data: D.build_system, color: t.s[0]}, {name: "LLM API를 쓰는 일", data: D.use_api, color: t.s[2]}, {name: "요구 없음", data: D.none, color: t.dim}]); },
    sk_kr: function (t) { var K = X.skills.kr_nonai; return hbar(t, K.labels, [{name: "국내", data: K.wanted, color: t.s[0]}, {name: "해외 채용 페이지 2026", data: K.overseas_2026, color: t.s[1]}], 60, 110); },
    sk_kr_ai: function (t) { var K = X.skills.kr_ai; return hbar(t, K.labels, [{name: "국내", data: K.wanted, color: t.s[0]}, {name: "해외 채용 페이지 2026", data: K.overseas_2026, color: t.s[1]}], 60, 110); },
    spread: function (t) { return lines(t, [line(t, "AI 제품을 만드는 팀", X.spread.hn_ai, t.s[1]), line(t, "그 밖의 팀", X.spread.hn_non, t.s[0])], 70, 170); },
    roles: function (t) { return hbar(t, X.roles.labels, [{name: "2024", data: X.roles.general_tech_2024, color: t.dim}, {name: "2026", data: X.roles.general_tech_2026, color: t.s[0]}], 30); },
    aimix: function (t) { return hbar(t, X.mix.labels, [{name: "2024", data: X.mix["2024"], color: t.dim}, {name: "2025", data: X.mix["2025"], color: t.s[1]}, {name: "2026", data: X.mix["2026"], color: t.s[0]}], 40); },
    tools: function (t) { return lines(t, [line(t, "언급", X.tools_gt.mention, t.s[0]), line(t, "직무 요건", X.tools_gt.in_role, t.s[2]), line(t, "필수 요건", X.tools_gt.required, t.s[1])], 70, 150); },
    verify: function (t) { var V = X.verify; return hbar(t, V.labels, [{name: "2024", data: V.y2024, color: t.dim}, {name: "2025", data: V.y2025, color: t.s[1]}, {name: "2026", data: V.y2026, color: t.s[0]}], 60, 128); },
    kr_comp: function (t) { var K = X.korea.composition; return hbar(t, K.labels, [{name: "국내", data: K.wanted, color: t.s[0]}, {name: "해외 일반 SW 기업", data: K.general_tech, color: t.s[1]}, {name: "Hacker News", data: K.hn, color: t.dim}], 80, 150); },
    kr_level: function (t) { var K = X.korea.level; return hbar(t, K.labels, [{name: "국내", data: K.wanted, color: t.s[0]}, {name: "해외 일반 SW 기업", data: K.general_tech, color: t.s[1]}, {name: "Hacker News", data: K.hn, color: t.dim}], 50, 150); },
    kr_roles: function (t) { var K = X.korea.roles; return hbar(t, K.labels, [{name: "국내", data: K.wanted_q5, color: t.s[0]}, {name: "해외 일반 SW 기업", data: K.general_tech_q5, color: t.s[1]}], 70); },
    kr_seniority: function (t) { var K = X.korea.seniority; return hbar(t, K.labels, [{name: "전체 공고", data: K.all_q7, color: t.dim}, {name: "그 밖의 팀만", data: K.nonai_q7, color: t.s[0]}, {name: "AI 제품을 만드는 팀의 비중", data: K.ai_share, color: t.s[1]}], 50); }
  };
  function draw() {
    if (!X) return;
    var t = tok();
    document.querySelectorAll(".jpt-chart").forEach(function (el) {
      var id = el.getAttribute("data-chart"); if (!OPT[id]) return;
      W = el.clientWidth || 600; FONT = getComputedStyle(el).fontFamily || "sans-serif";
      var c = charts[id] || (charts[id] = echarts.init(el, null, {renderer: "svg"}));
      c.setOption(OPT[id](t), true); c.resize();
    });
  }
  fetch("/data/job-postings-2024-2026.json?v=20261014a").then(function (r) { return r.json(); }).then(function (d) { X = d; Q = X.quarters; draw(); });
  new MutationObserver(draw).observe(document.documentElement, {attributes: true, attributeFilter: ["class"]});
  var tm; window.addEventListener("resize", function () { clearTimeout(tm); tm = setTimeout(draw, 150); });
})();
