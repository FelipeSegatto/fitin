# MySQL e backend do FitIn — desenvolvimento e revisão

## O que esta entrega faz

Cria MySQL 8.4 no Docker Compose e aplica **38 tabelas de domínio** do planejamento, além de duas tabelas técnicas: `schema_migrations` e `schema_seeds`. Inclui base de backend Node.js/TypeScript com pool, helper transacional e endpoints de saúde, sem acesso ao banco pelo navegador.

**O frontend demonstrativo ainda não usa esse backend para autenticação, produtos ou diário.** Os dados atuais do navegador não foram migrados nem substituídos. As tabelas de pipeline/IA estão criadas, mas não há worker, chamadas de IA, revisão administrativa ou publicação automática nesta entrega. Os serviços e endpoints de negócio serão implementados após a revisão do banco.

O DDL efetivo está em `backend/migrations/`. O planejamento está em `docs/architecture/database-plan.md`; divergências e limites relevantes estão registrados abaixo.

## Pré-requisitos no Windows

- Docker Desktop iniciado, usando Linux containers/WSL 2.
- Node.js **24**, versão mínima 24.10, e npm.
- Checkout atualizado do repositório. Executar comandos na raiz, onde está `compose.yaml`.
- Workbench é opcional; não precisa instalar outro servidor MySQL.

## Primeira inicialização

No PowerShell, entre na sua pasta `fitin` e execute:

```powershell
npm ci
npm --prefix backend ci
npm run db:configure
```

`db:configure` cria/completa o `.env` local, preserva valores existentes não vazios e **exibe as novas senhas antes de iniciar qualquer serviço**. Guarde-as. Não cria contas reais de usuário do FitIn. Os usuários abaixo são contas técnicas do MySQL:

| Usuário | Uso | Permissões |
|---|---|---|
| fitin_app | Backend e consultas pelo Workbench | SELECT, INSERT, UPDATE e DELETE somente no schema do FitIn |
| fitin_migrator | Migrações e seeds | DML e DDL somente no schema do FitIn |
| root | Administração local e backup | Administração do MySQL |

Depois de conferir as credenciais:

```powershell
npm run db:up
npm run db:migrate
npm run db:seed
npm run backend:dev
```

`db:up` espera o MySQL ficar saudável. Em outro terminal, na raiz:

```powershell
npm run dev
```

Portas padrão: MySQL `127.0.0.1:3307`; backend `127.0.0.1:5300`; frontend `5200`. Configuração do banco/backend fica no `.env` da raiz. `db:configure` não sobrescreve uma chave não vazia.

As variáveis de criação de usuários são usadas quando o volume está vazio. Alterar uma senha apenas no `.env` não altera a conta já criada no MySQL; uma rotação exige ALTER USER autorizado e atualização da configuração. Não apagar o volume para corrigir uma senha. Se a porta 3307 estiver ocupada, ajustar DB_PORT no `.env` antes de subir.

As senhas são geradas localmente. As credenciais informadas para a instância de desenvolvimento na nuvem não são automaticamente as mesmas do seu PC. Nenhuma senha real acompanha os arquivos do Git. Não usar credenciais de desenvolvimento em produção.

## Uso diário

```powershell
npm run db:up
npm run db:migrate
npm run backend:dev
```

Frontend em outro terminal: `npm run dev`. Reaplicar migrações executa apenas as pendentes. Seeds já aplicados não são repetidos; não é necessário executá-los diariamente. Reinstalar dependências apenas quando necessário, usando os lockfiles.

Encerrar backend: Ctrl+C. Parar MySQL sem apagar seus dados:

```powershell
npm run db:stop
```

O volume `fitin_mysql_data` conserva os dados. `docker compose down` remove contêiner/rede e preserva o volume por padrão. **Não usar `docker compose down -v` para uma atualização: esse comando apaga o volume.**

## Conexão no MySQL Workbench

Criar conexão Standard TCP/IP:

