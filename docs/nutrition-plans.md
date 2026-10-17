# Planos, rodinha e equação

Os quatro planos são definidos em `src/nutritionPlans.ts`: **Emagrecer**, **Cutting**, **Manutenção** e **Lean bulking**. Cutting usa a mesma regra de Emagrecer nesta versão, com identidade separada para evolução futura. Os valores e projeções continuam demonstrativos.

Os nomes antigos “Manter peso” e “Ganhar massa” são reconhecidos como Manutenção e Lean bulking. Cadastro, apresentação do plano, ajuste de ritmo e Progresso usam os nomes atuais. Manutenção mantém a meta-base; Emagrecer/Cutting seguem o sentido de redução existente; Lean bulking segue o sentido de aumento existente. Não foram introduzidas novas regras de prescrição.

## Dois papéis visuais

- **Rodinha:** apenas `max(0, meta − consumidas + atividades)` com o rótulo “kcal restantes”, sem cor de alerta. O texto fica centralizado e o rótulo ocupa uma linha.
- **Equação:** `meta − consumidas + atividades = saldo`, sem trocar a ordem quando muda o sinal. O resultado e sua descrição formam uma unidade sem quebra interna; em telas estreitas podem passar juntos para a linha seguinte.

Saldo positivo nessa equação corresponde a calorias restantes e é identificado como déficit na comparação dos registros com o alvo. Saldo negativo corresponde a superávit; o sinal permanece para que a igualdade esteja correta. Zero é equilíbrio. No Diário, o saldo de consumo segue a forma inversa `consumidas − meta − atividades`, com os mesmos critérios de direção e cor. Esses indicadores são relativos à meta configurada, não uma medição do gasto metabólico real.

Exemplo: meta 2.000, consumo 926, atividades 150 → rodinha 1.224 kcal restantes; equação `2.000 − 926 + 150 = 1.224 kcal · déficit`. Meta 2.000, consumo 2.500, atividades 400 → rodinha zero; equação `2.000 − 2.500 + 400 = -100 kcal · superávit`.

## Cores por plano

| Plano | Déficit | Equilíbrio | Superávit | Termo consumo | Termo atividades |
|---|---|---|---|---|---|
| Emagrecer | Verde | Neutro | Vermelho | Vermelho | Verde |
| Cutting | Verde | Neutro | Vermelho | Vermelho | Verde |
| Manutenção | Vermelho | Verde | Vermelho | Neutro | Neutro |
| Lean bulking | Vermelho | Neutro | Verde | Verde | Vermelho |

O feedback indica direção em relação ao plano, sem validar se a magnitude do déficit/superávit é adequada. Nenhuma tolerância arbitrária foi adicionada à manutenção. O aviso de consumo bruto acima da meta permanece um indicador alimentar separado, conforme o comportamento anterior.

## Verificação

`npm run test:calories` cobre as duas formas do saldo e a política de cores. `npm run test:plans`, com Vite e Chromium ativos, percorre os quatro cadastros, verifica as metas, os três estados do saldo, cores dos termos/resultado e a rodinha neutra. Também mede centralização e ausência de quebra no resultado entre 320 e 1440 px. `npm run test:measures` verifica o cadastro com Manutenção e medidas opcionais.
