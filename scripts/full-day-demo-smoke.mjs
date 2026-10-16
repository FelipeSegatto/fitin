import { chromium } from "playwright";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const login = async (button) => {
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.getByRole("button", { name: button, exact: true }).click();
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.getByRole("heading", { name: "Streak de 7 dias!" }).waitFor();
};
const logout = async () => {
  await page.getByRole("button", { name: "Perfil", exact: true }).click();
  await page
    .getByRole("button", { name: "Sair e limpar demonstração" })
    .click();
};
try {
  await page.goto(process.env.BASE_URL || "http://localhost:5200");
  await login("Preencher dia completo");
  assert.equal(await page.locator(".today-meals .today-record").count(), 6);
  assert.equal(await page.locator(".today-workouts .today-record").count(), 3);
  assert.equal(await page.locator(".ring strong").innerText(), "0");
  assert.deepEqual(
    await page.locator(".daily-values strong").allTextContents(),
    ["2.000 kcal", "2400 kcal", "400 kcal"],
  );
  assert.equal(
    new Set(
      await page
        .locator(".today-meals .today-record")
        .evaluateAll((cards) =>
          cards.map((card) => getComputedStyle(card).backgroundColor),
        ),
    ).size,
    6,
  );
  for (const width of [320, 390, 760, 1000, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `Overflow at ${width}`,
    );
    if (width === 390 || width === 1440)
      await page.screenshot({
        path: `/workspace/artifacts/fitin-full-day-${width}.png`,
        fullPage: true,
      });
  }
  await page.getByRole("button", { name: "Diário", exact: true }).click();
  assert.equal(
    await page.locator(".diary-entry:not(.entry-workout)").count(),
    6,
  );
  assert.equal(await page.locator(".diary-entry.entry-workout").count(), 3);
  assert.deepEqual(
    (await page.locator(".macro-item > strong").allTextContents()).map((text) =>
      text.trim(),
    ),
    ["140 g", "280 g", "80 g"],
  );
  await page
    .getByRole("button", {
      name: "Excluir Iogurte, aveia e castanhas",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "Sim, excluir", exact: true }).click();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  assert.equal(await page.locator(".today-meals .today-record").count(), 5);
  assert.equal(await page.locator(".ring strong").innerText(), "284");
  await page.getByRole("button", { name: "Perfil", exact: true }).click();
  await page.getByRole("heading", { name: "Marina", exact: true }).waitFor();
  assert((await page.locator(".profile-month").innerText()).includes("5"));
  await logout();
  await login("Preencher dados");
  assert.equal(await page.locator(".today-meals .today-record").count(), 2);
  assert.equal(await page.locator(".today-workouts .today-record").count(), 1);
  assert.equal(await page.locator(".ring strong").innerText(), "1.224");
  await page.getByRole("button", { name: "Perfil", exact: true }).click();
  await page.getByRole("heading", { name: "João", exact: true }).waitFor();
  await logout();
  await login("Preencher dia completo");
  assert.equal(await page.locator(".today-meals .today-record").count(), 6);
  assert.equal(await page.locator(".ring strong").innerText(), "0");
  assert.deepEqual(errors, []);
  console.log(
    "PASS: second demo, nine daily cards, six palette colors, calories/macros, shared diary edits, account isolation, repeatable seeding and responsive layouts.",
  );
} finally {
  await browser.close();
}