| Campo | Valor padrão |
|---|---|
| Hostname | 127.0.0.1 |
| Port | 3307 |
| Username | fitin_app |
| Password | MYSQL_APP_PASSWORD do seu `.env` |
| Default Schema | fitin |

Use `fitin_migrator` com `MYSQL_MIGRATION_PASSWORD` apenas quando precisar administrar a estrutura; prefira modificar a estrutura por migrações, não manualmente pelo Workbench.

Exemplos de consulta:

```sql
SELECT VERSION();
SHOW TABLES;
SELECT name, applied_at FROM schema_migrations ORDER BY name;
SELECT id, name, brand, product_line, flavor, presentation FROM foods LIMIT 20;
SELECT id, label_amount, label_unit, kcal_per100 FROM food_versions LIMIT 20;
```

Os IDs BIGINT e valores DECIMAL são retornados como strings pelo driver para preservar precisão. Não converter indiscriminadamente para Number no backend.

## Migrações versionadas

Cada arquivo contém um CREATE TABLE atômico, em ordem de dependências. O executor:

1. Adquire um lock por banco para serializar execuções.
2. Verifica SHA-256 dos arquivos aplicados, arquivos ausentes e migrações incompletas.
3. Registra o início antes de aplicar cada arquivo.
4. Aplica o DDL e marca sua conclusão.

MySQL faz commit implícito de DDL; não há uma transação única envolvendo as 38 tabelas. A marca de início evita esconder falhas ou repetir DDL parcialmente aplicado.

```powershell
npm run db:status
```

Não editar nem renomear migração aplicada. Novas alterações devem ter novo número e preservar compatibilidade com os dados existentes. Não há comando destrutivo de reset/down automático.

### Recuperar uma migração incompleta

Fazer backup, interromper outros processos de migração e inspecionar o erro, a linha com `applied_at IS NULL` e o DDL real via `SHOW CREATE TABLE`. O executor para intencionalmente até essa revisão.

- Se o DDL **não foi aplicado**, corrigir a causa e, após confirmação, remover apenas a marca incompleta correspondente antes de repetir. Nunca apagar marcas de arquivos concluídos.
- Se o DDL **foi aplicado**, conferir que corresponde integralmente ao arquivo/checksum e concluir manualmente a marca após essa verificação.
- Se houver dúvida ou mudanças parciais, restaurar uma cópia de backup e investigar. Não executar toda a pasta de SQL por cima nem desabilitar FKs/CHECKs para ignorar o erro.

## Seeds

`backend/seeds/reference-v1.json` é uma cópia congelada dos catálogos existentes no FitIn. Seeds gravam DML numa transação e registram checksum; erro desfaz o lote. Não alterar o arquivo depois de aplicado: uma atualização exige nova versão de seed e um procedimento de atualização explícito.

| Referência | Quantidade |
|---|---:|
| Tipos de plano | 4 |
| Fontes | 6 |
| Alimentos TACO utilizáveis | 591 |
| Snapshots e versões TACO | 591 cada |
| Referências de esforço | 47 |
| Modalidades | Agrupadas por nome a partir das referências |
| Medalhas | 36 |
| Desafios | 4 |
| Equivalências | Alimentos e modificadores do catálogo existente |

O arquivo TACO tem 597 registros; seis sem energia numérica foram excluídos da importação operacional, preservados no JSON. IDs originais: 450, 457, 458, 516, 517 e 591. Não atribuir zero a `*`/`NA`. A origem TACO, versão, rótulo de referência e snapshot original dos importados ficam conservados. Ver atribuição/licença em `docs/nutrition-integration.md`.

Não são criados usuários demo, senhas de usuários finais, refeições, prêmios adquiridos, edições datadas de desafios ou produtos industrializados sem rótulo conferido. Referências importadas não são rotuladas como curadoria comprovada. Alguns desafios podem ficar sem uma medalha correspondente; a regra de recompensa precisa de revisão antes da integração de conquistas.

