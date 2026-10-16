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
    "13/36",
  );
  assert.equal(
    await p.locator(".ach-stats>div").nth(1).locator("strong").innerText(),
    "525",
  );
  assert.equal(await p.locator(".medal-card").count(), 6);
  const medalSources = await p
    .locator(".medal-card .medal-art img")
    .evaluateAll((images) => images.map((img) => img.getAttribute("src")));
  assert(medalSources.some((src) => src.includes("medallion-")));
  assert(medalSources.some((src) => src === "/assets/medal-pink.png"));
  const previewButton = p.getByRole("button", {
    name: "Ver todas as medalhas 36",
    exact: true,
  });
  await previewButton.click();
  const catalog = p.getByRole("dialog", {
    name: "Todas as medalhas",
    exact: true,
  });
  await catalog.waitFor();
  assert.equal(await catalog.locator(".catalog-design").count(), 12);
  assert.equal(await catalog.locator(".catalog-medal").count(), 36);
  for (const design of await catalog.locator(".catalog-design").all()) {
    const awards = design.locator(".catalog-medal");
    assert.equal(await awards.count(), 3);
    assert.equal(new Set(await awards.locator("h4").allTextContents()).size, 3);
    assert.equal(
      new Set(
        await awards
          .locator("img")
          .evaluateAll((images) =>
            images.map((img) => img.getAttribute("src")),
          ),
      ).size,
      1,
    );
    assert.equal(
      new Set(
        await awards.evaluateAll((items) =>
          items.map((item) => getComputedStyle(item).background),
        ),
      ).size,
      3,
    );
  }
  // Eagerly load the catalog for the asset check, including initially offscreen groups.
  await catalog.locator("img").evaluateAll((images) =>
    Promise.all(
      images.map((img) => {
        img.loading = "eager";
        return img.decode();
      }),
    ),
  );
  await catalog.getByRole("button", { name: "Medalhas", exact: true }).click();
  assert.equal(await catalog.locator(".catalog-design").count(), 6);
  await catalog.getByLabel("Acabamento", { exact: true }).selectOption("green");
  assert.equal(await catalog.locator(".catalog-medal").count(), 3);
  assert(
    (
      await catalog.locator(".catalog-design-art img").getAttribute("src")
    ).includes("medallion-green.png"),
  );
  await catalog.getByRole("button", { name: "Halteres", exact: true }).click();
  assert.equal(await catalog.locator(".catalog-medal").count(), 3);
  assert.equal(
    await catalog.locator(".catalog-design-art img").getAttribute("src"),
    "/assets/medal-green.png",
  );
  await catalog.getByRole("button", { name: "Todas", exact: true }).click();
  await catalog.getByLabel("Acabamento", { exact: true }).selectOption("Todas");
  await catalog
    .getByRole("searchbox", { name: "Buscar medalhas" })
    .fill("Constância cristalina");
  assert.equal(await catalog.locator(".catalog-design").count(), 1);
  await catalog
    .getByRole("searchbox", { name: "Buscar medalhas" })
    .fill("sem resultado algum");
  assert.equal(await catalog.locator(".catalog-design").count(), 0);
  await catalog.getByRole("searchbox", { name: "Buscar medalhas" }).fill("");
  assert.equal(await p.evaluate(() => document.body.style.overflow), "hidden");
  await p.screenshot({ path: "/workspace/artifacts/fitin-catalog-mobile.png" });
  await p.setViewportSize({ width: 1440, height: 1000 });
  await p.screenshot({
    path: "/workspace/artifacts/fitin-catalog-desktop.png",
  });
  await catalog.getByRole("button", { name: "Fechar catálogo" }).focus();
  await p.keyboard.press("Shift+Tab");
  assert(
    await catalog
      .getByLabel("Acabamento", { exact: true })
      .evaluate((e) => e === document.activeElement),
  );
  await p.keyboard.press("Tab");
  assert(
    await catalog
      .getByRole("button", { name: "Fechar catálogo" })
      .evaluate((e) => e === document.activeElement),
  );
  await p.keyboard.press("Escape");
  assert.equal(await p.getByRole("dialog").count(), 0);
  assert(await previewButton.evaluate((e) => e === document.activeElement));
  assert.notEqual(
    await p.evaluate(() => document.body.style.overflow),
    "hidden",
  );
  await p.setViewportSize({ width: 390, height: 844 });
  await previewButton.click();
  await p.getByRole("button", { name: "Fechar catálogo" }).click();
  assert.equal(await p.getByRole("dialog").count(), 0);
  assert.equal(
    new Set(
      await p
        .locator(".challenge-option .challenge-illustration")
        .evaluateAll((images) => images.map((img) => img.getAttribute("src"))),
    ).size,
    4,
  );
  for (const img of await p
    .locator(".challenge-option .challenge-illustration")
    .all()) {
    await img.scrollIntoViewIfNeeded();
    assert(await img.evaluate((e) => e.complete && e.naturalWidth > 0));
  }

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
  await p.evaluate(async () => {
    const { achievementSummary, medalAsset } = await import(
      "/src/medalCollection.ts"
    );
    const { localDay } = await import("/src/records.ts");
    const today = localDay();
    const history = { days: 0, meals: 0, burned: 0 };
    const workouts = Array.from({ length: 4 }, (_, i) => ({
      id: String(i),
      name: "Caminhada",
      date: today,
      time: "12:00",
      kcal: 100,
    }));
    const result = achievementSummary(0, 0, 400, history, {
      foods: [],
      workouts,
    });
    if (
      result.medals.length !== 36 ||
      new Set(result.medals.map((medal) => medal.name)).size !== 36
    )
      throw new Error("Each award must have a unique name");
    const green = result.medals.filter(
      (medal) => medal.design === "green-movement",
    );
    if (
      green.length !== 3 ||
      new Set(green.map((medal) => medalAsset(medal.metal, true, medal.kind)))
        .size !== 1
    )
      throw new Error("Shared artwork lost");
    if (green.filter((medal) => medal.current >= medal.target).length !== 1)
      throw new Error("Awards must unlock independently");
    if (
      result.xp !== 125 ||
      achievementSummary(0, 0, 400, history, { foods: [], workouts }).xp !== 125
    )
      throw new Error("XP duplicated or incorrect");
    if (
      achievementSummary(0, 0, 0, history, { foods: [], workouts: [] }).earned
        .length !== 0
    )
      throw new Error("Empty session received awards");
    const future = [{ ...workouts[0], date: "2099-01-01" }];
    if (
      achievementSummary(0, 0, 100, history, { foods: [], workouts: future })
        .earned.length !== 0
    )
      throw new Error("Future entry awarded a medal");
  });
  // Validate calendar boundaries and deduplication against the actual browser module.
  await p.evaluate(async () => {
    const { weeklyProgress, challengeWeek } = await import(
      "/src/weeklyChallenges.ts"
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
  assert.equal(await p.locator(".medal-card").count(), 6);
  await p.getByRole("button", { name: "Em progresso", exact: true }).click();
  assert.equal(await p.locator(".medal-card").count(), 6);
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
    "14/36",
  );
  assert.equal(
    await p.locator(".ach-stats>div").nth(1).locator("strong").innerText(),
    "625",
  );
  await p.getByRole("button", { name: /Grande energia, conquistada/ }).click();
  await p.keyboard.press("Escape");
  assert.equal(
    await p.locator(".ach-stats>div").nth(1).locator("strong").innerText(),
    "625",
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
  assert.equal(
    await p.locator(".profile-medal-list .mini-medal img").count(),
    3,
  );
  await p.getByRole("button", { name: "Sair e limpar demonstração" }).click();
  await p.getByRole("button", { name: "Entrar", exact: true }).click();
  await p.getByRole("button", { name: "Preencher dados" }).click();
  await p.getByRole("button", { name: "Entrar", exact: true }).click();
  await p.getByRole("heading", { name: "Streak de 7 dias!" }).waitFor();
  await p.getByRole("button", { name: "Conquistas", exact: true }).click();
  assert.equal(await p.locator(".active-challenge").count(), 0);
  console.log(
    "PASS: catálogo com 36 medalhas independentes, artes compartilhadas e fundos próprios, filtros, acessibilidade, desbloqueio e XP únicos, desafios semanais e layouts mobile/desktop.",
  );
} finally {
  await b.close();
}
