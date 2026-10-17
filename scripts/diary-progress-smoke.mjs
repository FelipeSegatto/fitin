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
  assert.equal(
    await p
      .locator(".daily-values strong")
      .first()
      .evaluate((e) => getComputedStyle(e).fontSize),
    "11px",
  );
  await p.getByRole("button", { name: "Diário", exact: true }).click();
  assert.equal(
    await p.locator(".macro-item").first().locator("strong").innerText(),
    "58 g",
  );
  assert.equal(await p.locator(".diary-entry").count(), 3);
  await p
    .getByRole("button", {
      name: "Editar Pão integral, ovos e fruta",
      exact: true,
    })
    .click();
  await p.getByLabel("Energia (kcal)").fill("400");
  await p.getByLabel("Proteínas (g)").fill("25");
  await p.getByRole("button", { name: "Salvar alterações" }).click();
  assert.equal(
    await p.locator(".macro-item").first().locator("strong").innerText(),
    "63 g",
  );
  await p.getByRole("button", { name: "Home", exact: true }).click();
  assert.equal(await p.locator(".ring strong").innerText(), "-1.194");
  await p.getByRole("button", { name: "Diário", exact: true }).click();
  await p
    .getByRole("button", {
      name: "Excluir Arroz, frango e acompanhamentos",
      exact: true,
    })
    .click();
  await p.getByRole("button", { name: "Sim, excluir", exact: true }).click();
  assert.equal(
    await p.locator(".macro-item").first().locator("strong").innerText(),
    "25 g",
  );
  await p.getByRole("button", { name: "Dia anterior", exact: true }).click();
  await p.getByText("Nenhuma refeição registrada neste dia.").waitFor();
  await p.getByRole("button", { name: "Registrar primeira refeição" }).click();
  await p.getByLabel("Alimento ou refeição").fill("Iogurte");
  await p.getByLabel("Energia (kcal)").fill("100");
  await p.getByRole("button", { name: "Adicionar registro" }).click();
  assert.equal(
    await p.locator(".macro-item").first().locator("strong").innerText(),
    "—",
  );
  await p
    .getByText("Algumas refeições estão sem macros.", { exact: false })
    .waitFor();
  await p.getByRole("button", { name: "Próximo dia", exact: true }).click();
  await p.evaluate(() => scrollTo(0, 0));
  await p.screenshot({
    path: "/workspace/artifacts/fitin-diario-mobile.png",
    fullPage: true,
  });
  assert.equal(
    await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    false,
  );
  await p.getByRole("button", { name: "Home", exact: true }).click();
  assert.equal(await p.locator(".ring strong").innerText(), "-1.750");
  await p.getByRole("button", { name: "Progresso", exact: true }).click();
  await p.getByRole("heading", { name: "Seu progresso" }).waitFor();
  assert(
    (await p.locator(".progress-metrics>div").nth(1).innerText()).includes(
      "250",
    ),
  );
  await p.screenshot({
    path: "/workspace/artifacts/fitin-progresso-mobile.png",
    fullPage: true,
  });
  await p.getByRole("button", { name: "Registrar", exact: true }).click();
  await p.getByLabel("Peso (kg)", { exact: true }).fill("77.8");
  await p.getByRole("button", { name: "Salvar registro" }).click();
  assert((await p.locator(".current-plan").innerText()).includes("77,8 kg"));
  await p.getByRole("button", { name: "Histórico", exact: true }).click();
  assert.equal(await p.locator(".weight-history-row").count(), 6);
  assert(
    (await p.locator(".weight-history-row").first().innerText()).includes(
      "77,8 kg",
    ),
  );
  await p.getByRole("button", { name: "Hábitos", exact: true }).click();
  await p.getByRole("button", { name: "Registrar passos" }).click();
  await p.getByLabel("Passos", { exact: true }).fill("9000");
  await p.getByRole("button", { name: "Salvar registro" }).click();
  await p.getByRole("button", { name: "Resumo", exact: true }).click();
  assert(
    (await p.locator(".progress-metrics>div").nth(3).innerText()).includes(
      "9.000",
    ),
  );
  await p.setViewportSize({ width: 1440, height: 1000 });
  await p.screenshot({
    path: "/workspace/artifacts/fitin-progresso-desktop.png",
    fullPage: true,
  });
  await p.getByRole("button", { name: "Diário", exact: true }).click();
  await p.screenshot({
    path: "/workspace/artifacts/fitin-diario-desktop.png",
    fullPage: true,
  });
  await p.getByRole("button", { name: "Home", exact: true }).click();
  assert.equal(
    await p
      .locator(".daily-values strong")
      .first()
      .evaluate((e) => getComputedStyle(e).fontSize),
    "19px",
  );
  assert.equal(
    await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    false,
  );
  console.log(
    "PASS: macros reais/ausentes, edição e exclusão sincronizadas, registros por dia, médias no Progresso, peso/passos/histórico e fonte ampliada somente no desktop.",
  );
} finally {
  await b.close();
}
