# FitIn — demo do fluxo inicial

Primeira implementação React + TypeScript a partir dos dois SVGs de Figma fornecidos pelo autor. Assets vetoriais extraídos do protótipo; tipografia Poppins adotada para a implementação, sujeita à confirmação da fonte original.

## Executar

Node 24 foi usado na validação. Instale as dependências com `npm ci` e execute `npm run dev`. A porta padrão é 5200. Para build: `npm run build`.

## Escopo

Boas-vindas, login demonstrativo, recuperação de senha simulada, cadastro em cinco etapas, apresentação de resultado, plano em quatro telas, ajuste de ritmo e home com registro manual de refeições e atividades. Desktop adaptado da identidade mobile; não existe protótipo desktop de referência. Diário, Progresso, Conquistas e Perfil possuem estados iniciais próprios, sem fingir histórico persistido.

Logins: `demo@fitin.app` / `fitin123` (João, dia em andamento) e `completo@fitin.app` / `fitin123` (Marina, dia completo). As contas apenas liberam navegação local; não existe autenticação de backend. O cadastro não cria uma conta e recuperação não envia e-mails. Registros do dia ficam na memória da sessão e são limpos ao sair; senha descartada ao terminar o formulário. A exceção são produtos pessoais, salvos por conta de demonstração neste navegador, sem sincronização entre dispositivos. Use dados fictícios.

As metas e projeções são um cenário demonstrativo de manutenção de 2.450 kcal. Sexo e medidas não são usados para prescrição; parâmetros reais precisam ser definidos e validados antes de transformar isso em recurso de saúde. A meta se mantém consistente no resultado/plano/home, e refeições/exercícios atualizam o mesmo resumo.

## Verificação

`npm run test:smoke` requer Chromium disponível; defina `CHROMIUM_PATH` para seu executável. O teste percorre validação, cadastro, ajuste de ritmo, resumo diário, registros, navegação, logout e login, verificando mobile/desktop. O padrão do ambiente de desenvolvimento é `/usr/bin/chromium`. `BASE_URL` permite apontar o teste para outro servidor.

## Próximos passos

Confirmar fonte e pequenos detalhes do design, definir regras de conta e plano, selecionar backend/persistência e implementar as próximas jornadas com novas telas de referência. Não publicar como aplicação com recomendações reais nesta etapa.

## Medidas opcionais

Na etapa de medidas, a idade é editável e sincroniza a data de nascimento. Peso, altura, pescoço, cintura e quadril podem ser adiados individualmente ou em conjunto. Campos adiados ficam vazios e não geram cálculos de IMC sem peso/altura. Verificação: `npm run test:measures`.

## Home da conta demonstrativa

O login abre com registros fictícios: 7 dias de sequência, meta de 2.000 kcal, duas refeições somando 926 kcal e musculação de 150 kcal. O saldo alimentar é 1.074 kcal; as 150 kcal de atividade aparecem à parte. Quem conclui o cadastro começa sem registros. O logo usa o asset fornecido no SVG de referência da home.

## Conquistas

Página com 36 medalhas independentes, usando 12 ilustrações: seis medalhões e seis halteres, com três nomes e desafios diferentes por ilustração. Acabamentos: bronze, prata, ouro, diamante, rosa e verde. Cada nome tem seu próprio fundo, progresso e recompensa. A coleção mostra seis resultados por vez; o botão “Ver todas as medalhas” abre o catálogo completo, com busca e filtros por formato e acabamento. XP deriva das medalhas conquistadas e não duplica ao abrir o card. Login tem histórico fictício separado (17 dias anteriores de registro, 14 refeições e 6.250 kcal de atividades), somado aos registros do dia; cadastro começa zerado. A sequência de sete dias mantém-se igual à home. Foco total mede 30 dias de registro, não necessariamente consecutivos; a medalha conta dias registrados, sem confundir esse total com dias de calendário. Os níveis/recompensas são regras demonstrativas. Os cards de medalhas seguem as variações e cores do segundo SVG fornecido pelo autor; as telas anteriores preservam suas variações próximas e tratamentos próprios. Verificação: `npm run test:achievements`.

As três novas personagens foram extraídas dos SVGs fornecidos para acompanhar o personagem azul na composição desktop. Os cards de atividades e refeições da home usam amarelo e pêssego com fundos suaves e texto escuro, mantendo as outras variações de cor.

## Diário e Progresso

