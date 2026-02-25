

# Plan: Auditoria, Correcao e Migracao AnesIA Quick Consult

## Vista Geral

5 blocos principais: (A) Quick access + NAV_ITEMS unificado, (B) Pagina /preanest MVP, (C) Migracao para database, (D) Melhorias extras, (E) Linguas (ja feito).

---

## A. Quick Access e Navegacao Unificada

### A1. Corrigir 1o botao

O 1o botao do quick access aponta para `/` (a propria Home). Mudar para um `button` que faz scroll suave ate `proceduresRef`, limpa pesquisa activa e foca a lista.

### A2. NAV_ITEMS centralizado

Criar `src/config/nav.ts` com um unico array:

```text
{ key, to, icon, quickAccess, order }
```

Items:
1. home (/) - quickAccess: true (scroll especial na Home)
2. guidelines (/guidelines) - quickAccess: true
3. alr (/alr) - quickAccess: true
4. calculateurs (/calculateurs) - quickAccess: true
5. protocoles (/protocoles) - quickAccess: true
6. preanest (/preanest) - quickAccess: true (NOVO)
7. admin (/admin-content) - quickAccess: false

Usar este array em:
- `AppLayout.tsx` (header + mobile menu)
- `Index.tsx` (quick access cards)

### A3. Acessibilidade

- Adicionar `aria-label` aos botoes quick access
- Garantir wrap correcto em mobile (ja e `grid grid-cols-2`)
- Hover/active/pressed com `active:scale-95`

**Ficheiros**: `src/config/nav.ts` (criar), `src/components/anesia/AppLayout.tsx`, `src/pages/Index.tsx`

---

## B. Pagina /preanest (MVP)

### B1. Rota

Adicionar `/preanest` em `App.tsx` com novo componente `PreAnest.tsx`.

### B2. UI do formulario

Pagina com formulario dividido em 2 seccoes:

**Doente** (sem dados identificaveis):
- Idade (anos), sexo, peso (kg), altura (cm)
- ASA (select: I, II, III, IV, V)
- Comorbilidades: checkboxes (HTA, diabetes, SAOS, obesidade IMC>35, cardiopatia, IRC, hepatopatia, asma/DPOC) + campo livre
- Via aerea: Mallampati (I-IV select), abertura oral (normal/limitada), mobilidade cervical (normal/limitada)
- Anticoagulacao (select: nenhuma, aspirina, clopidogrel, DOAC, AVK, HBPM, dupla antiagregacao)
- Alergias (texto livre)

**Cirurgia**:
- Seleccionar procedimento da lista existente (combobox com pesquisa Fuse)
- OU especialidade + tipo manual
- Contexto: ambulatorio / internamento / urgencia (radio)

### B3. Motor de regras

Criar `src/lib/preanest-rules.ts` com funcao `generateRecommendations(input)`:

Regras deterministicas baseadas em:
- ASA >= 3: alertas pre-op, considerar consulta especializada
- SAOS: tubo armado, posicao, monitorizacao pos-op
- Obesidade: doses ajustadas ao peso ideal, VAD provavel
- Anticoagulacao: quando suspender, bridging
- Cirurgia maior vs menor: nivel de monitorizacao
- Ambulatorio: criterios de alta, NVPO profilaxia
- Urgencia: estomago cheio, ISR

Output em 4 blocos:
1. Pre-op (exames, jejum, medicacao)
2. Intra-op (plano anestesico, airway, monitorizacao, profilaxias)
3. Pos-op (analgesia, NVPO, tromboprofilaxia, criterios de alta)
4. Red flags / quando pedir ajuda senior

### B4. Persistencia

Guardar ultimo caso em `localStorage` (`anesia-preanest-last`) para repetir rapidamente.

### B5. i18n

Adicionar ~30 novas chaves em `LanguageContext.tsx` para a pagina /preanest.

**Ficheiros**: `src/pages/PreAnest.tsx` (criar), `src/lib/preanest-rules.ts` (criar), `src/App.tsx`, `src/config/nav.ts`, `src/contexts/LanguageContext.tsx`

---

## C. Migracao para Database (Supabase)

### C1. Tabelas (migracao SQL)

Criar 5 tabelas com RLS de leitura publica:

**procedures**
- id text PRIMARY KEY
- specialty text NOT NULL
- titles jsonb NOT NULL
- synonyms jsonb DEFAULT '{}'
- content jsonb NOT NULL (inclui quick/deep)
- tags jsonb DEFAULT '[]'
- created_at, updated_at timestamps

**drugs**
- id text PRIMARY KEY
- names jsonb NOT NULL
- class text
- dosing jsonb NOT NULL (dose_rules, concentrations)
- notes jsonb DEFAULT '{}'
- contraindications jsonb DEFAULT '[]'
- tags jsonb DEFAULT '[]'
- created_at, updated_at timestamps

**guidelines**
- id text PRIMARY KEY
- category text NOT NULL
- titles jsonb NOT NULL
- items jsonb NOT NULL
- references jsonb DEFAULT '[]'
- tags jsonb DEFAULT '[]'
- created_at, updated_at timestamps

