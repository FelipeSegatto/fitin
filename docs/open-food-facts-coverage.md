# Cobertura de produtos na Open Food Facts — 17/10/2026

Verificação ao vivo solicitada para YoPRO, suplementos conhecidos, refrigerantes, chocolates e iogurtes. Não confundir indisponibilidade HTTP com produto ausente. Nenhum valor nutricional foi inventado ou incluído no catálogo do FitIn nesta verificação.

## Método

Foram feitas 21 consultas textuais diferentes pelo adaptador real `server/nutrition/providers.mjs`, com intervalo mínimo de 6,8 segundos entre inícios das consultas de cada série, sem retry automático. Usou-se o endpoint mundial `/cgi/search.pl`, os mesmos parâmetros do FitIn e oito resultados por chamada. Contagens abaixo são totais declarados pela fonte para a consulta, não quantidade de produtos brasileiros nem garantia de adequação nutricional.

A resposta original e o resultado da normalização foram comparados. Países dos produtos foram observados no retorno original. Também foram feitas duas consultas pela API local do próprio FitIn e uma consulta de controle por código de barras.

## Consultas por nome

| Consulta | HTTP | Total informado pela fonte | Retornados / utilizáveis no FitIn |
|---|---:|---:|---:|
| yopro | 200 | 301 | 8 / 8 |
| nescau | 503 | não verificável | não verificável |
| growth whey | 503 | não verificável | não verificável |
| max titanium | 503 | não verificável | não verificável |
| integralmedica | 200 | 45 | 8 / 7 |
| dux whey | 503 | não verificável | não verificável |
| coca cola | 503 | não verificável | não verificável |
| lacta | 503 | não verificável | não verificável |
| garoto | 503 | não verificável | não verificável |
| nestle chocolate | 503 | não verificável | não verificável |
| danone | 503 | não verificável | não verificável |
| vigor iogurte | 503 | não verificável | não verificável |
| piracanjuba | 503 | não verificável | não verificável |
| growth | 503 | não verificável | não verificável |
| dux | 503 | não verificável | não verificável |
| coca-cola | 503 | não verificável | não verificável |
| nestle | 503 | não verificável | não verificável |
| vigor | 503 | não verificável | não verificável |
| itambe | 503 | não verificável | não verificável |
| activia | 503 | não verificável | não verificável |
| optimum nutrition | 503 | não verificável | não verificável |

Resultados: duas consultas responderam 200; as outras 19 responderam 503. Isso não é estimativa estatística de disponibilidade: é o resultado deste conjunto de consultas neste ambiente e momento. A própria fonte apresenta página de indisponibilidade temporária nas respostas 503.

## Produtos confirmados

**YoPRO:** 301 resultados declarados na busca mundial; oito retornados e todos normalizados. As oito primeiras referências indicavam países europeus; nenhuma trazia Brasil em `countries_tags`. Exemplos: [YoPro Vainilla](https://world.openfoodfacts.org/product/8410500030858), [Creamy Classic](https://world.openfoodfacts.org/product/5601050038132). Isso confirma a presença da marca, mas não confirma as versões brasileiras procuradas pelo usuário.

**Integralmédica:** 45 resultados declarados; oito retornados e sete utilizáveis. Os oito indicavam Brasil em `countries_tags`. Um foi descartado por não ter nome, mesmo possuindo energia — proteção atual da normalização. Exemplos confirmados:

- [Nutri whey protein](https://world.openfoodfacts.org/product/7896311709519).
- [Whey 100%](https://world.openfoodfacts.org/product/7896311761753).
- [Whey Protein Isolado Iso Triple Zero](https://world.openfoodfacts.org/product/7896311143610).

**Controle por código de barras:** `3017620422003` respondeu HTTP 200, status 1, Nutella, marca Nutella/Ferrero. É creme de avelã; não comprova cobertura de barras Lacta, Garoto ou Nestlé.

**Nescau, Growth, Max Titanium, DUX, Optimum Nutrition, Coca-Cola, Lacta, Garoto, Nestlé, Danone, Vigor, Itambé, Activia e Piracanjuba:** cobertura específica não confirmada, porque as consultas correspondentes retornaram 503. Não afirmar que essas marcas estão ausentes da base.

## Resultado pelo próprio FitIn

| Consulta | HTTP do FitIn | Resultado |
|---|---:|---|
| yopro | 200 | 8 candidatos, sem cache |
| integralmedica | 503 | temporarily_unavailable |

YoPRO foi efetivamente recuperado pelo FitIn. Integralmédica respondeu diretamente pelo adaptador, mas falhou com 503 ao repetir a busca pela rota do app. Isso reforça a instabilidade externa e não uma falha determinística de normalização de todos os produtos.

## Limitações encontradas no código

1. A busca mundial só pede oito candidatos; versões estrangeiras podem ocupar toda a lista. Não há paginação nem preferência pelo Brasil. Ordenar no frontend não recuperaria produtos que nem chegaram na primeira página.
2. Um candidato sem nome ou energia é excluído. O total externo pode ser maior que a quantidade utilizável, como ocorreu na Integralmédica.
3. O cache é em memória, por dez minutos e por instância. Não garante disponibilidade após reinício ou falha em uma primeira consulta.
4. Na busca unificada, termos não reconhecidos pelo catálogo de equivalências não são enviados ao USDA. Marcas fora desse catálogo, portanto, dependem de OFF e produtos pessoais; o filtro individual USDA permite enviar a consulta literal.
5. Atribuição de país não prova que fórmula/rótulo correspondam ao produto consumido. Variante, sabor, embalagem e nutrientes exigem confirmação.

## Próximas mudanças recomendadas

- Distinguir explicitamente falha de fonte, lista vazia e produto incompleto.
- Implementar busca com preferência por referências comercializadas no Brasil e opção de resultados internacionais, com paginação e limite de chamadas. Validar os filtros oficialmente suportados antes de trocar o adaptador.
- Manter marcas/GTIN sem tradução; ampliar a política da busca unificada com regras testadas para marcas, sem assumir equivalência nutricional entre países.
- Construir gradualmente um catálogo brasileiro rastreável de produtos importantes, com cache persistente/atualização em segundo plano e conformidade com as condições das fontes. Não prometer cobrir toda uma marca após cadastrar uma embalagem.
- Preservar código de barras e cadastro pelo rótulo como alternativas.
- Criar uma lista de aceitação com variantes brasileiras específicas de YoPRO, whey das marcas citadas, Coca-Cola original/zero, chocolates e iogurtes, cada qual confirmado por rótulo ou referência verificável.

Nenhuma mudança de busca ou importação foi implementada nesta checagem.

Fonte: [Open Food Facts](https://world.openfoodfacts.org/) e sua [documentação de API](https://openfoodfacts.github.io/openfoodfacts-server/api/).
