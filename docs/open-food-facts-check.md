# Verificação do Open Food Facts — 17/10/2026

A API oferece duas buscas diferentes:

- **Código de barras:** `GET https://world.openfoodfacts.org/api/v2/product/{codigo}.json`.
- **Nome/marca em texto:** `GET https://world.openfoodfacts.org/cgi/search.pl?search_terms=...&search_simple=1&action=process&json=1&page_size=8` (busca textual v1). A consulta v2 por filtros não deve ser apresentada como equivalente de busca textual livre.

## Evidências desta verificação

- Consulta direta do código `3017620422003`: HTTP 200, produto Nutella, marca Nutella/Ferrero.
- Consulta pelo próprio endpoint FitIn `source=off&q=3017620422003`: sucesso, um candidato normalizado com nome e marca.
- Consulta direta de `search_terms=nutella`: HTTP 200, contagem 1.077 e exemplos do produto. A contagem é um resultado de busca, não uma medida da cobertura brasileira.
- Outras consultas por nome, incluindo chamadas feitas pelo adaptador do FitIn, retornaram HTTP 503. A página de erro do próprio Open Food Facts informa alta demanda ou indisponibilidade para acesso anônimo, e menciona prioridade de acesso para usuários registrados. Não foi criada conta nem configurada autenticação OFF.

Portanto, há conexão funcional por código e suporte de API a nome/marca, mas a busca textual não ficou estável no aplicativo neste ambiente. Não é correto afirmar que todas as buscas por nome foram validadas no FitIn. A disponibilidade do serviço externo permanece uma limitação explícita.

## Ajustes

O adaptador mantém parâmetros básicos de busca v1, até oito produtos e timeout de oito segundos. Foram removidos parâmetros opcionais de localidade e seleção de campos na busca textual para simplificar a chamada; isso não eliminou todos os 503 observados. A busca por código continua usando campos selecionados. Há identificação do aplicativo no User-Agent, cache e intervalo mínimo por fonte, sem retries automáticos para não multiplicar consultas em um serviço limitado.

Marca e código acompanham os candidatos. Os nomes incluem a marca para distinguir produtos. Em caso de 503 na busca textual, a interface informa a limitação e sugere código de barras ou cadastro pelo rótulo. A busca unificada preserva os resultados das fontes disponíveis e os produtos pessoais.

Para produtos brasileiros, código de barras costuma oferecer identificação mais precisa; nome/marca podem trazer versões e países diferentes. O usuário deve conferir produto, preparo, referência por 100 g/ml e rótulo. Este teste com Nutella não comprova cobertura de marcas nacionais específicas. Não se trata de API exclusiva de produtos americanos.

Documentação oficial: https://openfoodfacts.github.io/openfoodfacts-server/api/.