**protocoles**
- id text PRIMARY KEY
- category text NOT NULL
- titles jsonb NOT NULL
- steps jsonb NOT NULL
- references jsonb DEFAULT '[]'
- tags jsonb DEFAULT '[]'
- created_at, updated_at timestamps

**alr_blocks**
- id text PRIMARY KEY
- region text NOT NULL
- titles jsonb NOT NULL
- indications jsonb DEFAULT '{}'
- contraindications jsonb DEFAULT '{}'
- technique jsonb DEFAULT '{}'
- drugs jsonb DEFAULT '{}'
- tags jsonb DEFAULT '[]'
- created_at, updated_at timestamps

### C2. RLS

- SELECT publico (para utilizadores anonimos -- app publica)
- INSERT/UPDATE/DELETE apenas para admins (via `has_role()`)
- Criar tabela `user_roles` com enum `app_role`

### C3. Seed

Criar edge function `seed-data` que importa os JSON existentes para as tabelas. Executar uma vez.

Alternativa mais simples: usar INSERT directo via migration com os dados dos JSON.

### C4. DataContext com fallback

Actualizar `DataContext.tsx`:

```text
1. Tentar carregar de Supabase (select * from procedures, etc.)
2. Se erro de rede ou tabela vazia: fallback para JSON local
3. Cache em estado React (ja existe)
4. Loading states (ja existe)
5. Erro amigavel (ja existe)
```

Manter os mesmos tipos TypeScript -- a estrutura jsonb mapeia directamente.

### C5. Pesquisa Fuse

Fuse.js continua a funcionar igual -- recebe o array de objectos independentemente da fonte.

**Ficheiros**: Migration SQL, `src/contexts/DataContext.tsx`, edge function seed (opcional)

---

## D. Melhorias Extras

### D1. Favoritos/Recentes (ja maioritariamente implementado)

Confirmar que tudo funciona:
- Stats clicaveis com scroll (ja feito)
- "Limpar recentes" (ja feito)
- "So favoritos" toggle (ja feito)
- Estrela no ProcedureCard (ja feito)
- Empty state favoritos (ja feito)

### D2. Guidelines/Protocoles/ALR da BD

As paginas ja funcionam com dados do DataContext. Ao mudar DataContext para ler da BD, estas paginas passam automaticamente a ler da BD sem alteracao.

### D3. Recomendacoes nas cirurgias

Na `ProcedurePage.tsx`, adicionar seccao "Recomendacoes" no tab Detail:
- Consultar guidelines da BD por tags/categoria matching com a especialidade da cirurgia
- Mostrar Top 3 recomendacoes relevantes com link para a guideline completa

**Ficheiros**: `src/pages/ProcedurePage.tsx`

### D4. Linguas

Ja implementado: FR -> EN -> PT no switcher e fallback. Nada a alterar.

---

## Resumo de Ficheiros

| Ficheiro | Accao |
|----------|-------|
| `src/config/nav.ts` | Criar -- NAV_ITEMS centralizado |
| `src/components/anesia/AppLayout.tsx` | Modificar -- usar NAV_ITEMS de config |
| `src/pages/Index.tsx` | Modificar -- quick access usa NAV_ITEMS, 1o botao faz scroll |
| `src/pages/PreAnest.tsx` | Criar -- formulario + output do motor de regras |
| `src/lib/preanest-rules.ts` | Criar -- motor de regras deterministico |
| `src/App.tsx` | Modificar -- adicionar rota /preanest |
| `src/contexts/LanguageContext.tsx` | Modificar -- ~30 novas chaves i18n |
| `src/contexts/DataContext.tsx` | Modificar -- carregar de Supabase com fallback JSON |
| `src/pages/ProcedurePage.tsx` | Modificar -- seccao Recomendacoes |
| Migration SQL | Criar -- 5 tabelas + RLS + seed |

## Sequencia de Implementacao

1. Criar tabelas na database (migration SQL com seed dos JSON)
2. Criar `src/config/nav.ts` e actualizar AppLayout + Index
3. Actualizar DataContext para ler da BD com fallback
4. Criar pagina /preanest com motor de regras
5. Adicionar seccao Recomendacoes na ProcedurePage
6. Adicionar todas as chaves i18n

## O que NAO muda
- JSON files em `public/data/` -- mantidos como fallback
- `ETTCalculator.tsx`, `IntubationGuide.tsx`, `DrugDoseRow.tsx`
- `ett.ts`, `dose.ts`, `dilution.ts`
- `LanguageSwitcher.tsx` (ja correcto)
- Componentes UI base (button, card, badge, etc.)

## Testes Manuais
1. Quick access: verificar que o 1o botao faz scroll para a lista e que a ordem e coerente com o header
2. /preanest: preencher formulario com ASA III + SAOS e verificar que as recomendacoes aparecem nos 4 blocos
3. Database: verificar que procedures/guidelines carregam da BD; desligar BD e confirmar fallback JSON
4. Recomendacoes: abrir uma cirurgia e verificar que aparecem guidelines relevantes no tab Detail

