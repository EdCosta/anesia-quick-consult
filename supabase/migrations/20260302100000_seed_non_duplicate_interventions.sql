BEGIN;

-- Add only procedure concepts not already represented elsewhere in the repo.
-- Overlapping concepts such as cholecystectomy, TURP, elective cesarean,
-- shoulder arthroscopy, lumbar discectomy, etc. were intentionally skipped.

INSERT INTO public.procedures (id, specialty, specialties, titles, synonyms, content, tags, is_pro)
VALUES (
  'fracture_hanche_hemiarthroplastie',
  'orthopedie',
  '["orthopedie"]'::jsonb,
  '{"fr":"Fracture de hanche (hémiarthroplastie)","en":"Hip fracture (hemiarthroplasty)","pt":"Fratura da anca (hemiartroplastia)"}'::jsonb,
  '{"fr":["fracture hanche","hemiarthroplastie","col du femur","sujet age fragile"],"en":["hip fracture","hemiarthroplasty"],"pt":["fratura da anca","hemiartroplastia","fratura colo femur"]}'::jsonb,
  $fh${
    "quick": {
      "fr": {
        "preop": [
          "Evaluer fragilite, etat cognitif de base et risque de delirium; corriger les facteurs reversibles",
          "PBM: verifier Hb, groupage et strategie transfusionnelle; anticiper le risque anemique",
          "Bloc antalgique preop (PENG ou fascia iliaca) si possible pour reduire les opioides",
          "Plan TEV et risque d'aspiration a reevaluer selon le contexte urgent"
        ],
        "intraop": [
          "Technique neuraxiale si adaptee, sinon AG avec objectif hemodynamique strict",
          "Eviter l'hypotension prolongee; vasopresseurs titres et normothermie active",
          "Analgésie multimodale avec epargne opioide; eviter les benzodiazepines si possible",
          "Hemostase, fluides et antifibrinolytique selon protocole local"
        ],
        "postop": [
          "Prevention du delirium: reorientation, sommeil, douleur controlee, limiter les sedatifs",
          "Mobilisation precoce et kinésithérapie des que possible",
          "Reprise ou initiation de la prophylaxie TEV selon hemostase et protocole",
          "Reevaluation rapprochee de la douleur, de l'Hb et de l'etat fonctionnel"
        ],
        "red_flags": [
          "Hypotension refractaire ou signes de choc perioperatoire",
          "Hemorragie, chute rapide d'Hb ou besoin transfusionnel croissant",
          "Delirium aigu, retention ou deterioration neurologique inattendue",
          "Suspicion de TVP ou d'embolie pulmonaire"
        ],
        "drugs": [
          {"drug_id": "bupivacaine", "indication_tag": "rachianesthésie"},
          {"drug_id": "paracetamol", "indication_tag": "analgésie"},
          {"drug_id": "morphine", "indication_tag": "analgésie_postop"},
          {"drug_id": "acide_tranexamique", "indication_tag": "antifibrinolytique"},
          {"drug_id": "ephedrine", "indication_tag": "hypotension"}
        ]
      },
      "pt": {
        "preop": [
          "Avaliar fragilidade, estado cognitivo basal e risco de delirium; corrigir fatores reversiveis",
          "PBM: verificar Hb, grupo e estrategia transfusional; antecipar o risco de anemia",
          "Bloqueio analgesico pre-op (PENG ou fascia iliaca) se possivel para reduzir opioides",
          "Plano de TEV e risco de aspiracao devem ser reavaliados no contexto urgente"
        ],
        "intraop": [
          "Preferir tecnica neuraxial quando apropriada; caso contrario AG com alvo hemodinamico rigoroso",
          "Evitar hipotensao prolongada; vasopressores titulados e normotermia ativa",
          "Analgesia multimodal com poupanca de opioides; evitar benzodiazepinas se possivel",
          "Hemostase, fluidos e antifibrinolitico de acordo com o protocolo local"
        ],
        "postop": [
          "Prevencao de delirium: reorientacao, sono, dor controlada e evitar sedativos",
          "Mobilizacao precoce e fisioterapia assim que possivel",
          "Iniciar ou retomar profilaxia TEV conforme hemostase e protocolo",
          "Reavaliar de perto dor, Hb e estado funcional"
        ],
        "red_flags": [
          "Hipotensao refrataria ou sinais de choque perioperatorio",
          "Hemorragia, queda rapida da Hb ou necessidade transfusional crescente",
          "Delirium agudo, retencao ou deterioracao neurologica inesperada",
          "Suspeita de TVP ou embolia pulmonar"
        ],
        "drugs": [
          {"drug_id": "bupivacaine", "indication_tag": "rachianesthésie"},
          {"drug_id": "paracetamol", "indication_tag": "analgésie"},
          {"drug_id": "morphine", "indication_tag": "analgésie_postop"},
          {"drug_id": "acide_tranexamique", "indication_tag": "antifibrinolytique"},
          {"drug_id": "ephedrine", "indication_tag": "hypotension"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Procedure frequente chez le patient age fragile, avec enjeu majeur de stabilite hemodynamique et de mobilite precoce",
          "L'analgesie regionale preop permet souvent de diminuer la charge opioide et le risque de delirium"
        ],
        "pitfalls": [
          "Retarder la chirurgie pour des optimisations mineures non critiques",
          "Sous-traiter la douleur et precipiter delirium, immobilisation et complications respiratoires"
        ],
        "references": []
      },
      "pt": {
        "clinical": [
          "Procedimento frequente no idoso fragil, com foco em estabilidade hemodinamica e mobilizacao precoce",
          "A analgesia regional pre-op reduz frequentemente a carga de opioides e o risco de delirium"
        ],
        "pitfalls": [
          "Adiar cirurgia por otimizacoes menores nao criticas",
          "Subtratar a dor e precipitar delirium, imobilizacao e complicacoes respiratorias"
        ],
        "references": []
      }
    }
  }$fh$::jsonb,
  '["orthopedie","geriatrique","tev"]'::jsonb,
  false
),
(
  'amygdalectomie_adulte',
  'orl',
  '["orl"]'::jsonb,
  '{"fr":"Amygdalectomie (adulte)","en":"Tonsillectomy (adult)","pt":"Amigdalectomia (adulto)"}'::jsonb,
  '{"fr":["amygdalectomie adulte","tonsillectomie adulte","orl hemorragique"],"en":["adult tonsillectomy"],"pt":["amigdalectomia adulto","tonsilectomia adulto"]}'::jsonb,
  $aa${
    "quick": {
      "fr": {
        "preop": [
          "Stratifier le risque PONV et planifier une prophylaxie multimodale",
          "Evaluer risque hemorragique, antiagregants, SAOS et statut d'hydratation",
          "Prevenir le patient des consignes d'alerte pour saignement secondaire"
        ],
        "intraop": [
          "AG avec voie aerienne securisee et aspiration prete",
          "Analgesie multimodale; dexamethasone si autorisee par le protocole local",
          "Limiter opioides et volatils si possible; extubation eveillee et prudente"
        ],
        "postop": [
          "Surveiller douleur, nausees, hydratation et tout signe de saignement",
          "Prevoir analgesie structuree avec secours opioide si necessaire",
          "Donner des consignes de retour urgent en cas d'hemorragie ou de dyspnee"
        ],
        "red_flags": [
          "Hemorragie primaire ou secondaire",
          "Laryngospasme, oedeme des VAS ou detresse respiratoire",
          "Douleur non controlee avec incapacité a boire",
          "PONV severe avec deshydratation"
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction"},
          {"drug_id": "rocuronium", "indication_tag": "intubation"},
          {"drug_id": "paracetamol", "indication_tag": "analgésie"},
          {"drug_id": "ondansetron", "indication_tag": "PONV"},
          {"drug_id": "morphine", "indication_tag": "analgésie_secours"}
        ]
      },
      "pt": {
        "preop": [
          "Estratificar risco de PONV e planear profilaxia multimodal",
          "Avaliar risco hemorragico, antiagregantes, SAOS e estado de hidratacao",
          "Alertar o doente para os sinais de alarme de hemorragia secundaria"
        ],
        "intraop": [
          "AG com via aerea segura e aspiracao pronta",
          "Analgesia multimodal; dexametasona se permitida pelo protocolo local",
          "Limitar opioides e volateis quando possivel; extubacao desperta e prudente"
        ],
        "postop": [
          "Vigiar dor, nauseas, hidratacao e qualquer sinal de sangramento",
          "Definir analgesia estruturada com resgate opioide se necessario",
          "Dar instrucoes de recurso urgente se houver hemorragia ou dispneia"
        ],
        "red_flags": [
          "Hemorragia primaria ou secundaria",
          "Laringoespasmo, edema das VAS ou dificuldade respiratoria",
          "Dor nao controlada com incapacidade para beber",
          "PONV grave com desidratacao"
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction"},
          {"drug_id": "rocuronium", "indication_tag": "intubation"},
          {"drug_id": "paracetamol", "indication_tag": "analgésie"},
          {"drug_id": "ondansetron", "indication_tag": "PONV"},
          {"drug_id": "morphine", "indication_tag": "analgésie_secours"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Chez l'adulte, la douleur et le risque de saignement secondaire sont plus marqués que chez l'enfant",
          "La strategie d'epargne opioide aide a limiter PONV et depression respiratoire"
        ],
        "pitfalls": [
          "Sous-estimer la douleur a domicile et ne pas fournir de plan de secours",
          "Extuber sans aspiration oropharyngee adequate"
        ],
        "references": []
      },
      "pt": {
        "clinical": [
          "No adulto, a dor e o risco de hemorragia secundaria sao geralmente maiores do que na crianca",
          "Uma estrategia de poupanca de opioides ajuda a limitar PONV e depressao respiratoria"
        ],
        "pitfalls": [
          "Subestimar a dor no domicilio e nao fornecer plano de resgate",
          "Extubar sem aspiracao orofaringea adequada"
        ],
        "references": []
      }
    }
  }$aa$::jsonb,
  '["orl","ponv","airway"]'::jsonb,
  false
),
(
  'endoscopie_digestive_sedation',
  'gastroenterologie',
  '["gastroenterologie"]'::jsonb,
  '{"fr":"Endoscopie digestive (sedation)","en":"Digestive endoscopy (sedation)","pt":"Endoscopia digestiva (sedacao)"}'::jsonb,
  '{"fr":["sedation endoscopie","gastroscopie","colonoscopie","endoscopie digestive"],"en":["endoscopy sedation","gastroscopy","colonoscopy"],"pt":["sedacao endoscopia","endoscopia digestiva","colonoscopia","EDA"]}'::jsonb,
  $ed${
    "quick": {
      "fr": {
        "preop": [
          "Stratifier risque de voie aerienne, d'aspiration, SAOS et obesite",
          "Verifier le jeune, l'indication de sedation versus AG et le plan de rescue airway",
          "Anticiper oxygénation de haut debit si disponible pour les cas a risque"
        ],
        "intraop": [
          "Sedation titree avec monitorage standard; capnographie si possible",
          "Optimiser oxygénation, positionnement et aspiration",
          "Etre pret a convertir vers une prise en charge de voie aerienne avancee si hypoventilation"
        ],
        "postop": [
          "Valider criteres de reveil et de sortie apres sedation",
          "Surveiller plus longtemps les patients fragiles, SAOS ou ages",
          "Donner les consignes de non-conduite et d'alerte post-procedure"
        ],
        "red_flags": [
          "Hypoxemie, apnee ou obstruction des VAS",
          "Aspiration ou vomissement avec desaturation",
          "Hypotension persistante ou bradycardie",
          "Perforation ou saignement procedurel suspect"
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "sédation"}
        ]
      },
      "pt": {
        "preop": [
          "Estratificar risco de via aerea, aspiracao, SAOS e obesidade",
          "Confirmar jejum, indicacao para sedacao versus AG e plano de via aerea de resgate",
          "Antecipar oxigenacao de alto fluxo se disponivel nos casos de maior risco"
        ],
        "intraop": [
          "Sedacao titulada com monitorizacao standard; capnografia quando possivel",
          "Otimizar oxigenacao, posicionamento e aspiracao",
          "Estar pronto para converter para via aerea avancada se surgir hipoventilacao"
        ],
        "postop": [
          "Validar criterios de recuperacao e alta apos sedacao",
          "Vigiar mais tempo doentes frageis, SAOS ou idosos",
          "Dar instrucoes de nao conduzir e sinais de alarme apos o procedimento"
        ],
        "red_flags": [
          "Hipoxemia, apnea ou obstrucao das VAS",
          "Aspiracao ou vomito com dessaturacao",
          "Hipotensao persistente ou bradicardia",
          "Suspeita de perfuracao ou hemorragia do procedimento"
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "sédation"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "Le point cle n'est pas la profondeur de sedation mais la capacite a maintenir oxygénation et secours des VAS sans delai",
          "Les cas a haut risque d'aspiration doivent faire reevaluer la balance sedation versus AG"
        ],
        "pitfalls": [
          "Sedation excessive sans plan d'escalade clair",
          "Sortie trop precoce chez patient SAOS, fragile ou encore somnolent"
        ],
        "references": []
      },
      "pt": {
        "clinical": [
          "O ponto critico nao e a profundidade da sedacao, mas a capacidade de manter oxigenacao e resgatar a via aerea sem atraso",
          "Nos casos com alto risco de aspiracao, a escolha entre sedacao e AG deve ser reavaliada"
        ],
        "pitfalls": [
          "Sedacao excessiva sem plano claro de escalada",
          "Alta demasiado precoce em doente com SAOS, fragil ou ainda sonolento"
        ],
        "references": []
      }
    }
  }$ed$::jsonb,
  '["sedation","airway","gastro"]'::jsonb,
  false
),
(
  'toracoscopie_vats',
  'chirurgie-thoracique',
  '["chirurgie-thoracique"]'::jsonb,
  '{"fr":"VATS (thoracoscopie)","en":"VATS (thoracoscopy)","pt":"VATS (toracoscopia)"}'::jsonb,
  '{"fr":["vats","thoracoscopie","chirurgie thoracique mini-invasive"],"en":["vats","thoracoscopy"],"pt":["vats","toracoscopia","cirurgia toracica minimamente invasiva"]}'::jsonb,
  $vt${
    "quick": {
      "fr": {
        "preop": [
          "Evaluer reserve respiratoire, gaz du sang si necessaire et risque d'hypoxemie",
          "Planifier protection pulmonaire, isolement pulmonaire et analgésie regionale",
          "Verifier strategie post-op pour physiotherapie, drainage et mobilisation precoce"
        ],
        "intraop": [
          "AG avec isolement pulmonaire (sonde double lumiere ou bloqueur) selon le cas",
          "Ventilation unipulmonaire protectrice et ajustements rapides en cas d'hypoxemie",
          "Analgesie regionale (ESP, paravertebral ou intercostal) si appropriee; normothermie et fluides raisonnes"
        ],
        "postop": [
          "Assurer une analgésie efficace pour permettre toux, inspiration profonde et kine",
          "Surveiller drain thoracique, fuite aerienne et signes de detresse respiratoire",
          "Mobilisation precoce et prevention des complications pulmonaires"
        ],
        "red_flags": [
          "Hypoxemie refractaire sous ventilation unipulmonaire",
          "Hemorragie importante ou instabilite hemodynamique",
          "Detresse respiratoire post-op ou fuite aerienne majeure",
          "Douleur mal controlee empechant ventilation efficace"
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction"},
          {"drug_id": "rocuronium", "indication_tag": "intubation"},
          {"drug_id": "paracetamol", "indication_tag": "analgésie"},
          {"drug_id": "morphine", "indication_tag": "analgésie_postop"}
        ]
      },
      "pt": {
        "preop": [
          "Avaliar reserva respiratoria, gasimetrias se necessario e risco de hipoxemia",
          "Planear protecao pulmonar, isolamento pulmonar e analgesia regional",
          "Confirmar estrategia pos-op para fisioterapia, dreno e mobilizacao precoce"
        ],
        "intraop": [
          "AG com isolamento pulmonar (tubo de duplo lumen ou bloqueador) conforme o caso",
          "Ventilacao unipulmonar protetora e ajustes rapidos se surgir hipoxemia",
          "Analgesia regional (ESP, paravertebral ou intercostal) quando apropriado; normotermia e fluidos equilibrados"
        ],
        "postop": [
          "Garantir analgesia eficaz para permitir tosse, inspiracao profunda e fisioterapia",
          "Vigiar dreno toracico, fuga aerea e sinais de insuficiencia respiratoria",
          "Mobilizacao precoce e prevencao de complicacoes pulmonares"
        ],
        "red_flags": [
          "Hipoxemia refrataria durante ventilacao unipulmonar",
          "Hemorragia significativa ou instabilidade hemodinamica",
          "Insuficiencia respiratoria pos-op ou fuga aerea importante",
          "Dor mal controlada impedindo ventilacao eficaz"
        ],
        "drugs": [
          {"drug_id": "propofol", "indication_tag": "induction"},
          {"drug_id": "rocuronium", "indication_tag": "intubation"},
          {"drug_id": "paracetamol", "indication_tag": "analgésie"},
          {"drug_id": "morphine", "indication_tag": "analgésie_postop"}
        ]
      }
    },
    "deep": {
      "fr": {
        "clinical": [
          "La priorite est une ventilation unipulmonaire tolerable, avec seuil bas pour reclamer l'aide chirurgicale si l'hypoxemie persiste",
          "L'analgesie regionale facilite la toux efficace, la kine respiratoire et la recuperation acceleree"
        ],
        "pitfalls": [
          "Surremplissage ou ventilation trop agressive du poumon dependant",
          "Analgesie insuffisante conduisant a atélectasie et retention de secretions"
        ],
        "references": []
      },
      "pt": {
        "clinical": [
          "A prioridade e manter uma ventilacao unipulmonar toleravel, com baixo limiar para pedir ajuda cirurgica se a hipoxemia persistir",
          "A analgesia regional facilita tosse eficaz, fisioterapia respiratoria e recuperacao acelerada"
        ],
        "pitfalls": [
          "Sobrecarga de fluidos ou ventilacao demasiado agressiva do pulmao dependente",
          "Analgesia insuficiente levando a atelectasia e retencao de secrecoes"
        ],
        "references": []
      }
    }
  }$vt$::jsonb,
  '["thorax","airway","respiratoire"]'::jsonb,
  false
)
ON CONFLICT (id) DO NOTHING;

COMMIT;
