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
  await page
    .getByRole("heading", {
      name:
        button === "Preencher dia completo"
          ? "Atenção à meta do dia"
          : "Streak de 7 dias!",
    })
    .waitFor();
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
  assert(
    (await page.locator(".home-banner.calorie-warning").innerText()).includes(
      "400 kcal acima da meta de 2.000 kcal",
    ),
  );
  const attentionMascot = page.locator(
    '.home-banner img[src="/assets/attention-buddy.svg"]',
  );
  await attentionMascot.evaluate((image) => image.decode());
  assert(await attentionMascot.evaluate((image) => image.naturalWidth > 0));

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
  const recordIcons = await page
    .locator(".today-record-icon svg")
    .evaluateAll((icons) => icons.map((icon) => icon.outerHTML));
  assert.equal(recordIcons.length, 9);
  assert.equal(
    new Set(recordIcons).size,
    9,
    "Full-day records should have distinct, relevant icons",
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
  assert(
    (await page.locator(".home-banner.calorie-warning").innerText()).includes(
      "116 kcal acima",
    ),
  );

  await page.getByRole("button", { name: "Perfil", exact: true }).click();
  await page.getByRole("heading", { name: "Marina", exact: true }).waitFor();
  assert((await page.locator(".profile-month").innerText()).includes("5"));
  // Exercise calories do not hide the warning. At the gross intake limit it clears;
  // a one-kcal increase above that limit restores it.
  await page.getByRole("button", { name: "Diário", exact: true }).click();
  await page
    .getByRole("button", { name: "Editar Ovos, aveia e banana", exact: true })
    .click();
  await page.getByLabel("Energia (kcal)").fill("274");
  await page
    .getByRole("button", { name: "Salvar alterações", exact: true })
    .click();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  assert.equal(await page.locator(".home-banner.calorie-warning").count(), 0);
  assert.equal(
    await page
      .locator('.home-banner img[src="/assets/streak-buddy.svg"]')
      .count(),
    1,
  );
  await page.getByRole("button", { name: "Diário", exact: true }).click();
  await page
    .getByRole("button", { name: "Editar Ovos, aveia e banana", exact: true })
    .click();
  await page.getByLabel("Energia (kcal)").fill("275");
  await page
    .getByRole("button", { name: "Salvar alterações", exact: true })
    .click();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  assert(
    (await page.locator(".home-banner.calorie-warning").innerText()).includes(
      "1 kcal acima",
    ),
  );
  // Net excess must be positive, red and explicit in the ring and equation.
  await page.getByRole("button", { name: "Adicionar alimentos", exact: true }).click();
  await page.getByLabel("Alimento ou refeição").fill("Teste de excesso");
  await page.getByLabel("Energia (kcal)").fill("500");
  await page.getByRole("button", { name: "Adicionar registro", exact: true }).click();
  assert.equal(await page.locator(".ring strong").innerText(), "101");
  assert.equal(await page.locator(".ring small").innerText(), "kcal a mais");
  assert.equal(await page.locator(".daily-equation strong").innerText(), "101 kcal a mais");
  for (const selector of [".ring strong", ".daily-equation strong"])
    assert.equal(await page.locator(selector).evaluate(e => getComputedStyle(e).color), "rgb(190, 31, 76)");
  await page.getByRole("button", { name: "Diário", exact: true }).click();
  await page.getByRole("button", { name: "Excluir Teste de excesso", exact: true }).click();
  await page.getByRole("button", { name: "Sim, excluir", exact: true }).click();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  assert.equal(await page.locator(".ring strong").innerText(), "399");
  assert.equal(await page.locator(".ring small").innerText(), "kcal restantes");
  assert.equal(await page.locator(".ring.calorie-excess").count(), 0);
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
