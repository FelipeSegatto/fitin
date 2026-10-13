# FitIn — demo do fluxo inicial

Primeira implementação React + TypeScript a partir dos dois SVGs de Figma fornecidos pelo autor. Assets vetoriais extraídos do protótipo; tipografia Poppins adotada para a implementação, sujeita à confirmação da fonte original.

## Executar

Node 24 foi usado na validação. Instale as dependências com `npm ci` e execute `npm run dev`. A porta padrão é 5200. Para build: `npm run build`.

## Escopo

Boas-vindas, login demonstrativo, recuperação de senha simulada, cadastro em cinco etapas, apresentação de resultado, plano em quatro telas, ajuste de ritmo e home com registro manual de refeições e atividades. Desktop adaptado da identidade mobile; não existe protótipo desktop de referência. Diário, Progresso, Conquistas e Perfil possuem estados iniciais próprios, sem fingir histórico persistido.

Login: `demo@fitin.app` / `fitin123`. Essa conta apenas libera navegação local; não existe autenticação de backend. O cadastro não cria uma conta e recuperação não envia e-mails. Dados ficam apenas na memória da sessão; senha descartada ao terminar o formulário e todos os dados são limpos ao sair. Use dados fictícios.

As metas e projeções são um cenário demonstrativo de manutenção de 2.450 kcal. Sexo e medidas não são usados para prescrição; parâmetros reais precisam ser definidos e validados antes de transformar isso em recurso de saúde. A meta se mantém consistente no resultado/plano/home, e refeições/exercícios atualizam o mesmo resumo.

## Verificação

`npm run test:smoke` requer Chromium disponível; defina `CHROMIUM_PATH` para seu executável. O teste percorre validação, cadastro, ajuste de ritmo, resumo diário, registros, navegação, logout e login, verificando mobile/desktop. O padrão do ambiente de desenvolvimento é `/usr/bin/chromium`. `BASE_URL` permite apontar o teste para outro servidor.

## Próximos passos

Confirmar fonte e pequenos detalhes do design, definir regras de conta e plano, selecionar backend/persistência e implementar as próximas jornadas com novas telas de referência. Não publicar como aplicação com recomendações reais nesta etapa.

## Medidas opcionais

Na etapa de medidas, a idade é editável e sincroniza a data de nascimento. Peso, altura, pescoço, cintura e quadril podem ser adiados individualmente ou em conjunto. Campos adiados ficam vazios e não geram cálculos de IMC sem peso/altura. Verificação: `npm run test:measures`.

## Home da conta demonstrativa

O login abre com registros fictícios: 7 dias de sequência, meta de 2.000 kcal, duas refeições somando 926 kcal e musculação de 150 kcal. O saldo é 1.224 kcal. Quem conclui o cadastro começa sem registros. O logo usa o asset fornecido no SVG de referência da home.

## Conquistas

Página com coleção de seis medalhas, assets de halteres extraídos do SVG, filtros e detalhes, desafio de 30 dias e semana. XP deriva das medalhas conquistadas e não duplica ao abrir o card. Login tem histórico fictício separado (17 dias anteriores de registro, 14 refeições e 6.250 kcal de atividades), somado aos registros do dia; cadastro começa zerado. A sequência de sete dias mantém-se igual à home. Foco total mede 30 dias de registro, não necessariamente consecutivos; o desafio foi rotulado de 30 dias para manter coerência sem confundir dias registrados com dias de calendário. Os níveis/recompensas são regras demonstrativas. Os cards de medalhas seguem as variações e cores do segundo SVG fornecido pelo autor; as telas anteriores preservam suas variações próximas e tratamentos próprios. Verificação: `npm run test:achievements`.

As três novas personagens foram extraídas dos SVGs fornecidos para acompanhar o personagem azul na composição desktop. Os cards de atividades e refeições da home usam amarelo e pêssego com fundos suaves e texto escuro, mantendo as outras variações de cor.

## Diário e Progresso

Diário por data, com resumo de consumo/restante, macros logo abaixo e cards de refeições/atividades. Adição, edição e exclusão compartilham o estado com a home; registros de outros dias não alteram o consumo de hoje. Macros são opcionais: valores ausentes são exibidos como desconhecidos/parciais, nunca estimados a partir das calorias. A conta demo tem refeições de 370 e 556 kcal com macros coerentes (total P58/C115/G26). A fonte dos indicadores da home foi aumentada apenas no desktop.

Progresso traz plano atual, filtros de período, histórico de peso, metas, projeção linear demonstrativa e registros de passos. Login carrega seis pesos fictícios (81 a 78 kg), meta de 70 kg e passos de exemplo. Médias de calorias usam somente dias com refeições registradas e são identificadas como parciais. Cadastro novo inicia com o peso informado, se houver; não recebe histórico fictício. Fórmulas de gordura corporal não foram inventadas. Peso no mesmo dia é atualizado em vez de duplicado.

Verificação dos fluxos: `npm run test:diary-progress`. Dados continuam apenas na memória da sessão, sem autenticação ou sincronização real.

## Perfil

Perfil baseado no SVG fornecido, com cores ajustadas à paleta existente. Avatar por iniciais, nível/medalhas compartilhando o cálculo de Conquistas, jornada baseada nos pesos do Progresso e resumo mensal dos registros disponíveis no Diário. Atalhos abrem o registro de peso, a meta de peso, o ajuste de ritmo e a coleção. Nome/e-mail podem ser alterados somente na sessão; o FAQ explica os limites da demo e não inventa canais externos de suporte. Logout limpa a demonstração.

Verificação: `npm run test:profile`.
