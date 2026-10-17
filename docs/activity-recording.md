# Registro de atividades

Abra **Adicionar atividades** na home, ou adicione pelo Diário na data desejada.

- **Informação manual:** nome livre, energia e duração opcional, preservando o fluxo anterior.
- **Relógio ou aplicativo:** selecione essa origem e informe as **calorias ativas** exibidas pelo dispositivo. Não há sincronização com dispositivos nesta etapa.
- **Estimativa:** abra “Estimar calorias da atividade”, escolha modalidade/ritmo, confirme peso e duração e clique “Usar estimativa”. É necessário confirmar os campos antes de adicionar o registro.

O catálogo tem 47 opções de modalidade/ritmo, incluindo caminhada, trilha, bicicleta, ergométrica, corrida, remo, musculação, calistenia, pilates, yoga, natação, hidroginástica, esportes, ballet, dança, escalada/rapel, CrossFit e lutas (boxe, jiu-jítsu, judô, karatê, taekwondo e muay thai). A seleção oferece busca com normalização de acentos, categorias, cards com intensidade, resumo da seleção e atalhos de 15/30/45/60 minutos. É uma seleção local, sem API paga ou chamadas externas. As modalidades e parâmetros estão em `src/activities.ts`; o formulário está em `src/ActivityEstimator.tsx`.

## Referência e cálculo

Seleção manual de valores factuais de MET da publicação: Ainsworth BE et al. *2011 Compendium of Physical Activities: a second update of codes and MET values*. Medicine & Science in Sports & Exercise. 2011;43(8):1575–1581. DOI: https://doi.org/10.1249/MSS.0b013e31821ece12.

Os ritmos em km/h são aproximações dos intervalos originais em milhas/h. Não representam medições individuais. MET significa equivalente metabólico; utiliza referência populacional padronizada, não uma medição do metabolismo de quem registra. A estimativa varia com condicionamento, técnica, pausas e outros fatores, e não incorpora idade/sexo nem oferece prescrição. A população e a versão da referência precisam ser revistas antes de usar isto fora da demonstração.

A demo estima **energia ativa acima do repouso**:

```
kcal ativas = arredondar((MET − 1) × 3,5 × peso_kg ÷ 200 × minutos)
```

Subtrair 1 MET isola o gasto adicional da atividade, sem incluir novamente o gasto de repouso. Exemplo: bicicleta de passeio, 4 MET, 78 kg, 30 min → aproximadamente 123 kcal ativas. Isso difere de energia total/bruta, que inclui repouso. Não são usadas APIs nem modelos de IA para esse cálculo.

O peso sugerido é o último disponível na data da atividade ou antes dela, nunca um peso futuro. Na ausência de peso, o campo fica vazio e a estimativa exige preenchimento. Alterar o peso no Progresso não recalcula retroativamente registros salvos.

O usuário pode ajustar ou escolher outro valor. Editar duração ou trocar a origem de uma estimativa exige preencher novamente a energia ou reaplicar a estimativa. Editar nome/energia desfaz a associação automática. Alterar somente horário preserva a referência.

O Diário identifica a origem e permite abrir a referência. Cada estimativa armazena modalidade, ritmo, MET, peso, duração, método/versão, resultado e fonte em `DailyRecord.activity`. `calorieOrigin` distingue `manual`, `device` e `met`. Registros antigos sem esses campos permanecem válidos, sem inventar origem.

## Evolução

O registro atual não depende de catálogo externo. Mais tarde, uma API própria pode servir o catálogo versionado, persistir registros e aceitar texto livre com confirmação de modalidade/ritmo/duração. Integrações com dispositivos exigirão autenticação e consentimento específicos. Um catálogo de exercícios de musculação descreve movimentos e equipamentos; não fornece automaticamente gasto individual confiável.

A aplicação continua em memória: recarregar ou sair limpa os registros. O resumo usa as calorias ativas informadas ou estimadas no saldo ajustado: meta − consumo + atividades. A rodinha, a equação e o saldo do Diário usam esse mesmo indicador. A meta alimentar não muda; banner e aviso alimentar continuam mostrando consumo bruto acima dela, independentemente dos exercícios. Exemplo Marina: meta 2.000, consumo 2.400 e atividades 400 → saldo ajustado 0, com aviso alimentar de 400 kcal a mais.

Verificação: `npm run test:activities`; com Vite e Chromium ativos, `npm run test:activities-ui`.

CrossFit usa equivalência com treino em circuito (moderado ou vigoroso), identificada como aproximação na seleção e preservada em `referenceNote` no registro. Os treinos gerais de luta usam uma referência do grupo artes marciais; não representam uma medição específica para cada modalidade. Pausas longas e tempo de aula não ativo não devem ser tratados como esforço vigoroso contínuo.