Diário por data, com resumo de consumo/restante, macros logo abaixo e cards de refeições/atividades. Adição, edição e exclusão compartilham o estado com a home; registros de outros dias não alteram o consumo de hoje. Macros são opcionais: valores ausentes são exibidos como desconhecidos/parciais, nunca estimados a partir das calorias. A conta demo tem refeições de 370 e 556 kcal com macros coerentes (total P58/C115/G26). A fonte dos indicadores da home foi aumentada apenas no desktop.

Progresso traz plano atual, filtros de período, histórico de peso, metas, projeção linear demonstrativa e registros de passos. Login carrega seis pesos fictícios (81 a 78 kg), meta de 70 kg e passos de exemplo. Médias de calorias usam somente dias com refeições registradas e são identificadas como parciais. Cadastro novo inicia com o peso informado, se houver; não recebe histórico fictício. Fórmulas de gordura corporal não foram inventadas. Peso no mesmo dia é atualizado em vez de duplicado.

Verificação dos fluxos: `npm run test:diary-progress`. Dados continuam apenas na memória da sessão, sem autenticação ou sincronização real.

## Perfil

Perfil baseado no SVG fornecido, com cores ajustadas à paleta existente. O personagem do banner é atribuído no cadastro/login: azul ou vermelho para Masculino; rosa ou roxa do SVG do autor para Feminino. Outro usa o conjunto completo. A atribuição fica estável durante a sessão, inclusive ao editar nome/e-mail. Marina usa a personagem rosa e João o azul. Avatar por iniciais, nível/medalhas compartilhando o cálculo de Conquistas, jornada baseada nos pesos do Progresso e resumo mensal dos registros disponíveis no Diário. Atalhos abrem o registro de peso, a meta de peso, o ajuste de ritmo e a coleção. Nome/e-mail podem ser alterados somente na sessão; o FAQ explica os limites da demo e não inventa canais externos de suporte. Logout limpa a demonstração.

Verificação: `npm run test:profile`.


## Desafios semanais

Conquistas permite escolher quatro desafios opcionais: refeições em três dias, duas atividades, um registro de peso e cinco dias com refeições ou atividades. “Meus desafios” mostra somente os escolhidos, permite sair e exibe progresso, prazo até domingo e um selo ao concluir. Os quatro convites aparecem em grade no desktop e em carrossel no mobile.

A semana vai de segunda a domingo, pelo calendário local. Contam registros da semana até hoje, inclusive os anteriores à participação. Refeições no mesmo dia contam uma vez; datas futuras e histórico agregado fictício não contam. Alterar ou excluir registros recalcula o progresso. O registro de peso não exige ganho ou perda. Selos semanais não somam XP nem alteram as medalhas e o nível do Perfil.

As escolhas sobrevivem à navegação entre abas, mas são limpas ao sair, recarregar ou iniciar outra conta. Na virada da semana, a seleção anterior deixa de aparecer. Verificação: `npm run test:achievements`, incluindo participação, saída, progresso compartilhado, limites da semana e limpeza da sessão.


Os quatro desafios semanais usam composições SVG locais com ícones Lucide (licença ISC). As medalhas usam os medalhões aprovados em PNG e os halteres do autor em SVG/PNG. As versões rosa e verde seguem o acabamento das referências. Os mesmos nomes, critérios, artes e XP são compartilhados entre Conquistas, detalhes, catálogo e Perfil. Créditos dos ícones em `public/assets/achievements/`.

As definições de medalhas e os critérios ficam em `src/medalCollection.ts`. Cada prêmio é independente: concluir um desafio libera apenas a medalha com aquele nome, sem exigir os outros dois nomes da mesma arte. XP é derivado uma única vez por ID; o catálogo não concede recompensas ao abrir ou filtrar. Os registros futuros não contam e os dias são deduplicados por data. Os totais agregados da conta de demonstração são identificados como fictícios; o número de atividades e os dias específicos de refeição/atividade usam somente os registros disponíveis. As escolhas e os prêmios continuam limitados à sessão, sem persistência entre acessos.


## Segunda conta de demonstração: dia completo

No login, “Preencher dia completo” seleciona `completo@fitin.app` / `fitin123`. Depois, clique em “Entrar”. Marina tem seis refeições (café, lanche da manhã, almoço, lanche da tarde, jantar e ceia) e três atividades do dia. A home exibe nove cards individuais com horários e cores preenchidas da paleta do FitIn, seguindo o roxo e o verde da home original.

O cenário fictício tem meta de 2.000 kcal, 2.400 kcal registradas em refeições e 400 kcal em atividades, resultando em 400 kcal a mais na alimentação. As atividades são contabilizadas à parte e não ampliam a meta. Os macros somam 140 g de proteína, 280 g de carboidratos e 80 g de gordura. Valores são apenas dados de interface, sem recomendação alimentar ou de exercícios. Home, Diário, Progresso, Conquistas e Perfil compartilham os mesmos registros da sessão. Sair limpa os dados; um novo login restaura o cenário original. João mantém os dois alimentos, uma atividade e saldo alimentar de 1.074 kcal.

