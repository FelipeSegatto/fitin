import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";
const b = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
try {
  await p.goto(process.env.BASE_URL || "http://localhost:5200");
  await p.getByRole("button", { name: "Cadastre-se", exact: true }).click();
  await p.getByRole("button", { name: "Próximo", exact: true }).click();
  await p.getByText("Digite um e-mail válido.", { exact: true }).waitFor();
  await p.getByLabel("E-mail", { exact: true }).fill("joao@example.com");
  await p.getByLabel("Data de nascimento").fill("1995-03-15");
  await p.getByLabel("Senha", { exact: true }).fill("fitin123");
  await p.getByLabel("Confirmar senha", { exact: true }).fill("fitin123");
  await p.getByRole("button", { name: "Próximo", exact: true }).click();
  await p.getByLabel("Seu nome").fill("João Silva");
  await p.getByRole("button", { name: "Masculino", exact: true }).click();
  await p.getByRole("button", { name: "Próximo", exact: true }).click();
  for (const [label, v] of [
    ["Peso (kg)", "75"],
    ["Altura (cm)", "175"],
    ["Pescoço (cm)", "38"],
    ["Cintura (cm)", "84"],
    ["Quadril (cm)", "98"],
  ])
    await p.getByLabel(label, { exact: true }).fill(v);
  await p.getByRole("button", { name: "Próximo", exact: true }).click();
  await p.getByRole("button", { name: /^Moderado/ }).click();
  await p.getByRole("button", { name: "Próximo", exact: true }).click();
  await p.getByRole("button", { name: /^Emagrecer/ }).click();
  await p.getByRole("button", { name: "Calcular meu plano!" }).click();
  await p.getByRole("button", { name: "Avançar", exact: true }).waitFor();
  await p.getByRole("button", { name: "Avançar", exact: true }).click();
  await p.getByRole("button", { name: "Ver como fica o dia" }).click();
  await p.getByRole("button", { name: "Continuar", exact: true }).click();
  await p.getByRole("button", { name: "Quero ajustar o ritmo" }).click();
  await p.getByRole("slider", { name: "Ritmo semanal" }).fill("0.4");
  const target = await p.locator(".calorie>strong").innerText();
  await p.getByRole("button", { name: "Bora começar" }).click();
  assert(
    (await p.locator(".card-title").innerText()).includes(
      target.replace(" kcal", "").trim(),
    ),
  );
  await p
    .getByRole("button", { name: "Adicionar alimentos", exact: true })
    .click();
  await p.getByLabel("Alimento ou refeição").fill("Almoço");
  await p.getByLabel("Energia (kcal)").fill("450");
  await p.getByRole("button", { name: "Adicionar registro" }).click();
  await p.getByText("Almoço", { exact: false }).waitFor();
  await p
    .getByRole("button", { name: "Adicionar atividades", exact: true })
    .click();
  await p.getByLabel("Atividade", { exact: true }).fill("Caminhada");
  await p.getByLabel("Energia (kcal)").fill("150");
  await p.getByRole("button", { name: "Adicionar registro" }).click();
  const goal = Number(target.replace(/[^0-9]/g, ""));
  assert.equal(
    await p.locator(".ring strong").innerText(),
    (goal - 450).toLocaleString("pt-BR"),
  );
  assert.equal(
    await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    false,
  );
  fs.mkdirSync("/workspace/artifacts", { recursive: true });
  await p.screenshot({
    path: "/workspace/artifacts/fitin-home-mobile.png",
    fullPage: true,
  });
  for (const tab of ["Diário", "Progresso", "Conquistas", "Perfil"])
    await p.getByRole("button", { name: tab, exact: true }).click();
  await p.getByRole("button", { name: "Sair e limpar demonstração" }).click();
  await p.getByRole("button", { name: "Entrar", exact: true }).click();
  await p.getByRole("button", { name: "Preencher dados" }).click();
  await p.getByRole("button", { name: "Entrar", exact: true }).click();
  await p.getByRole("heading", { name: "Streak de 7 dias!" }).waitFor();
  assert.equal(await p.locator(".ring strong").innerText(), "1.074");
  assert((await p.locator(".daily-values").innerText()).includes("926 kcal"));
  assert((await p.locator(".daily-values").innerText()).includes("150 kcal"));
  await p.setViewportSize({ width: 1440, height: 1000 });
  await p.screenshot({
    path: "/workspace/artifacts/fitin-home-desktop.png",
    fullPage: true,
  });
  assert.equal(
    await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    false,
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: validação, 5 etapas, plano/slider consistente, refeições/atividades, navegação, limpeza da sessão, login demonstrativo, mobile e desktop.",
  );
} catch (e) {
  await p.screenshot({ path: "/tmp/fitin-smoke-failure.png", fullPage: true });
  throw e;
} finally {
  await b.close();
}
