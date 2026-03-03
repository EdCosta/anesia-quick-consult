# Protocoles d'Anesthésie — CHU Saint-Pierre (Bruxelles) PGs 2025–2026

> **Document de référence AnesIA** — Synthèse structurée des protocoles institutionnels du CHU Saint-Pierre
> Version : 1.0 · Date : 2026-03-03 · Couverture : 76 procédures (76 IDs Supabase)

---

## Table des matières

1. [Spécificités institutionnelles Saint-Pierre](#specificites)
2. [Secteur 1 — Cardiaque / Thoracique / Vasculaire / Ophtalmo / Plastique (13)](#secteur1)
3. [Secteur 2 — Digestif / Gynéco / Urologie / Obstétrique (23)](#secteur2)
4. [Secteur 3 — Pédiatrie / ORL / Stomatologie / Maxillo-facial (21)](#secteur3)
5. [Secteur 4 — Orthopédie / Neurochirurgie / Endoscopie (19)](#secteur4)
6. [Index des procédures par ID](#index)
7. [Médicaments institutionnels](#drugs)

---

## 1. Spécificités institutionnelles Saint-Pierre {#specificites}

### Protocoles propres à Saint-Pierre

| Protocole | Détail |
|-----------|--------|
| **Antibioprophylaxie** | Céfazoline **2 g** IV (adulte > 70 kg ou IMC > 35), sinon 1 g; répétition à H+8 et H+16 si chirurgie prolongée |
| **Antifibrinolytique (TXA)** | Acide tranexamique (Exacyl®) 1 g IV à l'incision + 1 g à H+3 pour toute chirurgie hémorragique |
| **HBPM** | Énoxaparine (Clexane®) 40 mg SC à H+6 postopératoire (et non H+12) |
| **Analgésie travail (remifentanil)** | Protocole APCIV : concentration 20 µg/mL, bolus 0.1 µg/kg, verrouillage 2 min, **sans débit continu**, surveillance infirmière continue obligatoire |
| **Bariatrie (OFA)** | Chirurgie bariatrique sans opioïdes : kétamine 0.5 mg/kg, dexaméthasone 0.1 mg/kg, kétorolac 30 mg, propofol TCI; NO morphine per-opératoire |
| **Péridurale obstétrique** | PIB 12 mL/h bupivacaïne 0.1% + sufentanil 0.5 µg/mL + PCEA bolus 5 mL / verrouillage 15 min |

### Conventions de notation dans ce document

- ✅ Pratique validée Saint-Pierre
- ⚠️ Point d'attention / contre-indication relative
- 🔴 Contre-indication absolue / urgence
- 📖 Complément issu de recommandations internationales

---

## 2. Secteur 1 — Cardiaque / Thoracique / Vasculaire / Ophtalmo / Plastique {#secteur1}

### 2.1 Pontage coronarien (CABG)
**ID:** `pontage_coronarien_cabg` | Tags: `cardiac`, `anticoag`

- Anesthésie équilibrée sufentanil/propofol + isoflurane (cardioprotection)
- CEC : héparine 300 UI/kg IV, TCA cible > 400 s; protamine 1 mg/100 UI
- Epicardial Doppler pour surveillance fonction VG; TEE per-op systématique
- ✅ TXA 1g incision + 1g H+3
- Extubation rapide (Fast-track) si stable : critères SICU J0 si < 4h CEC

### 2.2 Remplacement valvulaire cardiaque
**ID:** `remplacement_valvulaire_cardiaque` | Tags: `cardiac`, `anticoag`

- Prémédication midazolam 2 mg IV (anxiolyse sans dépression)
- Induction étomidate 0.2–0.3 mg/kg si fraction d'éjection < 40%
- TEE peropératoire : contrôle positionnement prothèse + leak paravalvulaire
- Anticoagulation CEC idem CABG
- ⚠️ Remplacement aortique : risque emboles calcaires → tête en position neutre

### 2.3 TAVI (implantation valve aortique transcathéter)
**ID:** `tavi_implantation_aortique` | Tags: `cardiac`

- Voie fémorale (majoritaire) sous AG légère ou sédation consciente
- TAVI sous sédation consciente : propofol TCI Ce 1–2 µg/mL + rémifentanil Ce 0.5–1 ng/mL
- 🔴 Pacing ventriculaire rapide (180–200 bpm) pendant déploiement → défibrillateurprêt
- PA invasive fémorale controlatérale obligatoire

### 2.4 Ablation (rythmologie)
**ID:** `ablation_arythmie_rythmologie` | Tags: `cardiac`

- Sédation profonde propofol TCI ± intubation si procédure longue (FA > 2h)
- Anticoagulation héparine non fractionnée peropératoire TCA cible > 300 s
- Réchauffement actif (table chauffante) pour procédures > 3h

### 2.5 Fermeture FOP
**ID:** `fermeture_fop` | Tags: `cardiac`

- Sédation consciente propofol TCI Ce 2–3 µg/mL + gestion respiratoire (apnée courte lors déploiement)
- ETO peropératoire obligatoire : guidance passage transseptal + contrôle occluder

### 2.6 Ophtalmologie (laser / ALR)
**ID:** `ophtalmologie_ala` | Tags: `regional`

- ALR : bloc rétrobulbaire bupivacaïne 0.5% 4 mL OU bloc péribulbaire ± hyaluronidase 15 UI/mL
- 🔴 Réflexe oculo-cardiaque : bradycardie → STOP traction + atropine 0.5 mg IV
- Anesthésie topique + sédation légère midazolam 1 mg pour laser courte durée

### 2.7 Thoracotomie
**ID:** `thoracotomie` | Tags: `airway`, `regional`

- Sonde double lumière (Carlens/Mallinckrodt) pour ventilation uni-pulmonaire; fibroscopie de contrôle de positionnement
- Analgésie : épidurale thoracique T5–T6 bupivacaïne 0.1% + sufentanil 0.5 µg/mL
- Ou PVB (bloc paravertébral) bupivacaïne 0.375% 15 mL niveau T5 (si épidurale impossible)

### 2.8 VATS (vidéo-thoracoscopie)
**ID:** `vats_thoracoscopie` | Tags: `airway`, `regional`

- Sonde double lumière ou Blocker endobronchique (Arndt)
- Ventilation uni-pulmonaire : VT 5 mL/kg + PEEP 5 cmH2O pré-exclusion, plateau < 30 cmH2O
- Analgésie : PVB > épidurale (moins d'instabilité hémodynamique)

### 2.9 Endartériectomie carotidienne
**ID:** `endarteriectomie_carotidienne` | Tags: `cardiac`, `regional`, `neuraxial`

- Option 1 : ALR cervicale (bloc plexus cervical superficiel + profond) → patient vigile, monitoring neurologique direct
- Option 2 : AG avec monitoring EEG + shunt carotidien si déficit peropératoire
- ✅ Maintenir PAS > 130 mmHg lors du clampage carotidien

### 2.10 Chirurgie aortique (AAA)
**ID:** `chirurgie_aaa_aortique` | Tags: `cardiac`, `anticoag`, `icu`

- Voie artérielle radiale droite + VVC (triple lumière) + Swan-Ganz si FEVG < 40%
- Épidurale thoracique T8–T10 pour analgésie postopératoire (débuté après clamp aortique levé)
- Clampage aortique : nitroprussiate IV titré + nitroglycérine pour gestion hypertension

### 2.11 Pontage artériel périphérique
**ID:** `pontage_arteriel_peripherique` | Tags: `regional`, `anticoag`

- Rachianesthésie (bupivacaïne hyperbare 15 mg) ou épidurale lombaire si durée > 3h
- Héparine 5000 UI IV avant clampage artériel
- Monitorage PA invasive + surveillance ischémie distale per-op

### 2.12 Reconstruction mammaire / sénologie
**ID:** `reconstruction_mammaire_senologie` | Tags: `regional`

- PECS I + II (bloc pectoral) bupivacaïne 0.25% 20 mL sous écho
- OU épidurale thoracique T3–T4 si reconstruction bilatérale
- Dexaméthasone 8 mg + ondansétron 4 mg (NVPO risque élevé : femme + AG)

### 2.13 Chirurgie plastique paroi abdominale
**ID:** `chirurgie_plastique_paroi_abdominale` | Tags: `regional`

- Bloc TAP bilatéral bupivacaïne 0.25% 20 mL / côté sous écho
- Abdominoplastie : risque TVP élevé → énoxaparine H+6 ✅ + bas de contention

---

## 3. Secteur 2 — Digestif / Gynéco / Urologie / Obstétrique {#secteur2}

### 3.1 Chirurgie bariatrique (OFA — spécifique Saint-Pierre)
**ID:** `chirurgie_bariatrique` | Tags: `airway`, `ponv`

- ✅ **Protocole OFA (Opioid-Free Anesthesia) Saint-Pierre** :
  - Kétamine 0.5 mg/kg IV incision + 0.25 mg/kg/h IVSE
  - Dexaméthasone 0.1 mg/kg + ondansétron 4 mg
  - Kétorolac 30 mg + paracétamol 1g
  - Propofol TCI + dexmedetomidine (si disponible)
  - **Zéro opioïde per-opératoire** (remifentanil accepté si dérive hémodynamique)
- Ventilation : DLT (tête 30° proclive + FiO2 80% + PEEP 8–10 cmH2O + VT 6 mL/kg poids idéal)
- Intubation vidéolaryngoscope systématique (ATCD IMC, obésité = VD prévisible)
- ⚠️ Dosage par poids idéal (sauf propofol = poids total)

### 3.2 Cholécystectomie laparoscopique
**ID:** `cholecystectomie_laparoscopique` | Tags: `ponv`, `regional`

- Anesthésie standard; dexaméthasone 8 mg + ondansétron 4 mg (NVPO ++)
- Bloc TAP sous-costal (Heiss) si douleur épaule droite importante (CO2)
- Infiltration laparoscopique bupivacaïne 0.25% berges trocar
- Sortie J0 si ambulatoire (laparoscopique simple)

### 3.3 Colectomie laparoscopique / RACC
**ID:** `colectomie_laparoscopique_racc` | Tags: `regional`, `anticoag`

- ERAS (Enhanced Recovery After Surgery) : précharge orale glucosée J-1, mobilisation J0
- Epidurale thoracique T9–T10 ou TAP bilatéral + kétorolac si laparoscopique pur
- ✅ TXA 1g incision + 1g H+3 si conversion laparotomie

### 3.4 Surrénalectomie / phéochromocytome
**ID:** `surrenalectomie_pheo` | Tags: `cardiac`, `anticoag`

- Phéo : alpha-bloqueur (phénoxybenzamine) 2 semaines préopératoire; bêtabloqueur 1 semaine après
- Hypertension peropératoire : nitroprussiate IV 0.3–3 µg/kg/min ± phentolamine 1–5 mg bolus
- Hypotension après extirpation tumeur : noradrénaline + remplissage
- Voie artérielle obligatoire (monitoring continu PA)

### 3.5 Péridurale analgésie travail (PIB+PCEA)
**ID:** `peridurale_analgesia_travail` | Tags: `ob`, `neuraxial`

- ✅ **Protocole Saint-Pierre PIB+PCEA** :
  - Bupivacaïne 0.1% + sufentanil 0.5 µg/mL
  - PIB 12 mL/h + PCEA bolus 5 mL / verrouillage 15 min
  - Dose limite : 25 mL/h total
- Test-dose : lidocaïne 2% adrénalinée 3 mL avant perf (exclure IV + rachidien)
- Monitorage RCF continu obligatoire après initiation

### 3.6 Césarienne (rachianesthésie)
**ID:** `cesarienne_rachianesthesie` | Tags: `ob`, `neuraxial`

- Bupivacaïne hyperbare 0.5% **10–12 mg** + fentanyl 15 µg + morphine 100 µg
- Phényléphrine prophylactique 50 µg/min IVSE (débutée à l'injection rachidienne)
- Niveau bloc T4 confirmé avant incision; si insuffisant → nitrous oxide 50% ou AG
- Éphedrine 9 mg IV si bradycardie + hypotension réfractaire phényléphrine

### 3.7 Césarienne sous AG
**ID:** `cesarienne_ag` | Tags: `ob`, `airway`, `difficult_airway`

- Indication : refus rachianesthésie, urgence absolue, contre-indication, échec rachidien
- RSI modifiée : propofol 2 mg/kg + succinylcholine 1.5 mg/kg (ou rocuronium 1.2 mg/kg si CI succinylcholine)
- 🔴 Intubation difficile imprévue en obstétrique → DAS OB algorithm; ne pas intuber > 3 tentatives
- Extubation vigile sur table; antagoniser curarisation (sugammadex 200 mg si rocuronium)

### 3.8 Pré-éclampsie sévère / HELLP
**ID:** `pre_eclampsie_hellp` | Tags: `ob`, `neuraxial`, `icu`

- Sulfate de magnésie : 4 g IV en 20 min (dose charge) + 1 g/h IVSE (prévention éclampsie)
- Antihypertenseur urgence : labétalol 20 mg IV titré (max 300 mg) ou nifédipine 10 mg sublingual
- PAS cible < 160 mmHg, PAD < 110 mmHg (éviter chute brutale : ischémie utéro-placentaire)
- Rachianesthésie préférable si plaquettes > 70 G/L

### 3.9 Hémorragie du post-partum (HPP)
**ID:** `hemorragie_post_partum` | Tags: `ob`, `anticoag`, `icu`

- Définition : pertes > 500 mL (voie basse) ou > 1000 mL (césarienne) ou retentissement hémodynamique
- Oxytocine 5 UI IV + 10 UI/h IVSE systématique (prophylaxie active délivrance)
- ✅ TXA 1g IV dans 3h du saignement (WOMAN trial); répéter 1g si saignement persistant
- Protocole transfusion massif : CGR:PFC:CPA = 1:1:1
- Embolisation artérielle (radiol. interv.) ou chirurgie (ligatures artères utérines / hystérectomie)

### 3.10 Laparoscopie gynécologique
**ID:** `laparoscopie_gynecologique` | Tags: `ob`, `ponv`, `regional`

- Proclive 30° (Trendelenburg) + pneumopéritoine CO2 → risque hypercapnie + régurgitation
- NVPO double prophylaxie systématique (femme + AG + morphine)
- Bloc TAP + infiltration berges trocar bupivacaïne 0.25%

### 3.11 Prostatectomie robot-assistée (RARP)
**ID:** `prostatectomie_robot_assistee` | Tags: `regional`, `anticoag`

- Trendelenburg profond 30° + CO2 : PaCO2 ↑, pression intracrânienne ↑ → dépression ventilatoire à surveiller
- Durée 3–5h : VT 6 mL/kg + PEEP 7–8 cmH2O + FR adaptée
- TAP bilatéral post-op ou infiltration locale; analgésie kétorolac 30 mg

### 3.12–3.23 Autres procédures digestif/gynéco/uro

| ID | Procédure | Points clés |
|----|-----------|-------------|
| `appendicectomie_adulte` | Appendicectomie adulte | RSI si péritonite; ERAS J0 |
| `hernie_paroi_abdominale` | Hernie abdominale (TEP/Lichtenstein) | Curarisation profonde TEP; bupivacaïne locale |
| `fundoplicature_nissen` | Nissen (RGO) | 🔴 RSI systématique (reflux); PONV double |
| `gastrectomie` | Gastrectomie | Epidurale thoracique T7-T8; ERAS nutrition J0 |
| `resection_hepatique` | Résection hépatique | PVC < 5 cmH2O; cell saver; PA invasive |
| `proctologie_hemorroidectomie` | Hémorroïdectomie | Rachianesthésie selle; kétamine 0.3 mg/kg |
| `hysteroscopie_operative` | Hystéroscopie opératoire | Milieu distension max : glycocolle 1L / NaCl 2.5L |
| `ivg_sedation` | IVG sous sédation | Propofol AIVOC + rémifentanil; bloc paracervical |
| `nephrectomie_laparoscopique` | Néphrectomie laparoscopique | Décubitus lat + billot; éviter AINS si IRC |
| `cystectomie_radicale` | Cystectomie radicale | ERAS; épidurale T10-T11; TXA 1g + 1g H+3 |
| `remifentanil_analgesia_travail` | Rémifentanil APCIV travail | ✅ Protocole SP : 20 µg/mL, 0.1 µg/kg, lock 2min |
| `embolie_liquide_amniotique` | Embolie liquide amniotique | RSI + noradrénaline + MTP 1:1:1 + TXA + ECMO si réfractaire |

---

## 4. Secteur 3 — Pédiatrie / ORL / Stomatologie / Maxillo-facial {#secteur3}

### Principes généraux pédiatriques Saint-Pierre

| Paramètre | Formule / valeur |
|-----------|-----------------|
| Poids estimé (2–12 ans) | (âge × 2) + 8 kg |
| Dose sonde IT (ID interne) | âge/4 + 3.5 mm (sans ballonnet < 8 ans) |
| Induction inhalation sévoflurane | 8% + N2O 50% (sauf CI N2O) |
| Atropine pré-induction | 0.02 mg/kg IV si < 1 an ou bradycardie anticipated |
| Paracétamol rectal | 40 mg/kg puis 20 mg/kg /6h |
| Fentanyl bolus | 1–2 µg/kg IV |
| Propofol induction | 3–4 mg/kg IV (titré) |

### 4.1–4.14 Procédures pédiatriques

| ID | Procédure | Points clés |
|----|-----------|-------------|
| `adenoidectomie_att_paed` | Adénoïdectomie ± ATT | PONV double; 🔴 N2O CI pour ATT |
| `amygdalectomie_paed` | Amygdalectomie pédiatrique | Tube RAE buccal; hémorragie post = RSI obligatoire |
| `chirurgie_oreille_paed` | Chirurgie oreille enfant | 🔴 N2O CI; TIVA propofol+rémifentanil; NIM si mastoid |
| `circoncision_paed` | Circoncision pédiatrique | Bloc dorsal verge bupivacaïne 0.25% SANS adrénaline |
| `hypospade_paed` | Hypospadias | Caudal 0.5–0.7 mL/kg; garrot verge max 45 min |
| `orchidopexie_paed` | Orchidopexie | BII échoguidé ou caudal si abdominal |
| `hernie_inguinale_paed` | Hernie inguinale pédiatrique | ⚠️ Prématuré < 52 SA : obs. apnée 12–24h post-op |
| `appendicectomie_paed` | Appendicectomie pédiatrique | RSI systématique; céfazoline 50 mg/kg + métronidazole si perforation |
| `stenose_pylore_nourrisson` | Sténose du pylore | Corriger d'abord (Na>130, K>3, pH<7.50); RSI kétamine 2 mg/kg |
| `plaie_oeil_perforante_paed` | Plaie œil perforant enfant | 🔴 NO succinylcholine; 🔴 NO N2O; propofol+rocuronium 1.2 mg/kg |
| `strabisme_paed` | Strabisme pédiatrique | OCR : STOP traction + atropine 0.02 mg/kg; TIVA réduit PONV |
| `nec_enterocolite_necrosante` | NEC / entérocolite nécrosante | TIVA morphine+midazolam; hypothermie priorité; NO halogénés |
| `canal_arteriel_permeable` | Canal artériel perméable | Fentanyl 5–10 µg/kg + midazolam; T° salle 26°C; glycémie /30min |
| `sedation_imagerie_paed` | Sédation imagerie pédiatrique | Propofol TIVA IRM; kétamine IM scanner urgence; 🔴 zéro matériel ferro-mag IRM |

### 4.15–4.21 ORL et Maxillo-facial adulte

| ID | Procédure | Points clés |
|----|-----------|-------------|
| `chirurgie_oreille_adulte` | Oreille adulte (tympanoplastie/stapédectomie) | 🔴 N2O CI; TIVA; NIM si mastoïdectomie |
| `chirurgie_endonasale_orl` | FESS / Septoplastie | Hypotension contrôlée PAS 60–70 mmHg; pack pharyngé obligatoire |
| `laryngectomie_carcinologique` | Laryngectomie (cancer larynx) | Fibroscope vigile si obstruction ≥ 50%; trachéostomie définitive |
| `thyroidectomie_parathyroidectomie` | Thyroïdectomie / Parathyroïdectomie | NIM tube; sugammadex avant neuromonitoring; hématome = urgence |
| `extractions_dentaires_stomato` | Dentisterie sous AG | Sonde RAE nasale; 🔴 pack pharyngé retiré avant extubation |
| `chirurgie_orthognathique` | LeFort I / BSSO / génioplastie | Sonde RAE nasale obligatoire; ciseaux BMM au chevet |
| `abces_dentaire_voies_aeriennes` | Ludwig / voies aériennes compromises | 🔴 JAMAIS RSI standard; fibroscope vigile gold standard |

---

## 5. Secteur 4 — Orthopédie / Neurochirurgie / Endoscopie {#secteur4}

### Principes orthopédiques Saint-Pierre

- **TXA systématique** : 1g IV incision + 1g à H+3 pour toute chirurgie orthopédique majeure
- **Énoxaparine** : 40 mg SC à H+6 (délai adapté selon risque hémorragique)
- **Rachianesthésie** : privilégiée vs AG pour chirurgie membres inférieurs (réduction TVP + DVT + embolie pulmonaire)
- **Céfazoline** : 2g IV (répétée H+8 et H+16 si durée > 3h)
- **Blocs nerveux périphériques** : usage systématique sous guidage échographique

### 5.1–5.12 Orthopédie (batches 1–3 antérieurement seedés)

| ID | Procédure | Anesthésie type | Bloc |
|----|-----------|-----------------|------|
| `arthroplastie_pth_ptg` | PTH / PTG | Rachianesthésie ± sédation | Bloc adducteurs / FIL para-PTH |
| `fracture_hanche_hemiarthroplastie` | Hémi-arthroplastie hanche | Rachianesthésie | FIL (bloc fascia iliaca) |
| `arthroplastie_epaule` | Arthroplastie épaule | AG + ISB | ISB bupivacaïne 0.375% 20 mL |
| `fracture_femur_diaphysaire` | Fracture fémorale diaphysaire | Rachianesthésie ou AG | FIL |
| `arthrodese_lombaire` | Arthrodèse lombaire (PLIF/TLIF) | AG + monitot EEG/SEP | — |
| `chirurgie_pied_cheville` | Pied / cheville | Bloc poplité + saphène | Bupivacaïne 0.375% 15+5 mL |
| `amputation_membre` | Amputation membre | Rachianesthésie ou AG | ALR prolongée > douleur fantôme |
| `fracture_humerus_proximal` | Humérus proximal | AG + ISB | ISB bupivacaïne 0.375% 20 mL |
| `fracture_col_femoral_deplacee_arthroplastie` | Col fémoral déplacé | Rachianesthésie | FIL 30 mL |
| `fracture_pertrochanterienne_clou_cephalomedullaire` | Pertrochantérienne / clou | Rachianesthésie | FIL pré-op analgésie |
| `prothese_totale_genou` | PTG | Rachianesthésie | Bloc adducteurs + IPACK |
| `fracture_radius_distal` | Radius distal | Brachial plexus (SIVR/ISB) | IVRA ou ISB 20 mL |

### 5.13–5.19 Orthopédie restante (seedée migration 20260303190000)

| ID | Procédure | Points clés |
|----|-----------|-------------|
| `arthroscopie_genou_menisectomie` | Méniscectomie / arthroscopie genou | Rachianesthésie / AG+MLG; bloc adducteurs ambulatoire J0 |
| `reconstruction_lca` | Reconstruction LCA | DIDT ou KJ; bloc adducteurs; TXA 1g; énoxaparine H+6 |
| `fracture_plateau_tibial` | Plateau tibial (Schatzker) | ⚠️ NO bloc poplité si syndrome des loges; TXA 1g+1g H+3 |
| `fracture_tibia_diaphysaire_clou` | Tibia diaphysaire (clouage) | ⚠️ NO bloc poplité; table traction Maquet |
| `fracture_pilon_tibial` | Pilon tibial | ORIF 2 temps; fenêtre J+7–14; TXA au temps 2 |
| `fracture_malleolaire` | Fracture malléolaire | Rachianesthésie ou bloc poplité+saphène; Weber ABC |
| `fixateur_externe_tibia` | Fixateur externe tibia (DCO polytrauma) | RSI etomidate+rocuronium; TXA dans 3h (CRASH-2) |

---

## 6. Index des procédures par ID Supabase {#index}

### Secteur 1 (13 procédures)
```
pontage_coronarien_cabg
remplacement_valvulaire_cardiaque
tavi_implantation_aortique
ablation_arythmie_rythmologie
fermeture_fop
ophtalmologie_ala
thoracotomie
vats_thoracoscopie
endarteriectomie_carotidienne
chirurgie_aaa_aortique
pontage_arteriel_peripherique
reconstruction_mammaire_senologie
chirurgie_plastique_paroi_abdominale
```

### Secteur 2 (23 procédures)
```
chirurgie_bariatrique
cholecystectomie_laparoscopique
colectomie_laparoscopique_racc
surrenalectomie_pheo
peridurale_analgesia_travail
cesarienne_rachianesthesie
cesarienne_ag
pre_eclampsie_hellp
hemorragie_post_partum
laparoscopie_gynecologique
prostatectomie_robot_assistee
appendicectomie_adulte
hernie_paroi_abdominale
fundoplicature_nissen
gastrectomie
resection_hepatique
proctologie_hemorroidectomie
hysteroscopie_operative
ivg_sedation
nephrectomie_laparoscopique
cystectomie_radicale
remifentanil_analgesia_travail
embolie_liquide_amniotique
```

### Secteur 3 (21 procédures)
```
adenoidectomie_att_paed
amygdalectomie_paed
chirurgie_oreille_paed
circoncision_paed
hypospade_paed
orchidopexie_paed
hernie_inguinale_paed
appendicectomie_paed
stenose_pylore_nourrisson
plaie_oeil_perforante_paed
strabisme_paed
nec_enterocolite_necrosante
canal_arteriel_permeable
sedation_imagerie_paed
chirurgie_oreille_adulte
chirurgie_endonasale_orl
laryngectomie_carcinologique
thyroidectomie_parathyroidectomie
extractions_dentaires_stomato
chirurgie_orthognathique
abces_dentaire_voies_aeriennes
```

### Secteur 4 (19 procédures)
```
arthroplastie_pth_ptg
fracture_hanche_hemiarthroplastie
arthroplastie_epaule
fracture_femur_diaphysaire
arthrodese_lombaire
chirurgie_pied_cheville
amputation_membre
fracture_humerus_proximal
fracture_col_femoral_deplacee_arthroplastie
fracture_pertrochanterienne_clou_cephalomedullaire
prothese_totale_genou
fracture_radius_distal
arthroscopie_genou_menisectomie
reconstruction_lca
fracture_plateau_tibial
fracture_tibia_diaphysaire_clou
fracture_pilon_tibial
fracture_malleolaire
fixateur_externe_tibia
```

**Total : 76 procédures**

---

## 7. Médicaments institutionnels {#drugs}

Liste des 25 médicaments disponibles dans AnesIA (IDs Supabase) :

| ID Supabase | Nom | Famille |
|-------------|-----|---------|
| `acide_tranexamique` | Acide tranexamique (Exacyl®) | Antifibrinolytique |
| `atropine` | Atropine | Anticholinergique |
| `bupivacaine` | Bupivacaïne (Marcaïne®) | ALR amide longue durée |
| `cefazoline` | Céfazoline (Kefzol®) | Céphalosporine 1G |
| `dexamethasone` | Dexaméthasone | Corticoïde |
| `enoxaparine` | Énoxaparine (Clexane®) | HBPM |
| `ephedrine` | Éphédrine | Sympathomimétique |
| `etomidate` | Étomidate (Hypnomidate®) | Hypnotique IV |
| `fentanyl` | Fentanyl | Opioïde µ |
| `ibuprofene` | Ibuprofène | AINS |
| `ketamine` | Kétamine | NMDA antagoniste |
| `ketorolac` | Kétorolac (Toradol®) | AINS IV |
| `lidocaine` | Lidocaïne (Xylocaïne®) | ALR amide courte durée |
| `midazolam` | Midazolam (Dormicum®) | Benzodiazépine |
| `morphine` | Morphine | Opioïde µ |
| `noradrenaline` | Noradrénaline | Vasopresseur |
| `ondansetron` | Ondansétron (Zofran®) | Antiémétique 5-HT3 |
| `paracetamol` | Paracétamol | Analgésique |
| `phenylephrine` | Phényléphrine | Vasopresseur α1 |
| `propofol` | Propofol (Diprivan®) | Hypnotique IV |
| `remifentanil` | Rémifentanil (Ultiva®) | Opioïde µ ultra-court |
| `rocuronium` | Rocuronium (Esmeron®) | Curare non dépolarisant |
| `sevoflurane` | Sévoflurane (Sevoflo®) | Halogéné |
| `sufentanil` | Sufentanil (Sufenta®) | Opioïde µ (épidurale) |
| `sugammadex` | Sugammadex (Bridion®) | Antagoniste rocuronium |

---

### Migrations Supabase associées

| Fichier | Contenu | Date |
|---------|---------|------|
| `20260303160000_seed_secteur1_cardiaque_vasculaire_ophtalmo_plastique.sql` | S1 — 13 procédures | 2026-03-03 |
| `20260303170000_seed_secteur2_digestif_gyneco_uro_obstetrique.sql` | S2 — 11 procédures (original) | 2026-03-03 |
| `20260303175000_seed_secteur2_supplement.sql` | S2 — 12 procédures (supplément) | 2026-03-03 |
| `20260303180000_seed_secteur3_pediatrie.sql` | S3 Pédiatrie — 14 procédures | 2026-03-03 |
| `20260303185000_seed_secteur3_orl_stomato.sql` | S3 ORL/Stomato — 7 procédures | 2026-03-03 |
| `20260303190000_seed_secteur4_ortho_remaining.sql` | S4 Ortho restant — 7 procédures | 2026-03-03 |
| `20260303200000_link_all_st_pierre_procedures.sql` | Lien profil hôpital | 2026-03-03 |

---

*Document généré le 2026-03-03 · AnesIA Quick Consult · CHU Saint-Pierre PGs 2025–2026*
