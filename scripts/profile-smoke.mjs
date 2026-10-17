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
  await p.getByRole("button", { name: "Perfil", exact: true }).click();
  await p.getByRole("heading", { name: "João", exact: true }).waitFor();
  const character = await p.locator(".profile-banner-art").getAttribute("data-character");
  assert(["blue", "red"].includes(character));
  await p.locator(".profile-banner-art").evaluate(image => image.decode());
  assert(
    (await p.locator(".profile-badges").innerText()).includes(
      "NÍVEL 3 / COLECIONADOR",
    ),
  );
  assert((await p.locator(".profile-journey").innerText()).includes("78 kg"));
  assert.equal(
    await p.locator(".profile-month>div").nth(2).locator("strong").innerText(),
    "2",
  );
  await p.screenshot({
    path: "/workspace/artifacts/fitin-perfil-mobile.png",
    fullPage: true,
  });
  await p.getByRole("button", { name: "Registrar peso de hoje" }).click();
  await p.getByLabel("Peso (kg)", { exact: true }).fill("77.5");
  await p.getByRole("button", { name: "Salvar registro" }).click();
  await p.getByRole("button", { name: "Perfil", exact: true }).click();
  assert((await p.locator(".profile-journey").innerText()).includes("77,5 kg"));
  await p.getByRole("button", { name: /Metas de peso e nutrição/ }).click();
  await p
    .getByRole("button", { name: "Definir meta de peso", exact: true })
    .click();
  await p.getByLabel("Peso (kg)", { exact: true }).fill("72");
  await p.getByRole("button", { name: "Salvar registro" }).click();
  await p.getByRole("button", { name: "Perfil", exact: true }).click();
  assert((await p.locator(".profile-journey").innerText()).includes("72 kg"));
  await p.getByRole("button", { name: /Configurações da conta/ }).click();
  await p.getByLabel("Seu nome", { exact: true }).fill("João Silva");
  await p.getByLabel("E-mail", { exact: true }).fill("joao@example.com");
  await p.getByRole("button", { name: "Salvar dados" }).click();
  await p.getByRole("heading", { name: "João Silva", exact: true }).waitFor();
  assert.equal(await p.locator(".profile-avatar").innerText(), "JS");
  assert.equal(await p.locator(".profile-banner-art").getAttribute("data-character"), character);
  await p.getByRole("button", { name: /Ajuda e suporte/ }).click();
  await p.getByText("Meus dados ficam salvos?", { exact: true }).click();
  await p
    .getByText("Os registros ficam somente nesta sessão.", { exact: false })
    .waitFor();
  await p.getByRole("button", { name: "Ver todas", exact: true }).click();
  await p.getByRole("heading", { name: "Conquistas", exact: true }).waitFor();
  await p.getByRole("button", { name: "Perfil", exact: true }).click();
  for (const width of [320, 390, 800, 1440]) {
    await p.setViewportSize({ width, height: 1000 });
    assert.equal(
      await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
      `width ${width}`,
    );
  }
  await p.screenshot({
    path: "/workspace/artifacts/fitin-perfil-desktop.png",
    fullPage: true,
  });
  await p.getByRole("button", { name: "Sair e limpar demonstração" }).click();
  await p.getByRole("button", { name: "Entrar", exact: true }).click();
  await p.getByRole("button", { name: "Preencher dia completo", exact: true }).click();
  await p.getByRole("button", { name: "Entrar", exact: true }).click();
  await p.getByRole("button", { name: "Perfil", exact: true }).click();
  await p.getByRole("heading", { name: "Marina", exact: true }).waitFor();
  const femaleCharacter = await p.locator(".profile-banner-art").getAttribute("data-character");
  assert(["pink", "purple"].includes(femaleCharacter));
  await p.locator(".profile-banner-art").evaluate(image => image.decode());
  assert(await p.locator(".profile-banner-art").evaluate(image => image.naturalWidth > 0));
  for (const width of [390, 1440]) {
    await p.setViewportSize({width, height:1000});
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth > innerWidth),false);
    await p.screenshot({path:`/workspace/artifacts/fitin-marina-profile-${width}.png`,fullPage:true});
  }
  await p.getByRole("button", { name: "Conquistas", exact: true }).click();
  assert.equal(await p.locator(".home-body > header .logo").isVisible(),false);
  assert.equal(await p.locator(".nav-brand .logo").isVisible(),true);
  await p.screenshot({path:"/workspace/artifacts/fitin-achievements-header-desktop.png",fullPage:true});
  await p.setViewportSize({width:390,height:844});
  assert.equal(await p.locator(".home-body > header .logo").isVisible(),true);
  await p.getByRole("button", { name: "Perfil", exact: true }).click();
  assert.equal(await p.locator(".profile-banner-art").getAttribute("data-character"),femaleCharacter);
  console.log(
    "PASS: perfil, medalhas coerentes, registro de peso, meta, edição de conta local, ajuda, atalhos, logout e layouts mobile/desktop.",
  );
} finally {
  await b.close();
}
