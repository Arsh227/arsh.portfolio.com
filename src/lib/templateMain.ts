import fs from "node:fs";
import path from "node:path";

type TemplateKey = "home" | "ux-ui" | "game-design" | "coding-experience" | "web" | "graphic-design" | "jarvis-ai" | "crm-system";

const ROUTE_TO_TEMPLATE_FILE: Record<TemplateKey, string> = {
  home: "index.html",
  "ux-ui": "UX-UI.html",
  "game-design": "game design.html",
  "coding-experience": "coding-experience.html",
  web: "web.html",
  "graphic-design": "graphic-design.html",
  "jarvis-ai": "jarvis-ai.html",
  "crm-system": "crm-system.html",
};

const LINK_REWRITES: Array<[from: string, to: string]> = [
  ["href=\"UX-UI.html\"", "href=\"/ux-ui\""],
  ["href=\"game design.html\"", "href=\"/game-design\""],
  ["href=\"coding-experience.html\"", "href=\"/coding-experience\""],
  ["href=\"web.html\"", "href=\"/web\""],
  ["href=\"graphic-design.html\"", "href=\"/graphic-design\""],
  ["href=\"jarvis-ai.html\"", "href=\"/jarvis-ai\""],
  ["href=\"crm-system.html\"", "href=\"/crm-system\""],
];

function extractMainHtml(templateHtml: string) {
  const mainStart = templateHtml.indexOf("<main");
  const mainEnd = templateHtml.lastIndexOf("</main>");
  if (mainStart === -1 || mainEnd === -1) {
    return "";
  }
  return templateHtml.slice(mainStart, mainEnd + "</main>".length);
}

function normalizeTemplateMainHtml(mainHtml: string) {
  let out = mainHtml;

  // Make asset paths route-safe (e.g. "./assets/..." -> "/assets/...")
  out = out.replaceAll("./assets/", "/assets/");

  // Fix internal page links to Next routes.
  for (const [from, to] of LINK_REWRITES) {
    out = out.replaceAll(from, to);
  }

  return out;
}

export function getTemplateMainHtml(key: TemplateKey) {
  const fileName = ROUTE_TO_TEMPLATE_FILE[key];
  const templatePath = path.join(process.cwd(), fileName);
  const html = fs.readFileSync(templatePath, "utf8");
  const main = extractMainHtml(html);
  return normalizeTemplateMainHtml(main);
}

export type { TemplateKey };

