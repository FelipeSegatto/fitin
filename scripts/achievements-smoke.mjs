import { chromium } from "playwright";
import assert from "node:assert/strict";
const b = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
try {
  await p.goto(process.env.BASE_URL || "http://localhost:5200");
  await p.getByRole("button", { name: "Entrar", exact: true }).click();
  await p.getByRole("button", { name: "Preencher dados" }).click();
  await p.getByRole("button", { name: "Entrar", exact: true }).click();
  await p.getByRole("heading", { name: "Streak de 7 dias!" }).waitFor();
  await p.getByRole("button", { name: "Conquistas", exact: true }).click();
  await p.getByRole("heading", { name: "Conquistas", exact: true }).waitFor();
  assert.equal(
    await p.locator(".ach-stats>div").nth(0).locator("strong").innerText(),
    "4/6",
  );
  assert.equal(
    await p.locator(".ach-stats>div").nth(1).locator("strong").innerText(),
    "450",
  );
  assert.equal(await p.locator(".medal-card").count(), 6);
  assert.equal(await p.locator(".week-days .today.done").count(), 1);
  for (const img of await p.locator(".medal-art img").all()) {
    await img.scrollIntoViewIfNeeded();
    assert(await img.evaluate((e) => e.complete && e.naturalWidth > 0));
  }
  await p.getByRole("button", { name: "Conquistadas", exact: true }).click();
  assert.equal(await p.locator(".medal-card").count(), 4);
  await p.getByRole("button", { name: "Em progresso", exact: true }).click();
  assert.equal(await p.locator(".medal-card").count(), 2);
  await p.getByRole("button", { name: /Grande energia, / }).click();
  await p.getByRole("dialog").waitFor();
  assert((await p.getByRole("dialog").innerText()).includes("6.400 de 10.000"));
  await p.keyboard.press("Escape");
  assert.equal(await p.getByRole("dialog").count(), 0);
  await p.getByRole("button", { name: "Todas", exact: true }).click();
  await p.screenshot({
    path: "/workspace/artifacts/fitin-conquistas-mobile.png",
    fullPage: true,
  });
  assert.equal(
    await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    false,
  );
  await p.getByRole("button", { name: "Home", exact: true }).click();
  await p
    .getByRole("button", { name: "Adicionar atividades", exact: true })
    .click();
  await p
    .getByLabel("Atividade", { exact: true })
    .fill("Atividade demonstrativa");
  await p.getByLabel("Energia (kcal)").fill("3600");
  await p.getByRole("button", { name: "Adicionar registro" }).click();
  await p.getByRole("button", { name: "Conquistas", exact: true }).click();
  assert.equal(
    await p.locator(".ach-stats>div").nth(0).locator("strong").innerText(),
    "5/6",
  );
  assert.equal(
    await p.locator(".ach-stats>div").nth(1).locator("strong").innerText(),
    "750",
  );
  await p.getByRole("button", { name: /Grande energia, conquistada/ }).click();
  await p.keyboard.press("Escape");
  assert.equal(
    await p.locator(".ach-stats>div").nth(1).locator("strong").innerText(),
    "750",
  );
  await p.setViewportSize({ width: 1440, height: 1000 });
  await p.screenshot({
    path: "/workspace/artifacts/fitin-conquistas-desktop.png",
    fullPage: true,
  });
  assert.equal(
    await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    false,
  );
  console.log(
    "PASS: medalhas vetoriais, XP coerente, filtros, detalhes, semana, desbloqueio dinâmico sem XP duplicado e layouts mobile/desktop.",
  );
} finally {
  await b.close();
}
