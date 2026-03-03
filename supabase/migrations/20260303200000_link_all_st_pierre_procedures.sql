-- Migration: Link all St-Pierre PGs 2025-2026 procedures to hospital profile
-- Merges all new procedure IDs seeded in migrations 20260303160000–20260303190000
-- into protocol_overrides.procedure_ids (deduplicating against existing entries)

BEGIN;

UPDATE public.hospital_profiles
SET
  protocol_overrides = jsonb_set(
    protocol_overrides,
    '{procedure_ids}',
    (
      SELECT jsonb_agg(DISTINCT proc_id ORDER BY proc_id)
      FROM (
        -- Preserve any already-stored procedure_ids
        SELECT jsonb_array_elements_text(
          COALESCE(protocol_overrides -> 'procedure_ids', '[]'::jsonb)
        ) AS proc_id
        FROM public.hospital_profiles
        WHERE id = 'hopital_st_pierre_pgs_2025_2026'

        UNION ALL

        -- Sector 1 – Cardiaque / Vasculaire / Ophtalmo / Plastique
        SELECT unnest(ARRAY[
          'pontage_coronarien_cabg',
          'remplacement_valvulaire_cardiaque',
          'tavi_implantation_aortique',
          'ablation_arythmie_rythmologie',
          'fermeture_fop',
          'ophtalmologie_ala',
          'thoracotomie',
          'vats_thoracoscopie',
          'endarteriectomie_carotidienne',
          'chirurgie_aaa_aortique',
          'pontage_arteriel_peripherique',
          'reconstruction_mammaire_senologie',
          'chirurgie_plastique_paroi_abdominale'
        ]) AS proc_id

        UNION ALL

        -- Sector 2 – Digestif / Gynéco / Uro / Obstétrique (original + supplement)
        SELECT unnest(ARRAY[
          'chirurgie_bariatrique',
          'cholecystectomie_laparoscopique',
          'colectomie_laparoscopique_racc',
          'surrenalectomie_pheo',
          'peridurale_analgesia_travail',
          'cesarienne_rachianesthesie',
          'cesarienne_ag',
          'pre_eclampsie_hellp',
          'hemorragie_post_partum',
          'laparoscopie_gynecologique',
          'prostatectomie_robot_assistee',
          'appendicectomie_adulte',
          'hernie_paroi_abdominale',
          'fundoplicature_nissen',
          'gastrectomie',
          'resection_hepatique',
          'proctologie_hemorroidectomie',
          'hysteroscopie_operative',
          'ivg_sedation',
          'nephrectomie_laparoscopique',
          'cystectomie_radicale',
          'remifentanil_analgesia_travail',
          'embolie_liquide_amniotique'
        ]) AS proc_id

        UNION ALL

        -- Sector 3 – Pédiatrie / ORL / Stomatologie
        SELECT unnest(ARRAY[
          'adenoidectomie_att_paed',
          'amygdalectomie_paed',
          'chirurgie_oreille_paed',
          'circoncision_paed',
          'hypospade_paed',
          'orchidopexie_paed',
          'hernie_inguinale_paed',
          'appendicectomie_paed',
          'stenose_pylore_nourrisson',
          'plaie_oeil_perforante_paed',
          'strabisme_paed',
          'nec_enterocolite_necrosante',
          'canal_arteriel_permeable',
          'sedation_imagerie_paed',
          'chirurgie_oreille_adulte',
          'chirurgie_endonasale_orl',
          'laryngectomie_carcinologique',
          'thyroidectomie_parathyroidectomie',
          'extractions_dentaires_stomato',
          'chirurgie_orthognathique',
          'abces_dentaire_voies_aeriennes'
        ]) AS proc_id

        UNION ALL

        -- Sector 4 – Orthopédie supplémentaire
        SELECT unnest(ARRAY[
          'arthroscopie_genou_menisectomie',
          'reconstruction_lca',
          'fracture_plateau_tibial',
          'fracture_tibia_diaphysaire_clou',
          'fracture_pilon_tibial',
          'fracture_malleolaire',
          'fixateur_externe_tibia'
        ]) AS proc_id

        UNION ALL

        -- Sector 4 – Orthopédie batches 1-3 (previously seeded)
        SELECT unnest(ARRAY[
          'arthroplastie_pth_ptg',
          'fracture_hanche_hemiarthroplastie',
          'arthroplastie_epaule',
          'fracture_femur_diaphysaire',
          'arthrodese_lombaire',
          'chirurgie_pied_cheville',
          'amputation_membre',
          'fracture_humerus_proximal',
          'fracture_col_femoral_deplacee_arthroplastie',
          'fracture_pertrochanterienne_clou_cephalomedullaire',
          'prothese_totale_genou',
          'fracture_radius_distal'
        ]) AS proc_id
      ) sub
    ),
    true  -- create key if missing
  ),
  updated_at = now()
WHERE id = 'hopital_st_pierre_pgs_2025_2026';

-- Also update the sections metadata to reflect the full procedure count
UPDATE public.hospital_profiles
SET
  protocol_overrides = jsonb_set(
    protocol_overrides,
    '{sections}',
    '[
      {"key":"secteur_1","label":"Cardiaque / thoracique / vasculaire / ophtalmologie / plastique","page_start":5,"procedure_count":13},
      {"key":"secteur_2","label":"Digestif / Gynécologie / Urologie / Obstétrique","page_start":42,"procedure_count":23},
      {"key":"secteur_3","label":"Pédiatrie / ORL / Stomatologie / Maxillo-facial","page_start":93,"procedure_count":21},
      {"key":"secteur_4","label":"Orthopédie, neurochirurgie, endoscopie","page_start":144,"procedure_count":19}
    ]'::jsonb,
    true
  ),
  updated_at = now()
WHERE id = 'hopital_st_pierre_pgs_2025_2026';

COMMIT;
