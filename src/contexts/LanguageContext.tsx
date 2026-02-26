import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Lang = "fr" | "pt" | "en";

const UI: Record<string, Record<Lang, string>> = {
  search_placeholder: {
    fr: "Rechercher une chirurgie...",
    pt: "Pesquisar uma intervenção...",
    en: "Search a surgery...",
  },
  favorites: { fr: "⭐ Favoris", pt: "⭐ Favoritos", en: "⭐ Favorites" },
  recents: { fr: "🕘 Récents", pt: "🕘 Recentes", en: "🕘 Recents" },
  results: { fr: "🔎 Résultats", pt: "🔎 Resultados", en: "🔎 Results" },
  all_specialties: { fr: "Toutes", pt: "Todas", en: "All" },
  all_procedures: {
    fr: "Toutes les procédures",
    pt: "Todas as intervenções",
    en: "All procedures",
  },
  preop: { fr: "Pré-opératoire", pt: "Pré-operatório", en: "Pre-operative" },
  intraop: {
    fr: "Intra-opératoire",
    pt: "Intra-operatório",
    en: "Intra-operative",
  },
  postop: {
    fr: "Post-opératoire",
    pt: "Pós-operatório",
    en: "Post-operative",
  },
  red_flags: { fr: "🚩 Red Flags", pt: "🚩 Red Flags", en: "🚩 Red Flags" },
  drugs_doses: {
    fr: "💊 Médicaments & Doses",
    pt: "💊 Medicamentos & Doses",
    en: "💊 Drugs & Doses",
  },
  weight_kg: { fr: "Poids (kg)", pt: "Peso (kg)", en: "Weight (kg)" },
  court: {
    fr: "Court & clinique",
    pt: "Curto & clínico",
    en: "Quick & clinical",
  },
  detail: {
    fr: "Détail scientifique",
    pt: "Detalhe científico",
    en: "Scientific detail",
  },
  clinical_notes: {
    fr: "📋 Notes cliniques",
    pt: "📋 Notas clínicas",
    en: "📋 Clinical notes",
  },
  pitfalls: {
    fr: "⚠️ Pièges & erreurs",
    pt: "⚠️ Armadilhas & erros",
    en: "⚠️ Pitfalls & errors",
  },
  references_title: {
    fr: "📚 Références",
    pt: "📚 Referências",
    en: "📚 References",
  },
  disclaimer: {
    fr: "Support éducatif. Suivre protocoles locaux et jugement clinique.",
    pt: "Suporte educativo. Seguir protocolos locais e julgamento clínico.",
    en: "Educational support. Follow local protocols and clinical judgment.",
  },
  no_favorites: {
    fr: "Aucun favori pour le moment",
    pt: "Sem favoritos de momento",
    en: "No favorites yet",
  },
  no_recents: {
    fr: "Aucune consultation récente",
    pt: "Sem consultas recentes",
    en: "No recent views",
  },
  no_results: {
    fr: "Aucun résultat trouvé",
    pt: "Nenhum resultado encontrado",
    en: "No results found",
  },
  admin_title: {
    fr: "Gestion du contenu",
    pt: "Gestão de conteúdo",
    en: "Content Management",
  },
  back: { fr: "Retour", pt: "Voltar", en: "Back" },
  dose_calc: {
    fr: "Dose calculée",
    pt: "Dose calculada",
    en: "Calculated dose",
  },
  max_dose: { fr: "Dose max", pt: "Dose máx", en: "Max dose" },
  volume: { fr: "Volume", pt: "Volume", en: "Volume" },
  protocol_local: {
    fr: "À définir selon protocole local",
    pt: "A definir segundo protocolo local",
    en: "Define per local protocol",
  },
  route_label: { fr: "Voie", pt: "Via", en: "Route" },
  concentration: {
    fr: "Concentration",
    pt: "Concentração",
    en: "Concentration",
  },
  contraindications: {
    fr: "⛔ Contre-indications",
    pt: "⛔ Contra-indicações",
    en: "⛔ Contraindications",
  },
  renal_hepatic: {
    fr: "🫘 Ajustement rénal/hépatique",
    pt: "🫘 Ajuste renal/hepático",
    en: "🫘 Renal/hepatic adjustment",
  },
  enter_weight: {
    fr: "Entrer le poids pour calculer les doses",
    pt: "Introduzir peso para calcular doses",
    en: "Enter weight to calculate doses",
  },
  loading: { fr: "Chargement...", pt: "A carregar...", en: "Loading..." },
  home: { fr: "Accueil", pt: "Início", en: "Home" },
  admin: {
    fr: "Gestion contenu",
    pt: "Gestão conteúdo",
    en: "Content mgmt",
  },
  mg_per_kg: { fr: "mg/kg", pt: "mg/kg", en: "mg/kg" },
  select_concentration: {
    fr: "Choisir concentration",
    pt: "Escolher concentração",
    en: "Select concentration",
  },
  guidelines: { fr: "Guidelines", pt: "Guidelines", en: "Guidelines" },
  guidelines_desc: {
    fr: "Recommandations et bonnes pratiques",
    pt: "Recomendações e boas práticas",
    en: "Recommendations and best practices",
  },
  alr: { fr: "ALR", pt: "ALR", en: "ALR" },
  alr_full: {
    fr: "Anesthésie Loco-Régionale",
    pt: "Anestesia Loco-Regional",
    en: "Regional Anesthesia",
  },
  calculateurs: { fr: "Calculateurs", pt: "Calculadoras", en: "Calculators" },
  calculateurs_desc: {
    fr: "Outils de calcul de doses et scores",
    pt: "Ferramentas de cálculo de doses e scores",
    en: "Dose and score calculation tools",
  },
  protocoles: { fr: "Protocoles", pt: "Protocolos", en: "Protocols" },
  protocoles_desc: {
    fr: "Checklists et protocoles standardisés",
    pt: "Checklists e protocolos padronizados",
    en: "Standardized checklists and protocols",
  },
  coming_soon: { fr: "À venir", pt: "Em breve", en: "Coming soon" },
  quick_access: {
    fr: "Accès rapide",
    pt: "Acesso rápido",
    en: "Quick access",
  },
  tagline: {
    fr: "Votre assistant d'anesthésie",
    pt: "O seu assistente de anestesia",
    en: "Your anesthesia assistant",
  },
  available: { fr: "Disponible", pt: "Disponível", en: "Available" },
  procedures_title: {
    fr: "Procédures",
    pt: "Intervenções",
    en: "Procedures",
  },

  // Dilution keys
  dilution_title: {
    fr: "Préparer une dilution",
    pt: "Preparar uma diluição",
    en: "Prepare a dilution",
  },
  stock_concentration: {
    fr: "Concentration stock (mg/mL)",
    pt: "Concentração stock (mg/mL)",
    en: "Stock concentration (mg/mL)",
  },
  target_concentration: {
    fr: "Concentration cible (mg/mL)",
    pt: "Concentração alvo (mg/mL)",
    en: "Target concentration (mg/mL)",
  },
  final_volume: {
    fr: "Volume final (mL)",
    pt: "Volume final (mL)",
    en: "Final volume (mL)",
  },
  syringe_size: {
    fr: "Taille seringue",
    pt: "Tamanho da seringa",
    en: "Syringe size",
  },
  desired_dose: {
    fr: "Dose souhaitée (mg)",
    pt: "Dose desejada (mg)",
    en: "Desired dose (mg)",
  },
  prepare_dilution: {
    fr: "Préparer dilution",
    pt: "Preparar diluição",
    en: "Prepare dilution",
  },
  volume_unavailable: {
    fr: "Volume : non disponible (concentration non définie)",
    pt: "Volume: não disponível (concentração não definida)",
    en: "Volume: unavailable (concentration not defined)",
  },
  copy_checklist: {
    fr: "Copier checklist",
    pt: "Copiar checklist",
    en: "Copy checklist",
  },
  copied: { fr: "Copié !", pt: "Copiado!", en: "Copied!" },
  warning: { fr: "Attention", pt: "Atenção", en: "Warning" },
  data_load_error: {
    fr: "Erreur de chargement des données",
    pt: "Erro ao carregar dados",
    en: "Failed to load data",
  },
  dilution_draw: {
    fr: "Prélever",
    pt: "Aspirar",
    en: "Draw",
  },
  dilution_add_diluent: {
    fr: "de diluant",
    pt: "de diluente",
    en: "of diluent",
  },
  dilution_result_label: {
    fr: "Résultat",
    pt: "Resultado",
    en: "Result",
  },
  dilution_of_drug: {
    fr: "de produit",
    pt: "de produto",
    en: "of drug",
  },
  dilution_at_conc: {
    fr: "à",
    pt: "a",
    en: "at",
  },
  or: { fr: "ou", pt: "ou", en: "or" },
  clear_filters: { fr: "Réinitialiser", pt: "Limpar filtros", en: "Clear filters" },
  choose_specialties: { fr: "Choisir spécialités", pt: "Escolher especialidades", en: "Choose specialties" },
  search_specialties: { fr: "Rechercher...", pt: "Pesquisar...", en: "Search..." },
  clear: { fr: "Effacer", pt: "Limpar", en: "Clear" },
  apply: { fr: "Appliquer", pt: "Aplicar", en: "Apply" },
  close: { fr: "Fermer", pt: "Fechar", en: "Close" },

  // Advanced weight mode
  advanced_mode: { fr: "Avancé", pt: "Avançado", en: "Advanced" },
  bmi: { fr: "IMC", pt: "IMC", en: "BMI" },
  ibw: { fr: "Poids idéal", pt: "Peso ideal", en: "IBW" },
  lbw: { fr: "Masse maigre", pt: "Massa magra", en: "LBW" },
  adjbw: { fr: "Poids ajusté", pt: "Peso ajustado", en: "AdjBW" },
  dose_rationale: { fr: "Pourquoi cette dose ?", pt: "Porquê esta dose?", en: "Why this dose?" },
  titrate_to_effect: { fr: "Titrer à l'effet", pt: "Titular ao efeito", en: "Titrate to effect" },
  scalar_used: { fr: "Escalateur", pt: "Escalador", en: "Scalar" },
  validate_clinically: { fr: "Valider cliniquement et ajuster au doente.", pt: "Validar clinicamente e ajustar ao doente.", en: "Validate clinically and adjust to patient." },
  enter_height_sex: { fr: "Entrer taille et sexe pour les poids dérivés", pt: "Introduzir altura e sexo para os pesos derivados", en: "Enter height and sex for derived weights" },
  import_procedures: { fr: "Importer procédures", pt: "Importar procedimentos", en: "Import procedures" },
  import_preview: { fr: "Aperçu", pt: "Pré-visualização", en: "Preview" },
  import_run: { fr: "Importer", pt: "Importar", en: "Import" },
  import_success: { fr: "Importation réussie", pt: "Importação concluída", en: "Import successful" },
  import_failed: { fr: "Erreurs d'importation", pt: "Erros de importação", en: "Import errors" },
  hospital_profile: { fr: "Profil hôpital", pt: "Perfil hospital", en: "Hospital profile" },
  upload_csv: { fr: "Télécharger CSV", pt: "Carregar CSV", en: "Upload CSV" },
  rows_parsed: { fr: "Lignes analysées", pt: "Linhas analisadas", en: "Rows parsed" },
  select_profile: { fr: "Choisir profil", pt: "Escolher perfil", en: "Select profile" },

  // ETT / Intubation keys
  intubation_guide: {
    fr: "IOT / Intubation (guide rapide)",
    en: "IOT / Intubation (quick guide)",
    pt: "IOT / Intubação (guia rápido)",
  },
  ett_calculator: {
    fr: "Calculateur ETT - Pediatrique",
    pt: "Calculadora ETT - Pediatrico",
    en: "ETT Calculator - Pediatric",
  },
  age_years: { fr: "Âge (années)", en: "Age (years)", pt: "Idade (anos)" },
  age_months: { fr: "Âge (mois)", en: "Age (months)", pt: "Idade (meses)" },
  height_cm: { fr: "Taille (cm)", en: "Height (cm)", pt: "Altura (cm)" },
  sex: { fr: "Sexe", en: "Sex", pt: "Sexo" },
  male: { fr: "Homme", en: "Male", pt: "Homem" },
  female: { fr: "Femme", en: "Female", pt: "Mulher" },
  ett_cuffed: { fr: "ETT cuffé", en: "Cuffed ETT", pt: "ETT cuffado" },
  ett_uncuffed: { fr: "ETT non cuffé", en: "Uncuffed ETT", pt: "ETT não cuffado" },
  oral_depth: { fr: "Prof. orale", en: "Oral depth", pt: "Prof. oral" },
  nasal_depth: { fr: "Prof. nasale", en: "Nasal depth", pt: "Prof. nasal" },
  blade_size: { fr: "Lame", en: "Blade", pt: "Lâmina" },
  lma_size: { fr: "ML (taille)", en: "LMA (size)", pt: "ML (tamanho)" },
  ett_result: { fr: "Résultat", en: "Result", pt: "Resultado" },
  ett_disclaimer: {
    fr: "Confirmer cliniquement et par capnographie. Ajuster au patient. Outil éducatif uniquement.",
    en: "Confirm clinically and with capnography. Adjust to patient. Educational tool only.",
    pt: "Confirmar clinicamente e por capnografia. Ajustar ao doente. Ferramenta educativa apenas.",
  },
  pediatric: { fr: "Pédiatrique", en: "Pediatric", pt: "Pediátrico" },
  adult: { fr: "Adulte", en: "Adult", pt: "Adulto" },
  neonate: { fr: "Néonatal / Nourrisson", en: "Neonate / Infant", pt: "Neonatal / Lactente" },
  cuff_pressure: { fr: "Pression cuff", en: "Cuff pressure", pt: "Pressão cuff" },
  armed_tube: { fr: "Tube armé", en: "Reinforced tube", pt: "Tubo armado" },
  adjust_small_child: {
    fr: "Enfant petit pour l'âge : taille réduite de 0.5 mm",
    en: "Child small for age: size reduced by 0.5 mm",
    pt: "Criança pequena para a idade: tamanho reduzido 0.5 mm",
  },
  adjust_large_child: {
    fr: "Enfant grand pour l'âge : taille augmentée de 0.5 mm",
    en: "Child large for age: size increased by 0.5 mm",
    pt: "Criança grande para a idade: tamanho aumentado 0.5 mm",
  },

  // Warnings for dilution
  warning_invalid_stock: {
    fr: "Concentration stock invalide",
    pt: "Concentração stock inválida",
    en: "Invalid stock concentration",
  },
  warning_no_volume: {
    fr: "Volume final requis",
    pt: "Volume final necessário",
    en: "Final volume required",
  },
  warning_no_target: {
    fr: "Concentration cible ou dose requise",
    pt: "Concentração alvo ou dose necessária",
    en: "Target concentration or dose required",
  },
  warning_target_exceeds_stock: {
    fr: "La concentration cible dépasse le stock",
    pt: "Concentração alvo excede o stock",
    en: "Target concentration exceeds stock",
  },
  warning_drug_exceeds_volume: {
    fr: "Le volume de produit dépasse le volume final",
    pt: "O volume de produto excede o volume final",
    en: "Drug volume exceeds final volume",
  },
  warning_negative_diluent: {
    fr: "Volume de diluant négatif",
    pt: "Volume de diluente negativo",
    en: "Negative diluent volume",
  },
  warning_exceeds_syringe: {
    fr: "Le volume final dépasse la seringue",
    pt: "O volume final excede a seringa",
    en: "Final volume exceeds syringe",
  },

  // Favorites & recents
  no_favorites_hint: {
    fr: "Marque tes chirurgies fréquentes",
    pt: "Marca as tuas cirurgias frequentes",
    en: "Mark your frequent surgeries",
  },
  no_favorites_empty: {
    fr: "Aucun favori pour le moment",
    pt: "Ainda sem favoritos",
    en: "No favorites yet",
  },
  view_all_procedures: {
    fr: "Voir toutes les procédures",
    pt: "Ver todas as intervenções",
    en: "View all procedures",
  },
  clear_recents: {
    fr: "Effacer récents",
    pt: "Limpar recentes",
    en: "Clear recents",
  },
  favorites_first: {
    fr: "Favoris en premier",
    pt: "Favoritos primeiro",
    en: "Favorites first",
  },
  only_favorites: {
    fr: "⭐ Favoris uniquement",
    pt: "⭐ Só favoritos",
    en: "⭐ Favorites only",
  },
  open_ett_calculator: {
    fr: "Calculateur ETT - Pediatrique",
    pt: "Calculadora ETT - Pediatrico",
    en: "ETT Calculator - Pediatric",
  },

  // PreAnest
  preanest: { fr: "Pré-Anest", pt: "Pré-Anest", en: "Pre-Anest" },
  preanest_desc: {
    fr: "Aide à la consultation pré-anesthésique",
    pt: "Apoio à consulta pré-anestésica",
    en: "Pre-anesthetic consultation support",
  },
  patient: { fr: "Patient", pt: "Doente", en: "Patient" },
  surgery: { fr: "Chirurgie", pt: "Cirurgia", en: "Surgery" },
  comorbidities: { fr: "Comorbidités", pt: "Comorbilidades", en: "Comorbidities" },
  other_comorbidities: { fr: "Autres comorbidités...", pt: "Outras comorbilidades...", en: "Other comorbidities..." },
  comorb_hta: { fr: "HTA", pt: "HTA", en: "Hypertension" },
  comorb_diabetes: { fr: "Diabète", pt: "Diabetes", en: "Diabetes" },
  comorb_saos: { fr: "SAOS", pt: "SAOS", en: "OSA" },
  comorb_obesity: { fr: "Obésité (IMC>35)", pt: "Obesidade (IMC>35)", en: "Obesity (BMI>35)" },
  comorb_cardiopathy: { fr: "Cardiopathie", pt: "Cardiopatia", en: "Heart disease" },
  comorb_renal: { fr: "IRC", pt: "IRC", en: "CKD" },
  comorb_liver: { fr: "Hépatopathie", pt: "Hepatopatia", en: "Liver disease" },
  comorb_respiratory: { fr: "Asthme/BPCO", pt: "Asma/DPOC", en: "Asthma/COPD" },
  mouth_opening: { fr: "Ouverture buccale", pt: "Abertura oral", en: "Mouth opening" },
  cervical_mobility: { fr: "Mobilité cervicale", pt: "Mobilidade cervical", en: "Cervical mobility" },
  normal: { fr: "Normale", pt: "Normal", en: "Normal" },
  limited: { fr: "Limitée", pt: "Limitada", en: "Limited" },
  anticoagulation: { fr: "Anticoagulation", pt: "Anticoagulação", en: "Anticoagulation" },
  anticoag_none: { fr: "Aucune", pt: "Nenhuma", en: "None" },
  anticoag_aspirin: { fr: "Aspirine", pt: "Aspirina", en: "Aspirin" },
  anticoag_clopidogrel: { fr: "Clopidogrel", pt: "Clopidogrel", en: "Clopidogrel" },
  anticoag_doac: { fr: "AOD (DOAC)", pt: "AOD (DOAC)", en: "DOAC" },
  anticoag_avk: { fr: "AVK", pt: "AVK", en: "VKA" },
  anticoag_lmwh: { fr: "HBPM", pt: "HBPM", en: "LMWH" },
  anticoag_dual_antiplatelet: { fr: "Double anti-agrégation", pt: "Dupla antiagregação", en: "Dual antiplatelet" },
  allergies: { fr: "Allergies", pt: "Alergias", en: "Allergies" },
  allergies_placeholder: {
    fr: "Ex: pénicilline, latex...",
    pt: "Ex: penicilina, latex...",
    en: "E.g.: penicillin, latex...",
  },
  select_procedure: { fr: "Procédure chirurgicale", pt: "Procedimento cirúrgico", en: "Surgical procedure" },
  context: { fr: "Contexte", pt: "Contexto", en: "Context" },
  ctx_ambulatory: { fr: "Ambulatoire", pt: "Ambulatório", en: "Ambulatory" },
  ctx_inpatient: { fr: "Internement", pt: "Internamento", en: "Inpatient" },
  ctx_emergency: { fr: "Urgence", pt: "Urgência", en: "Emergency" },
  generate_recommendations: {
    fr: "Générer recommandations",
    pt: "Gerar recomendações",
    en: "Generate recommendations",
  },
  recommendations: { fr: "📋 Recommandations", pt: "📋 Recomendações", en: "📋 Recommendations" },

  // Guidelines / Protocoles / ALR
  search_guidelines: {
    fr: "Rechercher une guideline...",
    pt: "Pesquisar uma guideline...",
    en: "Search guidelines...",
  },
  search_protocoles: {
    fr: "Rechercher un protocole...",
    pt: "Pesquisar um protocolo...",
    en: "Search protocols...",
  },
  search_alr: {
    fr: "Rechercher un bloc...",
    pt: "Pesquisar um bloqueio...",
    en: "Search a block...",
  },
  category: { fr: "Catégorie", pt: "Categoria", en: "Category" },
  steps: { fr: "Étapes", pt: "Passos", en: "Steps" },
  indications: { fr: "Indications", pt: "Indicações", en: "Indications" },
  contraindications_alr: {
    fr: "Contre-indications",
    pt: "Contra-indicações",
    en: "Contraindications",
  },
  technique: { fr: "Technique", pt: "Técnica", en: "Technique" },
  drugs_alr: { fr: "Médicaments", pt: "Medicamentos", en: "Drugs" },
  region: { fr: "Région", pt: "Região", en: "Region" },
  upper_limb: { fr: "Membre supérieur", pt: "Membro superior", en: "Upper limb" },
  lower_limb: { fr: "Membre inférieur", pt: "Membro inferior", en: "Lower limb" },
  trunk: { fr: "Tronc", pt: "Tronco", en: "Trunk" },
  head_neck: { fr: "Tête & Cou", pt: "Cabeça & Pescoço", en: "Head & Neck" },
  all_categories: { fr: "Toutes", pt: "Todas", en: "All" },
  all_regions: { fr: "Toutes", pt: "Todas", en: "All" },
  references_label: { fr: "Références", pt: "Referências", en: "References" },
  safety: { fr: "Sécurité", pt: "Segurança", en: "Safety" },
  emergency: { fr: "Urgence", pt: "Emergência", en: "Emergency" },
  preop_cat: { fr: "Pré-opératoire", pt: "Pré-operatório", en: "Preoperative" },
  airway_cat: { fr: "Voies aériennes", pt: "Via aérea", en: "Airway" },
  hemodynamics: { fr: "Hémodynamique", pt: "Hemodinâmica", en: "Hemodynamics" },
  temperature_cat: { fr: "Température", pt: "Temperatura", en: "Temperature" },
  ponv: { fr: "NVPO", pt: "NVPO", en: "PONV" },
  pain: { fr: "Douleur", pt: "Dor", en: "Pain" },
  fluid: { fr: "Remplissage", pt: "Reposição", en: "Fluid" },
  sign_in_google: { fr: "Se connecter avec Google", pt: "Entrar com Google", en: "Sign in with Google" },
  sign_out: { fr: "Se déconnecter", pt: "Sair", en: "Sign out" },
  sign_in: { fr: "Se connecter", pt: "Entrar", en: "Sign in" },

  // Scores
  stop_bang: { fr: "STOP-BANG (SAOS)", pt: "STOP-BANG (SAOS)", en: "STOP-BANG (OSA)" },
  rcri: { fr: "RCRI / Lee", pt: "RCRI / Lee", en: "RCRI / Lee" },
  apfel: { fr: "Apfel (NVPO)", pt: "Apfel (NVPO)", en: "Apfel (PONV)" },
  caprini: { fr: "Caprini (TEV)", pt: "Caprini (TEV)", en: "Caprini (VTE)" },
  score: { fr: "Score", pt: "Score", en: "Score" },
  risk_low: { fr: "Risque faible", pt: "Risco baixo", en: "Low risk" },
  risk_moderate: { fr: "Risque modéré", pt: "Risco moderado", en: "Moderate risk" },
  risk_high: { fr: "Risque élevé", pt: "Risco elevado", en: "High risk" },
  risk_very_high: { fr: "Risque très élevé", pt: "Risco muito elevado", en: "Very high risk" },
  snore: { fr: "Ronflements", pt: "Roncos", en: "Snoring" },
  tired: { fr: "Fatigue diurne", pt: "Fadiga diurna", en: "Daytime tiredness" },
  observed_apnea: { fr: "Apnée observée", pt: "Apneia observada", en: "Observed apnea" },
  blood_pressure: { fr: "HTA traitée", pt: "HTA tratada", en: "Treated hypertension" },
  bmi_over_35: { fr: "IMC > 35", pt: "IMC > 35", en: "BMI > 35" },
  age_over_50: { fr: "Âge > 50 ans", pt: "Idade > 50 anos", en: "Age > 50" },
  neck_circumference: { fr: "Tour de cou > 40 cm", pt: "Perímetro cervical > 40 cm", en: "Neck circumference > 40 cm" },
  gender_male: { fr: "Sexe masculin", pt: "Sexo masculino", en: "Male gender" },
  high_risk_surgery: { fr: "Chirurgie à haut risque", pt: "Cirurgia de alto risco", en: "High-risk surgery" },
  ischemic_heart: { fr: "Cardiopathie ischémique", pt: "Cardiopatia isquémica", en: "Ischemic heart disease" },
  congestive_heart: { fr: "Insuffisance cardiaque", pt: "Insuficiência cardíaca", en: "Congestive heart failure" },
  cerebrovascular: { fr: "AVC / AIT", pt: "AVC / AIT", en: "Cerebrovascular disease" },
  insulin_therapy: { fr: "Insulinothérapie", pt: "Insulinoterapia", en: "Insulin therapy" },
  creatinine_elevated: { fr: "Créatinine > 2 mg/dL", pt: "Creatinina > 2 mg/dL", en: "Creatinine > 2 mg/dL" },
  female_gender: { fr: "Sexe féminin", pt: "Sexo feminino", en: "Female gender" },
  non_smoker: { fr: "Non-fumeur", pt: "Não fumador", en: "Non-smoker" },
  ponv_history: { fr: "ATCD NVPO / mal des transports", pt: "Hist. NVPO / cinetose", en: "History PONV / motion sickness" },
  postop_opioids: { fr: "Opioïdes post-op", pt: "Opióides pós-op", en: "Post-op opioids" },

  // Pro gating
  pro_feature: { fr: "Fonctionnalité Pro", pt: "Funcionalidade Pro", en: "Pro feature" },
  pro_feature_desc: { fr: "Cette fonctionnalité nécessite un abonnement Pro.", pt: "Esta funcionalidade requer subscrição Pro.", en: "This feature requires a Pro subscription." },
  upgrade_pro: { fr: "Passer à Pro", pt: "Atualizar para Pro", en: "Upgrade to Pro" },

  // Account
  account: { fr: "Compte", pt: "Conta", en: "Account" },
  current_plan: { fr: "Plan actuel", pt: "Plano atual", en: "Current plan" },
  plan_free: { fr: "Free", pt: "Free", en: "Free" },
  plan_pro: { fr: "Pro", pt: "Pro", en: "Pro" },

  // Dose calculator standalone
  dose_calc_title: { fr: "Calculateur de doses", pt: "Calculador de doses", en: "Dose calculator" },
  select_drug: { fr: "Sélectionner un médicament", pt: "Selecionar medicamento", en: "Select a drug" },
  search_drug: { fr: "Rechercher un médicament...", pt: "Pesquisar medicamento...", en: "Search a drug..." },
  no_doses_configured: { fr: "Aucune dose configurée", pt: "Sem doses configuradas", en: "No doses configured" },

  // Caprini labels
  caprini_age_41_60: { fr: "Âge 41-60", pt: "Idade 41-60", en: "Age 41-60" },
  caprini_age_61_74: { fr: "Âge 61-74", pt: "Idade 61-74", en: "Age 61-74" },
  caprini_age_75: { fr: "Âge ≥ 75", pt: "Idade ≥ 75", en: "Age ≥ 75" },
  caprini_minor_surgery: { fr: "Chirurgie mineure", pt: "Cirurgia menor", en: "Minor surgery" },
  caprini_major_surgery: { fr: "Chirurgie majeure (> 45 min)", pt: "Cirurgia maior (> 45 min)", en: "Major surgery (> 45 min)" },
  caprini_bmi_25: { fr: "IMC > 25", pt: "IMC > 25", en: "BMI > 25" },
  caprini_swollen_legs: { fr: "Œdème des MI", pt: "Edema dos MI", en: "Swollen legs" },
  caprini_varicose: { fr: "Varices", pt: "Varizes", en: "Varicose veins" },
  caprini_pregnancy: { fr: "Grossesse / post-partum", pt: "Gravidez / pós-parto", en: "Pregnancy / postpartum" },
  caprini_oc: { fr: "Contraceptifs oraux / THS", pt: "Contraceptivos orais / THS", en: "Oral contraceptives / HRT" },
  caprini_sepsis: { fr: "Sepsis (< 1 mois)", pt: "Sepsis (< 1 mês)", en: "Sepsis (< 1 month)" },
  caprini_lung: { fr: "Pneumopathie grave", pt: "Pneumopatia grave", en: "Serious lung disease" },
  caprini_mi: { fr: "IDM aigu", pt: "EAM agudo", en: "Acute MI" },
  caprini_chf: { fr: "IC (< 1 mois)", pt: "IC (< 1 mês)", en: "CHF (< 1 month)" },
  caprini_bed_rest_med: { fr: "Patient médical alité", pt: "Doente médico acamado", en: "Medical patient on bed rest" },
  caprini_ibd: { fr: "MICI", pt: "DII", en: "IBD" },
  caprini_arthroscopy: { fr: "Arthroscopie", pt: "Artroscopia", en: "Arthroscopic surgery" },
  caprini_malignancy: { fr: "Néoplasie", pt: "Neoplasia", en: "Malignancy" },
  caprini_laparoscopy: { fr: "Laparoscopie (> 45 min)", pt: "Laparoscopia (> 45 min)", en: "Laparoscopy (> 45 min)" },
  caprini_bed_rest_72: { fr: "Alitement > 72h", pt: "Acamamento > 72h", en: "Bed rest > 72h" },
  caprini_cast: { fr: "Immobilisation plâtrée", pt: "Imobilização gessada", en: "Immobilizing cast" },
  caprini_cvc: { fr: "Cathéter veineux central", pt: "Cateter venoso central", en: "Central venous access" },
  caprini_dvt_pe: { fr: "ATCD TVP / EP", pt: "Hist. TVP / EP", en: "History DVT / PE" },
  caprini_family_thromb: { fr: "ATCD familial thrombose", pt: "Hist. familiar trombose", en: "Family history thrombosis" },
  caprini_factor_v: { fr: "Facteur V Leiden", pt: "Fator V Leiden", en: "Factor V Leiden" },
  caprini_prothrombin: { fr: "Mutation prothrombine", pt: "Mutação protrombina", en: "Prothrombin mutation" },
  caprini_lupus: { fr: "Anticoagulant lupique", pt: "Anticoagulante lúpico", en: "Lupus anticoagulant" },
  caprini_hit: { fr: "TIH", pt: "TIH", en: "HIT" },
  caprini_stroke: { fr: "AVC (< 1 mois)", pt: "AVC (< 1 mês)", en: "Stroke (< 1 month)" },
  caprini_hip_knee: { fr: "PTH / PTG / Fx hanche", pt: "PTA / PTJ / Fx anca", en: "Hip/knee arthroplasty / hip fx" },
  caprini_trauma: { fr: "Polytraumatisme", pt: "Politraumatismo", en: "Multiple trauma" },
  caprini_spinal: { fr: "Lésion médullaire aiguë", pt: "Lesão medular aguda", en: "Acute spinal cord injury" },

  // i18n content indicators
  content_fr_only: {
    fr: "Contenu disponible uniquement en français",
    pt: "Conteúdo disponível apenas em francês",
    en: "Content available in French only",
  },
  apply_filter: { fr: "Appliquer le filtre", pt: "Aplicar filtro", en: "Apply filter" },
  missing_translations: {
    fr: "Traductions manquantes",
    pt: "Traduções em falta",
    en: "Missing translations",
  },

  // Auto-translation
  auto_translated: { fr: "Traduction auto", pt: "Tradução automática", en: "Auto-translated" },
  view_original: { fr: "Voir l'original (FR)", pt: "Ver original (FR)", en: "View original (FR)" },
  view_translated: { fr: "Voir la traduction", pt: "Ver tradução", en: "View translation" },
  translating: { fr: "Traduction en cours…", pt: "A traduzir…", en: "Translating…" },
  save_translation_en: { fr: "Sauvegarder EN", pt: "Guardar EN", en: "Save EN" },
  save_translation_pt: { fr: "Sauvegarder PT", pt: "Guardar PT", en: "Save PT" },
  translation_saved: { fr: "Traduction sauvegardée", pt: "Tradução guardada", en: "Translation saved" },

  // Drug groups
  drug_group_induction: { fr: "💉 Induction", pt: "💉 Indução", en: "💉 Induction" },
  drug_group_maintenance: { fr: "🫁 Entretien", pt: "🫁 Manutenção", en: "🫁 Maintenance" },
  drug_group_analgesia: { fr: "💊 Analgésie", pt: "💊 Analgesia", en: "💊 Analgesia" },
  drug_group_ponv: { fr: "🤢 NVPO", pt: "🤢 NVPO", en: "🤢 PONV" },
  drug_group_prophylaxis: { fr: "🛡️ Prophylaxie", pt: "🛡️ Profilaxia", en: "🛡️ Prophylaxis" },
  drug_group_other: { fr: "Autres", pt: "Outros", en: "Other" },

  // Checklist & summary
  checklist_mode: { fr: "Mode checklist", pt: "Modo checklist", en: "Checklist mode" },
  checklist_progress: { fr: "Progression", pt: "Progresso", en: "Progress" },
  generate_summary: { fr: "Générer résumé", pt: "Gerar resumo", en: "Generate summary" },
  summary_copied: { fr: "Résumé copié !", pt: "Resumo copiado!", en: "Summary copied!" },

  // Quality dashboard
  quality_dashboard: { fr: "Qualité des données", pt: "Qualidade dos dados", en: "Data quality" },
  missing_drugs: { fr: "Interventions sans médicaments", pt: "Intervenções sem medicamentos", en: "Procedures without drugs" },
  missing_units: { fr: "Médicaments incomplets", pt: "Medicamentos incompletos", en: "Incomplete drugs" },
  missing_refs: { fr: "Références manquantes", pt: "Referências em falta", en: "Missing references" },
};

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  resolve: <T>(obj: Partial<Record<Lang, T>> | undefined) => T | undefined;
  resolveStr: (obj: Partial<Record<Lang, string>> | undefined) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("anesia-lang");
    if (saved === "fr" || saved === "pt" || saved === "en") return saved;
    return "fr";
  });

  const handleSetLang = useCallback((newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem("anesia-lang", newLang);
  }, []);

  const t = useCallback(
    (key: string): string => {
      const entry = UI[key];
      if (!entry) return key;
      return entry[lang] ?? entry["fr"] ?? entry["en"] ?? entry["pt"] ?? key;
    },
    [lang],
  );

  const resolve = useCallback(
    <T,>(obj: Partial<Record<Lang, T>> | undefined): T | undefined => {
      if (!obj) return undefined;
      return obj[lang] ?? obj["fr"] ?? obj["en"] ?? obj["pt"];
    },
    [lang],
  );

  const resolveStr = useCallback(
    (obj: Partial<Record<Lang, string>> | undefined): string => {
      if (!obj) return "";
      return obj[lang] ?? obj["fr"] ?? obj["en"] ?? obj["pt"] ?? "";
    },
    [lang],
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t, resolve, resolveStr }}>
      {children}
    </LanguageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
