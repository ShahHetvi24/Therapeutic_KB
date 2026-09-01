# Multiple Myeloma (MM) — Disease-Specific Patient Cohort Definitions


## 11. Disease-Specific Patient Cohort Definitions

### 11.1 Core MM Cohort

Recommended inclusion logic:

1. At least one inpatient claim with MM ICD-10-CM C90.00, C90.01, or C90.02, or
2. At least two outpatient claims with MM diagnosis codes separated by 7-180 days, or
3. MM diagnosis plus MM-directed therapy, hematology/oncology visit, bone marrow biopsy, monoclonal protein testing, FISH/cytogenetics, or myeloma-specific therapy.

### 11.2 Exclusion / Flagging Rules

Exclude or separately flag:

1. MGUS without active MM therapy or myeloma-defining events.
2. Smoldering MM unless studying precursor-state market or high-risk SMM treatment.
3. Solitary plasmacytoma without systemic MM.
4. Plasma cell leukemia as a separate high-risk cohort.
5. AL amyloidosis without systemic MM if not part of scope.
6. History-only Z85.79 without active MM diagnosis or therapy.
7. Bone agents without MM diagnosis, because zoledronic acid and denosumab are used in other cancers/osteoporosis.
8. Clinical trial-only therapy if product cannot be identified.

### 11.3 Subcohort Definitions

| Cohort | Suggested Definition |
|---|---|
| Newly diagnosed MM | First C90.00 diagnosis after 12-24 months MM-free lookback plus MM-directed workup/therapy |
| Transplant-eligible proxy | Younger age, lower comorbidity burden, induction therapy followed by stem cell collection or ASCT codes |
| Transplant-ineligible proxy | Older age/frailty/comorbidity, no stem cell collection/ASCT, continuous frontline therapy |
| Smoldering MM | SMM documentation or precursor plasma-cell disorder without CRAB/myeloma-defining events; high-risk SMM if daratumumab/hyaluronidase use appears after 2025 label |
| Maintenance cohort | Lenalidomide or other maintenance after induction/ASCT without progression evidence |
| First relapse | New regimen after frontline/maintenance or C90.02 relapse code |
| Lenalidomide-refractory proxy | Therapy switch while on lenalidomide maintenance or progression shortly after lenalidomide exposure |
| Anti-CD38-exposed | Prior daratumumab or isatuximab claim |
| Triple-class exposed | Prior PI, IMiD, and anti-CD38 therapy |
| BCMA-exposed | Prior BCMA CAR-T, teclistamab, elranatamab, or BCMA ADC |
| CAR-T cohort | Leukapheresis, lymphodepletion, product administration, CAR-T hospitalization, or CAR-T product claim |
| Bispecific cohort | Teclistamab, talquetamab, elranatamab, or other bispecific claim with step-up dosing pattern |
| High-risk cytogenetic cohort | Documented del(17p), t(4;14), t(14;16), t(14;20), gain/amp 1q, or high-risk notation in EHR/genomics |

---
