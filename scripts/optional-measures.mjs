import { chromium } from "playwright";
import assert from "node:assert/strict";
const b = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
try {
  await p.goto(process.env.BASE_URL || "http://localhost:5200");
  await p.getByRole("button", { name: "Cadastre-se", exact: true }).click();
  for (const [label, v] of [
    ["E-mail", "demo@example.com"],
    ["Data de nascimento", "1995-03-15"],
    ["Senha", "fitin123"],
    ["Confirmar senha", "fitin123"],
  ])
    await p.getByLabel(label, { exact: true }).fill(v);
  await p.getByRole("button", { name: "Próximo", exact: true }).click();
  await p.getByLabel("Seu nome").fill("Teste");
  await p.getByRole("button", { name: "Outro", exact: true }).click();
  await p.getByRole("button", { name: "Próximo", exact: true }).click();
  const age = p.getByLabel("Idade", { exact: true });
  assert(Number(await age.inputValue()) > 0);
  await age.fill("0");
  await p
    .getByRole("button", { name: "Informar todas as medidas depois" })
    .click();
  await p.getByRole("button", { name: "Próximo", exact: true }).click();
  await p.getByText("Informe uma idade válida.").waitFor();
  await age.fill("28");
  await p
    .getByRole("button", { name: "Informar agora: Peso (kg)", exact: true })
    .click();
  assert.equal(
    await p.getByLabel("Peso (kg)", { exact: true }).isDisabled(),
    false,
  );
  await p.getByLabel("Peso (kg)", { exact: true }).fill("-2");
  await p.getByRole("button", { name: "Próximo", exact: true }).click();
  await p.getByText("Informe uma medida válida.", { exact: true }).waitFor();
  await p
    .getByRole("button", { name: "Informar depois: Peso (kg)", exact: true })
    .click();
  assert.equal(
    await p.getByLabel("Peso (kg)", { exact: true }).inputValue(),
    "",
  );
  await p.screenshot({
    path: "/workspace/artifacts/fitin-medidas-opcionais.png",
    fullPage: true,
  });
  assert.equal(
    await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    false,
  );
  await p.getByRole("button", { name: "Voltar à etapa anterior" }).click();
  await p.getByRole("button", { name: "Voltar à etapa anterior" }).click();
  const birth = await p.getByLabel("Data de nascimento").inputValue();
  const today = new Date(),
    d = new Date(birth + "T12:00:00");
  assert.equal(
    today.getFullYear() -
      d.getFullYear() -
      (today < new Date(today.getFullYear(), d.getMonth(), d.getDate())
        ? 1
        : 0),
    28,
  );
  await p.getByRole("button", { name: "Próximo", exact: true }).click();
  await p.getByRole("button", { name: "Próximo", exact: true }).click();
  assert.equal(await age.inputValue(), "28");
  for (const label of [
    "Peso (kg)",
    "Altura (cm)",
    "Pescoço (cm)",
    "Cintura (cm)",
    "Quadril (cm)",
  ])
    assert.equal(await p.getByLabel(label, { exact: true }).isDisabled(), true);
  await p.getByRole("button", { name: "Próximo", exact: true }).click();
  await p.getByRole("button", { name: /^Leve/ }).click();
  await p.getByRole("button", { name: "Próximo", exact: true }).click();
  await p.getByRole("button", { name: /^Manter peso/ }).click();
  await p.getByRole("button", { name: "Calcular meu plano!" }).click();
  await p.getByRole("button", { name: "Avançar", exact: true }).waitFor();
  assert.equal(await p.locator(".stat.purple strong").innerText(), "—");
  await p.getByRole("button", { name: "Avançar", exact: true }).click();
  for (const name of [
    "Ver como fica o dia",
    "Continuar",
    "Quero ajustar o ritmo",
    "Bora começar",
  ])
    await p.getByRole("button", { name, exact: true }).click();
  await p.getByRole("button", { name: "Conquistas", exact: true }).click();
  assert.equal(
    await p.locator(".ach-stats>div").nth(0).locator("strong").innerText(),
    "0/36",
  );
  assert.equal(
    await p.locator(".ach-stats>div").nth(1).locator("strong").innerText(),
    "0",
  );
  await p.getByRole("button", { name: "Home", exact: true }).click();
  await p
    .getByRole("button", { name: "Adicionar alimentos", exact: true })
    .click();
  await p.getByLabel("Alimento ou refeição").fill("Primeira refeição");
  await p.getByLabel("Energia (kcal)").fill("500");
  await p.getByRole("button", { name: "Adicionar registro" }).click();
  await p.getByRole("button", { name: "Conquistas", exact: true }).click();
  assert.equal(
    await p.locator(".ach-stats>div").nth(0).locator("strong").innerText(),
    "3/36",
  );
  assert.equal(
    await p.locator(".ach-stats>div").nth(1).locator("strong").innerText(),
    "75",
  );
  console.log(
    "PASS: idade editável e sincronizada, validação, medidas adiáveis individualmente/em conjunto, navegação preserva escolhas e IMC ausente sem medidas.",
  );
} finally {
  await b.close();
}
