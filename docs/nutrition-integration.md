# Integração nutricional da demo

## Uso

Node 24, `npm ci`, `npm run dev`. Na home, abra **Adicionar alimentos → Buscar na base nutricional**. Escolha a fonte, pesquise, selecione o alimento e confirme a quantidade. `150 g de arroz cozido` e `0,25 l de leite` antecipam a porção. O usuário confirma preparo, produto e unidade; pratos, colheres e refeições com vários ingredientes ainda não são interpretados automaticamente. O registro manual permanece disponível.

- **TACO:** acervo local de 597 alimentos da 4ª edição (2011). Funciona sem rede. Não é API oficial nem consulta à TBCA.
- **Open Food Facts:** consulta externa para nomes de produtos ou códigos de barras. Dados colaborativos podem estar incompletos.
- **USDA FoodData Central:** consulta externa a Foundation/SR Legacy e produtos Branded. Use termos em inglês. O servidor usa a chave pública `DEMO_KEY` se não houver configuração; seus limites são baixos. Para chave própria, copie `.env.example` para `.env.local` e configure `USDA_API_KEY`, ou defina essa variável no host. Nunca use o prefixo `VITE_` para a chave.

As consultas externas dependem da rede, disponibilidade e cotas das fontes. O USDA foi validado ao vivo neste ambiente, inclusive em busca de whey pelo navegador, cálculo de porção e registro com atribuição. O Node 24 configura seu proxy a partir das variáveis HTTP_PROXY/HTTPS_PROXY quando presentes, respeitando NO_PROXY; sem proxy, as chamadas são diretas. Open Food Facts permanece sem validação ao vivo. Os testes automatizados de adaptadores usam respostas controladas; TACO foi exercitada com dados reais locais.

## Estrutura e contrato

`GET /api/nutrition/search?source=taco|off|usda&q=...` retorna contrato `version: 1`, candidatos normalizados, fonte, versão da fonte, unidade de referência e instante da consulta. Uma requisição consulta uma fonte escolhida; não há três chamadas por busca nem combinação silenciosa de bases.

1. `src/nutrition.ts`: extrai quantidade explícita e calcula porções, sem depender da interface.
2. `server/nutrition/providers.mjs`: adaptadores isolados por fonte; URLs fixas, timeout de oito segundos e mensagens de erro sem credenciais.
3. `server/nutrition/normalize.mjs`: contrato comum por 100 g ou 100 ml. Energia em kJ é convertida para kcal; nutrientes sem informação continuam `null`, não zero. Valores originais como `Tr`/`NA` da TACO são preservados em `qualifiers`.
4. `server/nutrition/service.mjs`: valida consulta, reúne consultas idênticas simultâneas e mantém cache por fonte por dez minutos, limitado a 200 entradas. Há intervalo mínimo entre chamadas externas por processo. Isso reduz chamadas na demo; não substitui cotas e controles distribuídos.
5. `src/FoodSearch.tsx`: consulta a API do próprio FitIn, cancela respostas obsoletas e pede confirmação da porção.
6. O registro guarda o candidato normalizado, identificador/URL/versão da fonte, quantidade e instante da consulta. Uma alteração manual do nome, energia ou macros remove essa associação. Alterar horário ou refeição a preserva.

O navegador não recebe a chave USDA. Login e registros continuam demonstrativos, em memória: recarregar limpa a sessão. Esta etapa não inclui banco, autenticação real, ingestão em lote, deduplicação entre fontes ou pipeline persistente.

## Execução e hospedagem

O plugin em `vite.config.ts` fornece a API tanto no desenvolvimento quanto em `npm run preview`. `api/nutrition/search.js` fornece um adaptador Node para Vercel; requer implantação de frontend e função juntos e Node 24. Essa implantação não foi validada neste ambiente. Hospedar somente `dist/` em um servidor estático não oferece a API: nesse caso, será necessário encaminhar `/api/nutrition/search` a um serviço Node.

## Evolução para backend e texto livre

O contrato permite migrar o serviço para um backend próprio mantendo a interface. Para escalar, o próximo passo é persistir candidatos e referências, adotar cache/limites compartilhados e cotas por usuário. Uma futura ingestão pode guardar respostas brutas por fonte/versão, validar unidades e preparação, gerar dados canônicos versionados e registrar erros/reprocessamento. O cache atual é temporário, por instância; em serverless ou réplicas seus limites não são globais.

Para texto livre, uma etapa anterior extrairá alimentos, quantidades e unidades, seguida por busca de candidatos e confirmação das ambiguidades. Uma frase como “comi arroz, feijão e um filé” exige separar itens e confirmar porções; não basta buscar a frase nem inventar macros. Conversão de medidas caseiras e equivalência entre alimentos dependem de dados próprios validados. Preservar a referência original evita perder rastreabilidade durante essa evolução.

Antes de abrir ao público: adicionar autenticação, limite de uso compartilhado, observabilidade, política de retenção e revisão das licenças para a estratégia de armazenamento e redistribuição escolhida.

## Fontes e atribuição

**TACO:** NEPA/UNICAMP. *Tabela Brasileira de Composição de Alimentos — TACO*, 4ª edição revista e ampliada, Campinas, 2011. © 2011 NEPA/UNICAMP. A publicação permite: “É permitida a reprodução parcial ou total desta obra, desde que citada a fonte.” Consulta institucional: https://www.nepa.unicamp.br/taco/.

O acervo foi extraído da planilha original `references/original-Taco_4a_edicao_2011.xls`, disponível no espelho https://github.com/raulfdm/taco-api/tree/06e466ad2f3d76064b587808b1804564b2c40f67/references. SHA-256 da planilha: `b7369a767b14bfe06ff9973957c140b266f9bb7932f870481ef2d99ba0a15ace`. Os metadados estão no JSON. Foram extraídos identificador, descrição, categoria, energia e três campos de macronutrientes por 100 g; `Tr` e `NA` não foram convertidos para zero. O aviso MIT do repositório espelho está em `server/nutrition/data/LICENSE-taco-api.txt`; ele não substitui a atribuição da publicação original.

**Open Food Facts:** https://world.openfoodfacts.org/ — banco sob ODbL, conteúdos individuais sob Database Contents License e imagens sob CC BY-SA. A interface atribui a fonte e liga o produto. Armazenamento ou redistribuição futura deve respeitar as obrigações pertinentes, inclusive compartilhamento pela mesma licença quando aplicável. A demo não importa imagens nem funde os bancos. API: https://openfoodfacts.github.io/openfoodfacts-server/api/.

**USDA FoodData Central:** https://fdc.nal.usda.gov/ — dados do Departamento de Agricultura dos Estados Unidos. Documentação e condições: https://fdc.nal.usda.gov/api-guide.html. A referência do alimento é preservada em cada candidato.

**TBCA:** https://www.tbca.net.br/ — não integrada nesta etapa. O site oferece preparações e medidas caseiras, mas publica restrições de comercialização e alteração do conteúdo. A integração requer avaliação específica das condições de uso e de acesso, sem presumir disponibilidade de API pública.

## Verificação

`npm run test:nutrition` verifica normalização, unidades, valores ausentes, porções, dados TACO, contrato dos adaptadores, cache, concorrência e erros HTTP. `npm run test:nutrition-ui` requer o servidor e Chromium: testa busca TACO real, confirmação, registro, origem, edição e cenários externos simulados. Nenhum teste com fixture comprova disponibilidade de uma API externa.
