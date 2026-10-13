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
