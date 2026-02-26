# Revisão extensa do módulo `kie-ai`

Data: 2026-02-24
Escopo revisado: `kie-ai/server.py`, `kie-ai/kie_api.py`, `kie-ai/frontend/*`, `kie-ai/KIE_API_REFERENCE.md`.

## Resumo executivo

O módulo está funcional e cobre um conjunto amplo de integrações (Market, MJ, Suno, Veo, GPT-4o Image e Flux Kontext), mas há pontos importantes de robustez e segurança para produção.

Nesta rodada, foram aplicadas **2 correções de alto impacto**:
1. Hardening no endpoint de arquivos estáticos para bloquear path traversal.
2. Remoção segura de arquivos temporários para evitar mascaramento de erro principal por falha de cleanup.

## Correções aplicadas nesta revisão

### 1) Proteção contra path traversal em `/static/{filename:path}`

**Problema**: o caminho era montado com concatenação relativa e apenas checava existência/arquivo. Isso poderia permitir tentativa de acesso fora de `frontend/` usando `..`.

**Correção**: validação via `resolve()` + verificação de pertencimento ao diretório base, retornando `403` para caminhos inválidos.

**Impacto**: reduz risco de exposição indevida de arquivos locais.

### 2) Cleanup resiliente para arquivos temporários

**Problema**: `os.unlink(tmp_path)` em `finally` sem proteção pode lançar exceção e sobrescrever o erro original da operação principal.

**Correção**: helper `_safe_unlink()` com tratamento de `FileNotFoundError` e log em falhas inesperadas.

**Impacto**: melhora diagnósticos e evita erro secundário mascarando causa raiz.

## Achados técnicos (priorizados)

## P0/P1 (alta prioridade)

1. **CORS permissivo para produção**
   - `allow_origins=["*"]` com `allow_credentials=True` é configuração perigosa para ambiente aberto.
   - Recomendação: restringir origens por variável de ambiente e desativar `credentials` quando não necessário.

2. **Ausência de autenticação/controle interno no FastAPI do módulo**
   - O módulo expõe endpoints de criação de task, upload e consulta sem camada própria de auth/rate limit.
   - Se acessível além do proxy interno, pode haver abuso de créditos.
   - Recomendação: token interno (header), validação de origem no proxy e rate limit por IP/tenant.

3. **Tratamento de erro heterogêneo entre endpoints**
   - Há `_validate_api_response` apenas em alguns fluxos.
   - Como a API upstream pode retornar erro no corpo com HTTP 200, há risco de frontend interpretar sucesso falso.
   - Recomendação: normalizar validação em todos os endpoints que falam com KIE.

## P2 (média prioridade)

4. **Timeouts grandes sem retry/backoff padronizado**
   - Chamadas de 180s/300s em upload e geração podem degradar worker sob load.
   - Recomendação: retries curtos para falhas transitórias, circuit-breaker e timeouts por endpoint.

5. **Persistência de histórico simples (JSON local) sem lock explícito**
   - Em concorrência alta pode haver condição de corrida em leitura/escrita.
   - Recomendação: lock de arquivo, sqlite leve ou backend persistente compartilhado.

6. **Logs sem correlação estruturada**
   - Falta `request_id`/`task_id` consistente nos logs de erro.
   - Recomendação: middleware de correlação + logging JSON.

## P3 (baixa prioridade / melhoria)

7. **Duplicação de padrões de upload temporário**
   - Muitos endpoints repetem o fluxo temp file + upload.
   - Recomendação: fatorar helper único para reduzir superfície de bug.

8. **Cobertura de testes automatizados limitada**
   - Não foram encontrados testes dedicados ao módulo `kie-ai`.
   - Recomendação: suíte mínima de testes para validação de schema, sanitização de path e mapeamento de payloads.

## Checklist de arquitetura recomendado (próximos passos)

- [ ] Configurar `ALLOWED_ORIGINS` por ambiente.
- [ ] Exigir auth interna nos endpoints do módulo.
- [ ] Unificar validação de respostas upstream com função única.
- [ ] Adicionar testes automatizados de API (pytest + TestClient).
- [ ] Implementar lock/persistência robusta para histórico.

## Conclusão

O módulo está bem avançado e funcional para operação diária, com boa cobertura de integrações. Após as duas correções aplicadas nesta revisão, o principal ganho foi em segurança de arquivos estáticos e confiabilidade no cleanup de temporários. O próximo ciclo deve priorizar segurança de borda (CORS/auth/rate-limit) e consistência de tratamento de erro para elevar a maturidade de produção.
