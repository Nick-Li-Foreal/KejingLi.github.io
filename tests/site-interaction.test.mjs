/**
 * Interaction + layout regression tests (Node + jsdom).
 * Run: npm test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const mainJs = readFileSync(join(root, "js", "main.js"), "utf8");
const styleCss = readFileSync(join(root, "style", "style.css"), "utf8");

function makeWindow() {
  const dom = new JSDOM(
    `<!DOCTYPE html>
<html lang="en" data-lang="en" data-theme="dark">
<head><meta charset="utf-8"></head>
<body>
  <nav class="navbar">
    <button type="button" class="nav-toggle" aria-label="Menu"></button>
    <ul class="nav-menu">
      <li><a href="#home" class="active">Home</a></li>
      <li><button type="button" data-theme-toggle aria-label="Theme">T</button></li>
      <li>
        <button type="button" class="lang-btn" data-set-lang="en" aria-pressed="true">EN</button>
        <button type="button" class="lang-btn" data-set-lang="zh" aria-pressed="false">中文</button>
      </li>
    </ul>
  </nav>
  <main>
    <p class="probe"><span class="i18n-en">Hello</span><span class="i18n-zh">你好</span></p>
    <a href="https://example.com/out" class="btn btn-primary" id="hero-external">Out</a>
    <a href="#resume" class="btn btn-ghost" id="hero-hash">Resume</a>
  </main>
</body></html>`,
    {
      url: "http://localhost/",
      pretendToBeVisual: true,
      runScripts: "dangerously",
    }
  );

  const { window } = dom;
  const script = window.document.createElement("script");
  script.textContent = mainJs;
  window.document.body.appendChild(script);
  return window;
}

function testCssNavbarAboveMain() {
  const navBlock = styleCss.match(/\.navbar\s*\{[^}]*\}/s);
  assert.ok(navBlock, ".navbar { ... } block should exist");
  assert.match(
    navBlock[0],
    /z-index:\s*1000/,
    "navbar must use z-index: 1000 so fixed nav stays above <main> (otherwise main steals clicks)"
  );
  assert.match(
    styleCss,
    /main,\s*\n\.site-footer\s*\{[^}]*z-index:\s*0/s,
    "main/site-footer should use z-index: 0"
  );
}

function testLangToggle() {
  const window = makeWindow();
  const { documentElement } = window.document;

  assert.equal(documentElement.getAttribute("data-lang"), "en");

  window.document.querySelector('[data-set-lang="zh"]').click();
  assert.equal(documentElement.getAttribute("data-lang"), "zh");
  assert.equal(documentElement.lang, "zh-CN");

  window.document.querySelector('[data-set-lang="en"]').click();
  assert.equal(documentElement.getAttribute("data-lang"), "en");
  assert.equal(documentElement.lang, "en");
}

function testThemeToggle() {
  const window = makeWindow();
  const { documentElement } = window.document;

  assert.equal(documentElement.getAttribute("data-theme"), "dark");
  window.document.querySelector("[data-theme-toggle]").click();
  assert.equal(documentElement.getAttribute("data-theme"), "light");
  window.document.querySelector("[data-theme-toggle]").click();
  assert.equal(documentElement.getAttribute("data-theme"), "dark");
}

function testHeroLinksIntact() {
  const window = makeWindow();
  const ext = window.document.getElementById("hero-external");
  const hash = window.document.getElementById("hero-hash");
  assert.equal(ext.getAttribute("href"), "https://example.com/out");
  assert.equal(hash.getAttribute("href"), "#resume");
}

function run() {
  testCssNavbarAboveMain();
  testLangToggle();
  testThemeToggle();
  testHeroLinksIntact();
  console.log("OK: site-interaction.test.mjs — 4 groups passed");
}

run();
