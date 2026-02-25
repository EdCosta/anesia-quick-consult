
# Plan: 3 alteracoes no AnesIA

## 1. Landing page -- restaurar scroll natural

**Problema actual**: A pagina Index.tsx usa um mecanismo `hero-transition` / `hero-hidden` que colapsa o hero com `max-height: 0` e `overflow: hidden`, criando uma experiencia "quebrada" de scroll. Alem disso, o `auto-focus` no input forca imediatamente o estado `isSearchActive`, escondendo o hero antes do utilizador interagir.

**Solucao**:
- Remover o comportamento `isSearchActive` que esconde o hero completamente
- Manter a pagina como scroll vertical continuo e natural: Hero -> Quick Access -> Stats -> Favoritos -> Todas as Procedures
- A barra de pesquisa fica no hero (sem estado "collapsed"); quando o utilizador escreve, os resultados filtram a lista em baixo
- Remover as classes CSS `hero-transition`, `hero-visible`, `hero-hidden` do `index.css`
- Remover o header sticky duplicado de pesquisa (linhas 196-219)
- Remover o `auto-focus` que dispara imediatamente a transicao
- Manter o Enter -> primeiro resultado e o filtro por especialidade
- Corrigir bug: `navigate(/procedure/${id})` deve ser `navigate(/p/${id})` (a rota definida e `/p/:id`)

**Ficheiros**: `src/pages/Index.tsx`, `src/index.css`

## 2. Ordem de linguas: FR -> EN -> PT

**Alteracoes**:
- `src/components/anesia/LanguageSwitcher.tsx`: mudar `LANGS` de `['fr', 'pt', 'en']` para `['fr', 'en', 'pt']`
- `src/contexts/LanguageContext.tsx`: mudar a cadeia de fallback de `fr -> pt -> en` para `fr -> en -> pt` nas funcoes `t()`, `resolve()`, `resolveStr()`

**Ficheiros**: `src/components/anesia/LanguageSwitcher.tsx`, `src/contexts/LanguageContext.tsx`

## 3. Bloco IOT/Intubacao intra-op + calculadora ETT

### 3a. Componente IntubationGuide

Criar `src/components/anesia/IntubationGuide.tsx`:
- Accordion/card que mostra "IOT / Intubacao (guia rapido)"
- Conteudo estatico traduzido (FR/EN/PT) com:
  - Checklist curta: posicao, pre-oxigenacao, plano A/B, material
  - Tipo de tubo (cuffado preferido em pediatria, armado quando relevante)
  - Regras pediatricas:
    - ETT cuffado ID = (idade/4) + 3.5
    - ETT nao cuffado ID = (idade/4) + 4.0
    - Profundidade oral = 3 x ID ou (idade/2) + 12
    - Nasal: +2 a +3 cm
    - Pressao cuff: 20-25 cmH2O
  - Tabela neonato/lactente (termo 3-3.5kg, 3-4kg, 5-8kg, 8-10kg)
  - Regras adulto:
    - Mulher: 7.0-7.5 (6.5 se baixa/VAD, 7.5 se alta)
    - Homem: 7.5-8.0 (8.5 se alto e robusto)
    - Profundidade: Mulher ~20-21cm, Homem ~22-23cm, ajustar por altura
  - Laminas Mac/Miller e mascara laringea (resumo curto)
  - Nota sobre tubo armado (prona, cervical, ORL)

### 3b. Calculadora ETT

Criar `src/components/anesia/ETTCalculator.tsx`:
- Inputs opcionais: idade (anos/meses), peso (kg), altura (cm), sexo (adulto)
- Output: sugestao ETT ID (+/- 0.5), profundidade aproximada, lamina sugerida, mascara laringea
- Logica local pura (sem backend), funcao `calculateETT()` em `src/lib/ett.ts`
- Aviso permanente: "Confirmar clinicamente e por capnografia; ajustar ao doente."
- Todas as labels traduzidas FR/EN/PT

### 3c. Integracao na ProcedurePage

- Na tab "Intra-op" da `ProcedurePage.tsx`, adicionar o componente `IntubationGuide` como subseccao fixa abaixo dos bullets intra-op
- Incluir a calculadora ETT inline (accordion expansivel)

### 3d. Integracao na pagina Calculateurs

- Adicionar um card "Calculateur ETT / Intubation" na pagina Calculateurs com status "Disponivel"
- Ao clicar, expandir ou abrir a calculadora ETT inline

### 3e. Traducoes

Adicionar novas chaves em `LanguageContext.tsx`:
- `intubation_guide`: "IOT / Intubation (guide rapide)" / "IOT / Intubation (quick guide)" / "IOT / Intubacao (guia rapido)"
- `ett_calculator`: "Calculateur ETT" / "ETT Calculator" / "Calculadora ETT"
- `age_years`, `age_months`, `height_cm`, `sex`, `male`, `female`
- `ett_cuffed`, `ett_uncuffed`, `oral_depth`, `nasal_depth`, `blade_size`, `lma_size`
- `ett_result`, `ett_disclaimer`
- `pediatric`, `adult`, `neonate`
- `cuff_pressure`, `armed_tube`
- Etc. (environ 25 chaves novas)

## Resume dos ficheiros

| Ficheiro | Accao |
|----------|-------|
| `src/pages/Index.tsx` | Modificar -- remover hero collapse, scroll natural, corrigir rota |
| `src/index.css` | Modificar -- remover classes hero-transition/hidden/visible |
| `src/components/anesia/LanguageSwitcher.tsx` | Modificar -- ordem FR EN PT |
| `src/contexts/LanguageContext.tsx` | Modificar -- fallback FR->EN->PT + novas chaves |
| `src/lib/ett.ts` | Criar -- funcao calculateETT() |
| `src/components/anesia/IntubationGuide.tsx` | Criar -- bloco IOT com conteudo clinico |
| `src/components/anesia/ETTCalculator.tsx` | Criar -- calculadora ETT interactiva |
| `src/pages/ProcedurePage.tsx` | Modificar -- integrar IntubationGuide no intra-op |
| `src/pages/Calculateurs.tsx` | Modificar -- adicionar card ETT Calculator |

## O que NAO muda
- Ficheiros JSON (`procedures.v3.json`, `drugs.v1.json`) -- sem alteracao de dados clinicos
- `DataContext.tsx`, `DrugDoseRow.tsx`, `DilutionModal.tsx`, `dose.ts`, `dilution.ts`
- `AppLayout.tsx`, `App.tsx`, `Section.tsx`, `ProcedureCard.tsx`

## Testes manuais recomendados
1. Scroll na landing: verificar que a pagina desliza naturalmente entre hero, quick access, stats, favoritos e procedures
2. Pesquisa: escrever no campo, verificar filtro, premir Enter e confirmar navegacao para `/p/:id`
3. Linguas: verificar que o selector mostra FR EN PT nessa ordem, e que o fallback funciona (ex: se PT nao tem traducao, usa EN)
4. IOT/Intubacao: abrir uma procedure, ir ao tab Intra-op, verificar que o bloco IOT aparece com conteudo correcto
5. Calculadora ETT: introduzir idade 5 anos -> verificar ETT 4.75mm cuffado, profundidade ~14cm; introduzir homem 180cm -> verificar ETT 8.0, prof ~23cm
