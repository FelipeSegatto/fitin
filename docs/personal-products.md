# Produtos pessoais e base para revisão futura

## Usar na demo

Em **Adicionar alimentos → Buscar na base nutricional → Meus produtos**, clique em **Cadastrar produto pelo rótulo**. Informe nome, marca, código de barras opcional, quantidade/unidade de referência do rótulo e os nutrientes dessa mesma quantidade. Macros vazios permanecem desconhecidos; zero precisa ser informado explicitamente.

Os produtos aparecem na busca unificada e no filtro **Meus produtos**. Também é possível usá-los diretamente do catálogo, confirmando a quantidade consumida. O registro no Diário conserva um snapshot da referência: excluir o produto pessoal não altera refeições já registradas.

A persistência atual é `localStorage`, separada pelo identificador da conta de demonstração no mesmo navegador. Sobrevive a recarga, logout e novo login na mesma conta. Não há sincronização com outro navegador/aparelho nem autenticação de backend. Isso é organização da demo, não uma fronteira de segurança entre pessoas com acesso ao mesmo navegador. Limpar os dados do site remove os produtos. Nome/e-mail editados durante a sessão não trocam o catálogo que já foi aberto; os logins demo continuam usando seus identificadores originais.

Não são salvos senha nem credenciais de APIs. O limite inicial é de 200 produtos por conta/navegador. Falhas de armazenamento ou conteúdo inválido geram mensagem e não sobrescrevem o acervo existente.

## Estrutura entregue agora

`src/personalProducts.ts` contém o contrato versionado `PersonalProduct`, o rótulo original, normalização por 100 g/ml, identificação, datas e validação reutilizável sem dependência da interface. O componente `src/PersonalProducts.tsx` usa essa regra e a camada de armazenamento local, que poderá ser substituída por um repositório de backend quando houver autenticação real.

Checagens atuais:

- Nome/marca, tipos numéricos, valores finitos não negativos e quantidade/unidade válidas.
- GTIN opcional com comprimento e dígito verificador válidos. Isso não comprova que o código corresponda ao produto.
- Limites de energia/macros normalizados e soma de macros em produtos sólidos.
- Duplicidade por código ou nome/marca dentro do catálogo pessoal.
- Comparação aproximada de energia com os fatores 4/4/9 como aviso; não é prova de fraude ou erro, pois fibras/polióis e arredondamentos podem interferir.
- Valores faltantes preservados como `null`, sem transformá-los em zero.

O estado é sempre **rótulo informado / não verificado**. Metadados `schemaVersion`, `integrity.version`, `integrity.warnings`, `review.status = not_submitted`, rótulo original e timestamps preparam uma futura revisão. Reabrir o armazenamento reconstrói os nutrientes a partir do rótulo validado, sem confiar nos valores normalizados ou URLs alterados no navegador.

## Pipeline futura — ainda não implementada

Não existe envio, fila de revisão, aprovação, integração automática ao catálogo geral ou validação no servidor. Nada é publicado por cadastrar um produto pessoal. Uma implementação futura poderá:

1. Autenticar o usuário e persistir o produto no backend, com autorização por proprietário.
2. Receber contribuição mediante escolha explícita, com evidência do rótulo e versão.
3. Validar novamente no servidor, verificar duplicatas/conflitos e comparar referências.
4. Encaminhar a revisão com auditoria, motivos de decisão e possibilidade de correção.
5. Publicar uma cópia aprovada versionada, sem modificar retroativamente registros pessoais.

A checagem local serve para consistência do formulário; qualquer pipeline futura precisa reaplicá-la no servidor, pois dados enviados pelo cliente não são confiáveis.

Verificação: `npm run test:products` e, com Vite e Chromium, `npm run test:products-ui`.