Verificação: `npm run test:full-day-demo` cobre os registros, as cores, os totais, alterações pelo Diário, isolamento entre contas e larguras mobile/desktop.

Os cards da home usam preenchimentos mais fortes, seguindo o roxo e o verde originais. Os ícones Lucide são escolhidos pelo tipo e nome do registro, com opções para café, frutas, sanduíches, peixe, ceia, caminhada, musculação, mobilidade, bicicleta, natação e outras atividades. No demo completo, os nove registros usam nove ícones diferentes.

Quando as calorias consumidas ultrapassam a meta diária, o banner da home mostra “Atenção à meta do dia”, o excesso registrado e o personagem fornecido em `attention-buddy.svg`. A comparação usa consumo bruto (`consumidas > meta`): banner, gráfico, equação e Diário usam o mesmo saldo alimentar; atividades aparecem à parte e não aumentam a meta. No demo completo, 2.400 kcal consumidas para meta de 2.000 geram aviso e resultado de 400 kcal a mais, em vermelho, mesmo com 400 kcal de atividades. Ao voltar à meta ou abaixo dela, o banner habitual retorna.

A seção “Desafios da semana” fica em um banner com a personagem e o quadro fornecidos pelo autor (`challenges-guide.svg`). Os cards semanais e os desafios ativos usam preenchimentos verde, roxo, azul e amarelo da paleta, com textos escuros e pequenos elementos de cada tema. No mobile, as quatro opções continuam no carrossel.

## Busca nutricional

O formulário de alimentos faz uma busca unificada na TACO local (597 alimentos), no Open Food Facts e no USDA, com a origem em cada resultado e aviso por fonte quando houver falha. Um catálogo próprio de equivalências no backend converte alimentos e qualificadores conhecidos para inglês na consulta ao USDA, sem IA ou serviço pago de tradução. Os filtros individuais continuam disponíveis. É possível pesquisar `150 g de arroz cozido`, escolher o resultado e confirmar a porção. Calorias/macros e origem seguem para o registro; o preenchimento manual continua disponível.

`npm run dev` já inicia a pequena API Node junto do Vite. Para uma chave USDA própria, consulte `.env.example` (opcional). Uma hospedagem apenas estática de `dist/` precisa de um backend para essa API. Arquitetura, limitações, atribuições, hospedagem e evolução para texto livre: [integração nutricional](docs/nutrition-integration.md). Verificação: `npm run test:nutrition` e, com o servidor ativo, `npm run test:nutrition-ui`.

## Atividades físicas

“Adicionar atividades” aceita calorias manuais ou do relógio/app e oferece uma estimativa local por modalidade/ritmo, peso e duração. A estimativa usa METs de referência, identifica o valor como aproximado e calcula somente energia ativa acima do repouso. O Diário guarda e mostra sua origem. Não há conexão com dispositivos nem API paga. Consulte [registro de atividades](docs/activity-recording.md). Verificação: `npm run test:activities` e `npm run test:activities-ui`.

A [avaliação da TBCA](docs/tbca-assessment.md) registra as condições publicadas e uma consulta preparada à coordenação; a TBCA ainda não foi integrada.

No desktop, Conquistas omite o cabeçalho com logo acima do conteúdo, seguindo as outras seções. O logo do menu lateral e o cabeçalho mobile permanecem.

## Produtos pessoais e Open Food Facts

É possível cadastrar produtos pelo rótulo em **Adicionar alimentos → Buscar na base nutricional → Meus produtos**. Nome, marca, referência em g/ml e nutrientes são validados e normalizados. Os produtos permanecem na mesma conta demo/navegador após recarga ou logout e aparecem na busca unificada, sem publicação automática. A estrutura para revisão futura guarda rótulo original, versão, avisos e estado não enviado; não existe pipeline de aprovação implementada. Veja [produtos pessoais](docs/personal-products.md).

O Open Food Facts foi verificado por código no próprio FitIn. A API também respondeu a buscas diretas por nome, mas o aplicativo recebeu 503 intermitentes por limitação/alta demanda; a UI indica a falha e oferece alternativas. Evidências e limites: [verificação OFF](docs/open-food-facts-check.md).

Atividades agora têm 47 opções, busca, categorias, cards e durações rápidas. Verificações: `npm run test:products`, `npm run test:products-ui`, `npm run test:activities-ui`.
