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
  assert.equal(await p.locator(".challenge-option").count(), 4);
  await p
    .getByRole("button", { name: "Explorar desafios", exact: true })
    .click();
  assert.equal(
    await p
      .locator("#weekly-challenges-title")
      .evaluate((e) => e === document.activeElement),
    true,
  );
  for (const name of [
    "Mesa em dia",
    "Movimento na rotina",
    "Um momento para acompanhar",
    "Pequenos passos",
  ]) {
    await p
      .getByRole("button", { name: `Participar de ${name}`, exact: true })
      .click();
  }
  assert.equal(await p.locator(".active-challenge").count(), 4);
  assert.equal(
    await p
      .getByRole("progressbar", {
        name: "Progresso: Movimento na rotina",
        exact: true,
      })
      .getAttribute("aria-valuenow"),
    "1",
  );
  assert.equal(
    await p
      .getByRole("progressbar", { name: "Progresso: Mesa em dia", exact: true })
      .getAttribute("aria-valuenow"),
    "1",
  );
  assert.equal(
    await p
      .getByRole("progressbar", {
        name: "Progresso: Pequenos passos",
        exact: true,
      })
      .getAttribute("aria-valuenow"),
    "1",
  );
  await p
    .getByRole("button", { name: "Sair do desafio Mesa em dia", exact: true })
    .click();
  assert.equal(await p.locator(".active-challenge").count(), 3);
  await p
    .getByRole("button", { name: "Participar de Mesa em dia", exact: true })
    .click();
  assert.equal(await p.locator(".active-challenge").count(), 4);
  // Validate calendar boundaries and deduplication against the actual browser module.
  await p.evaluate(async () => {
    const { weeklyProgress, challengeWeek } = await import(
      "/src/challenges.ts"
    );
    const now = new Date(2026, 9, 14, 12);
    const record = (date, id) => ({
      date,
      id,
      name: "Teste",
      time: "12:00",
      kcal: 100,
    });
    const food = [
      record("2026-10-11", "past"),
      record("2026-10-12", "a"),
      record("2026-10-12", "b"),
      record("2026-10-14", "c"),
      record("2026-10-15", "future"),
    ];
    const workouts = [
      record("2026-10-13", "d"),
      record("2026-10-14", "e"),
      record("2026-10-19", "next"),
    ];
    const actual = weeklyProgress(
      food,
      workouts,
      [{ date: "2026-10-14", weight: 70 }],
      now,
    );
    if (
      JSON.stringify(actual) !==
      JSON.stringify({ meals: 2, activities: 2, weight: 1, days: 3 })
    )
      throw new Error("Incorrect weekly progress: " + JSON.stringify(actual));
    if (challengeWeek(new Date(2026, 9, 18, 12)).start !== "2026-10-12")
      throw new Error("Sunday week boundary");
    if (challengeWeek(new Date(2026, 9, 19, 12)).start !== "2026-10-19")
      throw new Error("Monday week boundary");
    if (weeklyProgress(food, workouts, [], new Date(2026, 9, 26)).days !== 0)
      throw new Error("Old week leaked");
    if (weeklyProgress([], [], [], now).weight !== 0)
      throw new Error("Empty records counted");
  });

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
  assert.equal(await p.locator(".active-challenge").count(), 4);
  const activityChallenge = p.getByRole("article", {
    name: "Movimento na rotina",
    exact: true,
  });
  assert((await activityChallenge.innerText()).includes("Selo conquistado"));
  assert.equal(
    await p
      .getByRole("progressbar", {
        name: "Progresso: Movimento na rotina",
        exact: true,
      })
      .getAttribute("aria-valuenow"),
    "2",
  );
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
  await p.getByRole("button", { name: "Perfil", exact: true }).click();
  await p.getByRole("button", { name: "Sair e limpar demonstração" }).click();
  await p.getByRole("button", { name: "Entrar", exact: true }).click();
  await p.getByRole("button", { name: "Preencher dados" }).click();
  await p.getByRole("button", { name: "Entrar", exact: true }).click();
  await p.getByRole("heading", { name: "Streak de 7 dias!" }).waitFor();
  await p.getByRole("button", { name: "Conquistas", exact: true }).click();
  assert.equal(await p.locator(".active-challenge").count(), 0);
  console.log(
    "PASS: desafios semanais, participação/saída, progresso compartilhado, limites de datas, limpeza da sessão, medalhas, XP sem duplicação e layouts mobile/desktop.",
  );
} finally {
  await b.close();
}
