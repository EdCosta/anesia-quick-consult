BEGIN;

UPDATE public.hospital_profiles
SET
  protocol_overrides = jsonb_set(
    COALESCE(protocol_overrides, '{}'::jsonb),
    '{procedure_ids}',
    '[
      "arthroplastie_epaule",
      "fracture_femur_diaphysaire",
      "fracture_humerus_proximal",
      "chirurgie_pied_cheville",
      "fracture_hanche_hemiarthroplastie",
      "arthroplastie_pth_ptg",
      "fracture_radius_distal",
      "fracture_col_femoral_deplacee_arthroplastie",
      "fracture_pertrochanterienne_clou_cephalomedullaire",
      "prothese_totale_genou"
    ]'::jsonb,
    true
  ),
  updated_at = now()
WHERE id = 'hopital_st_pierre_pgs_2025_2026';

COMMIT;
