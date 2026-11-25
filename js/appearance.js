"use strict";
(() => {
  const storageKey = "vo-appearance";
  const presets = { red: "#bd3024", teal: "#157a73", indigo: "#6456ae" };
  const scheme = window.matchMedia("(prefers-color-scheme: dark)");
  const root = document.documentElement;
  let dialog;

  function readPreferences() {
    let saved;
    try {
      saved = JSON.parse(localStorage.getItem(storageKey));
    } catch { /* The controls also work when storage is unavailable. */ }
    return {
      theme: ["light", "dark", "system"].includes(saved?.theme) ? saved.theme : "system",
      accent: Object.hasOwn(presets, saved?.accent) || saved?.accent === "custom" ? saved.accent : "red",
      custom: /^#[a-f0-9]{6}$/i.test(saved?.custom) ? saved.custom : presets.red,
    };
  }

  let preference = readPreferences();

  function rgb(hex) {
    return hex.slice(1).match(/../g).map(channel => parseInt(channel, 16));
  }

  function luminance(channels) {
    const [r, g, b] = channels.map(channel => {
      const s = channel / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return .2126 * r + .7152 * g + .0722 * b;
  }

  // Keep the requested hue as close as possible while making accent text readable.
  function accentForSurface(color, background, lighten) {
    const source = rgb(color);
    const surface = luminance(rgb(background));
    for (let step = 0; step <= 100; step += 2) {
      const channels = source.map(value => Math.round(value + ((lighten ? 255 : 0) - value) * step / 100));
      const ink = luminance(channels);
      if ((Math.max(ink, surface) + .05) / (Math.min(ink, surface) + .05) >= 5) {
        return "#" + channels.map(value => value.toString(16).padStart(2, "0")).join("");
      }
    }
    return lighten ? "#ffffff" : "#000000";
  }

  function apply() {
    const dark = preference.theme === "dark" || (preference.theme === "system" && scheme.matches);
    const color = presets[preference.accent] || preference.custom;
    const onLight = accentForSurface(color, "#e8e3d8", false);
    const onDark = accentForSurface(color, "#343a3f", true);
    root.dataset.theme = dark ? "dark" : "light";
    root.style.setProperty("--red", dark ? onDark : onLight);
    root.style.setProperty("--accent-print", onLight);
    root.style.setProperty("--accent-night", onDark);
    root.style.setProperty("--custom-swatch", preference.custom);
    document.querySelector('meta[name="theme-color"]').content = dark ? "#171b1d" : "#f6f4ed";
    if (!dialog) return;
    for (const option of dialog.querySelectorAll('input[type="radio"]')) {
      option.checked = option.value === (option.name === "vo-theme" ? preference.theme : preference.accent);
    }
    dialog.querySelector(".custom-picker").hidden = preference.accent !== "custom";
    dialog.querySelector("#custom-accent").value = preference.custom;
    dialog.querySelector("#color-value").value = preference.custom.toUpperCase();
  }

  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(preference)); } catch { /* Session only. */ }
  }

  apply();
  scheme.addEventListener("change", apply);
  window.addEventListener("storage", event => {
    if (event.key === storageKey || event.key === null) {
      preference = readPreferences();
      apply();
    }
  });
  document.addEventListener("DOMContentLoaded", () => {
    dialog = document.getElementById("appearance-dialog");
    dialog.addEventListener("change", event => {
      if (event.target.name === "vo-theme") preference.theme = event.target.value;
      if (event.target.name === "vo-accent") preference.accent = event.target.value;
      if (event.target.id === "custom-accent") preference.custom = event.target.value;
      apply();
      save();
    });
    dialog.querySelector("#custom-accent").addEventListener("input", event => {
      preference.custom = event.target.value;
      apply();
    });
    dialog.querySelector(".appearance-done").addEventListener("click", () => dialog.close());
    apply();
  }, { once: true });
})();
