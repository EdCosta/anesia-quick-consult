# Hôpital St Pierre PGs 2025-2026 Intake Notes

## Source

- Document: `FASCICULE DE PROTOCOLES PGs 2025-2026 11225.pdf`
- Source path used for intake: `C:\Users\meg_e\Documents\MEDICO\Anestesio\Ano 5\FASCICULE DE PROTOCOLES PGs 2025-2026 11225.pdf`
- Extracted page count: `174`
- Working assumption: this is a local institutional handbook for anesthesia assistants, centered on perioperative workflow and service-specific protocols.

## High-Level Structure

- Pages `3-4`: table of contents
- Sector 1: adult cardiac / thoracic / vascular / ophthalmology / breast / plastic surgery
- Sector 2: obstetrics, including the labor ward handbook (`Bible de la salle d'accouchement`)
- Sector 3: pediatrics, ENT, stomatology / maxillofacial
- Sector 4: orthopedics, neurosurgery, and out-of-OR endoscopy

## Concrete Sections Confirmed During Extraction

- Page `6`: `Chirurgie cardiaque`
- Page `16`: `Cardiologie interventionnelle / Rythmologie`
- Page `69`: `Bible de la salle d'accouchement`
- Page `94`: `Protocoles en pédiatrie Hôpital St Pierre 2025-2026`
- Pages `144-150`: `Secteur 4` and the orthopedics protocol tables
- Page `170`: a massive hemorrhage / transfusion workflow section

## Orthopedics Signal Already Useful For Product Data

The orthopedic tables on pages `149-150` are structured enough to support hospital-local defaults:

- recurring antibiotic default: `Céfazoline 2 g avant l'incision`
- repeated anticoagulation default: `HBPM H+6` for many procedures
- repeated antifibrinolytic pattern: `Exacyl` (tranexamic acid) in selected cases
- repeated regional anesthesia patterns:
  - `Bloc PENG / iliofascial` for hip cases
  - `Bloc fémoral` or `bloc canal des adducteurs`
  - `Bloc poplité faible dose` where compartment syndrome surveillance matters
  - `Bloc interscalénique` for shoulder arthroplasty
- disposition clues:
  - `Hospit`
  - `One day`
  - `Hospit gériatrie`

These are appropriate as hospital-level metadata and local formulary defaults, not as hard safety logic without clinician review.

## What Was Incorporated In This Repo

- A reusable extraction utility was added:
  - `scripts/extract_hospital_pdf.py`
- A seeded hospital profile was added via migration:
  - profile id: `hopital_st_pierre_pgs_2025_2026`
  - default language: `fr`
  - country: `BE`
- The seeded profile stores:
  - a starter formulary of common drugs explicitly repeated in the fascicle's orthopedic content
  - preferred presentations for those drugs when they already exist in the canonical drug catalog
  - structured `protocol_overrides` metadata describing source, priority domains, and orthopedic defaults
- Hospital drug availability rows were also seeded for the starter formulary so the profile is immediately usable in the UI.

## Current Scope vs Remaining Work

Done in this pass:

- source identified and partially extracted
- source structure summarized
- one hospital profile seeded
- orthopedic defaults represented as metadata
- starter formulary linked to existing drug and presentation records

Still manual / clinical-review dependent:

- converting each specialty chapter into first-class `procedures`, `protocoles`, or `guidelines`
- validating dosages, timing, and edge cases before turning local notes into executable decision support
- encoding complex flowcharts such as obstetric emergencies or massive transfusion as app-native protocol content
- mapping every table row in orthopedics to a canonical procedure id with page-by-page provenance

## Recommended Next Imports

- `Bible de la salle d'accouchement` into `protocoles`
- pediatric perioperative pathways from the St Pierre pediatric section
- massive transfusion / hemorrhage workflow from the late pages
- deeper orthopedic procedure mapping from pages `149-150` into existing ortho procedures already seeded in March 2026