## Saúde do backend

- `GET /health/live`: processo responde.
- `GET /health/ready`: MySQL é 8.4 e o histórico de migrações corresponde aos arquivos, inclusive checksums. Retorna 503 se indisponível/incompatível.

O backend verifica a prontidão antes de abrir a porta. Falha de conexão não imprime senhas. Não há CORS aberto nem endpoints de dados privados nesta base inicial. O backend fica fora do Docker no desenvolvimento; se for containerizado, DB_HOST passa a ser `mysql` e DB_PORT `3306`.

## Backup e restauração

```powershell
npm run db:backup
```

Gera dump consistente de tabelas InnoDB em `backups/`, ignorado pelo Git. O script transmite o dump diretamente para arquivo e usa credenciais internas do contêiner, sem colocá-las na linha de comando. Arquivo `.partial` não é backup concluído.

Restauração deve ser feita primeiro em **outra instância/schema de teste**, conferindo origem e destino. O dump inclui CREATE DATABASE/USE e DROP/CREATE das tabelas: restaurá-lo sobre a instância em uso substitui dados. Não há comando de restauração automática apontado ao banco principal.

No desenvolvimento Linux, um exemplo de importação num contêiner de teste já iniciado é:

```bash
# Escolher explicitamente o destino de teste antes de executar.
docker compose -p fitin-verification exec -T mysql sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" exec mysql -uroot' < backups/arquivo.sql
```

No PowerShell, evitar pipelines que reinterpretem o encoding do dump. Pode-se copiar o arquivo com `docker cp` para o contêiner de teste e redirecionar dentro dele. Após restaurar, conferir versão, contagens, constraints, histórico de migrações e endpoints.

Volume não substitui backup; dump local não substitui política de retenção e cópia externa em produção.

## Revisão do modelo e fronteiras desta entrega

- As 38 tabelas já existem para revisão, inclusive pipeline/IA futuras. Isso não significa que os processos correspondentes estejam implementados.
- `foods` inclui `product_line`, `flavor` e `presentation` opcionais para identificar melhor os industrializados. Identidade de embalagem/GTIN múltiplo pode ganhar tabela própria após validar requisitos; não tratar todos os sabores de uma marca como o mesmo produto.
- FKs compostas reforçam tipos de registros, versão/identidade de alimento e propriedade da decisão de IA. Não substituem autorização por usuário.
- CHECKs cobrem valores, campos pareados, estados e consistência de energia. CHECK aceita NULL em campos opcionais; isso é intencional.
- Ciclos de fusão de produtos, acesso a produto privado, pelo menos um item por refeição, exatamente um subtipo por registro, não sobreposição de planos e transições de revisão dependem de serviços transacionais ainda a implementar.
- Versões e snapshots devem ser imutáveis nos futuros serviços. O usuário técnico DML não representa autenticação de usuário final nem isolamento por linha.
- A conta `fitin_app` tem DML no schema, sem DDL. Administração e migrações usam outra credencial. Produção precisará de política de acesso e conexão TLS adequada ao provedor.
- Consistência de custos/moeda, expurgo de entrada de IA, locks de processamento e motivos de revisão estão previstos no banco; workers, retenção e controles de orçamento ainda não estão ativos.
- Evitar joins diretos de múltiplas coleções 1:N ao calcular a home: somar alimentação e atividades separadamente antes de juntar.

## Verificação

Com o MySQL e seeds prontos:

```powershell
npm run backend:build
npm run test:database
npm run build
```

Os testes de banco usam MySQL real e desfazem os dados de teste; verificam FKs, CHECKs, duplicidade, porções, NULL, snapshots históricos, energia ativa, vínculos de IA, rollback transacional e permissões sem DDL. Eles pressupõem o seed de referência inicial; não apontar para produção. Nesta etapa, não demonstram autenticação nem autorização de endpoints de negócio, pois ainda não existem.
