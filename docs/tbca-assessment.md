# Avaliação de integração da TBCA

Consulta ao site oficial em 17/10/2026: https://www.tbca.net.br/, seção **Como Citar** (`#comoCitar`). Versão citada pelo site: TBCA 7.3, USP/FoRC, 2025.

Trechos publicados:

> É estimulada a divulgação de dados, sem fins comerciais, sendo necessário citar a fonte.

> Para fins comerciais, é necessário contatar os coordenadores.

> Quando os dados forem utilizados para o cálculo da informação nutricional, a citação da fonte é dispensada.

> Não é permitida a reprodução total ou parcial do material. Caso seja utilizada a informação do material, é obrigatório citar a fonte. Não é permitida a comercialização. Não é permitido a alteração total ou mesmo parcial do conteúdo.

Esses trechos não estabelecem uma licença geral para copiar o acervo para o FitIn. A dispensa de citação em um caso específico também não estabelece, por si, autorização para redistribuir os dados. Não foi localizada documentação de API pública no site consultado; isso não prova que inexista acesso por acordo.

**Decisão técnica:** manter a TBCA fora da ingestão, cache e catálogo do FitIn até confirmar as condições com a coordenação. A arquitetura já permite acrescentar outro adaptador depois. TACO local, USDA e Open Food Facts continuam separados, com suas próprias condições.

Contato publicado: `tbca.contato@usp.br`. Esse endereço aparece no site para pesquisas de consumo alimentar e recebimento de dados POF-TBCA mediante termo; é um ponto inicial para solicitar encaminhamento à coordenação. Nenhuma mensagem foi enviada.

## Consulta preparada para o responsável pelo FitIn

Assunto: Condições de integração da TBCA ao FitIn

Olá, equipe TBCA,

Estou desenvolvendo o FitIn, uma aplicação de registro de alimentação e atividades físicas. Gostaríamos de consultar a TBCA para ajudar o usuário a encontrar alimentos brasileiros e calcular os nutrientes de porções informadas, com identificação da fonte e da versão dos dados.

Neste momento temos uma demonstração, com possibilidade de uso comercial futuro. Antes de integrar qualquer dado, gostaríamos de confirmar:

- Existe API, exportação licenciada ou outra modalidade de acesso para aplicações?
- É permitido armazenar dados em cache e normalizar campos/unidades para calcular porções?
- Quais são as condições para exibir resultados, armazenar registros individuais e disponibilizar esse recurso comercialmente?
- Há custos, limites de consultas, contrato, atribuição exigida ou restrições de redistribuição?
- Como são fornecidas atualizações e identificadas as versões dos alimentos?

Podem orientar o canal e o procedimento apropriados?

Obrigado,
Felipe Segatto
