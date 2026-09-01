# Chronic Lymphocytic Leukemia (CLL) — Disease-Specific Patient Cohort Definitions


## 11. Disease-Specific Patient Cohort Definitions

### 11.1 Core CLL Cohort

**Recommended inclusion logic:**

1. At least one inpatient claim with CLL ICD-10-CM code C91.10, C91.11, or C91.12, or
2. At least two outpatient claims with CLL ICD-10-CM codes separated by 7-180 days, or
3. CLL diagnosis plus CLL-directed therapy, hematology/oncology visit, flow cytometry, FISH/TP53/IGHV testing, or anti-CD20/BTK/BCL-2 CLL therapy.

### 11.2 CLL/SLL Expanded Cohort

For broader CLL/SLL analytics, include SLL-related lymphoma codes and anti-CD20/BTK/BCL-2 treatment patterns when SLL is documented. This is important because SEER and NCCN recognize CLL/SLL as a combined disease entity, while claims may separate leukemia and lymphoma coding. [SEER CLL/SLL Stat Facts], [NCCN CLL/SLL Guidelines 2026]

### 11.3 Exclusion Criteria

Exclude or flag separately:

1. History-only code Z85.6 without active CLL diagnosis or therapy.
2. Mantle cell lymphoma, follicular lymphoma, marginal zone lymphoma, hairy cell leukemia, and Waldenstrom macroglobulinemia unless study scope includes broader B-cell malignancies.
3. Richter transformation if analyzing standard CLL treatment patterns.
4. Clinical trial-only therapy if product cannot be identified in claims.
5. Anti-CD20 therapy used for non-CLL autoimmune or lymphoma indications unless linked to CLL diagnosis.

### 11.4 Subcohort Definitions

| Cohort | Suggested Definition |
|---|---|
| Newly diagnosed CLL | First CLL claim after 12-24 months CLL-free lookback |
| Watch-and-wait | CLL diagnosis with no CLL systemic therapy within defined post-diagnosis window, typically 90-180 days or longer |
| First-line treated CLL | First systemic CLL therapy after diagnosis |
| Continuous BTKi cohort | Acalabrutinib, zanubrutinib, or ibrutinib therapy with ongoing fills and no fixed stop date |
| Fixed-duration venetoclax cohort | Venetoclax plus obinutuzumab or venetoclax plus rituximab with expected finite therapy duration |
| All-oral fixed-duration cohort | Acalabrutinib plus venetoclax after 2026 approval and relevant claim availability |
| R/R CLL | Subsequent line after prior CLL systemic therapy, relapse code C91.12, or switch after progression proxy |
| Double-exposed CLL | Prior BTK inhibitor and prior BCL-2 inhibitor exposure |
| Post-covalent-BTK cohort | Prior acalabrutinib, zanubrutinib, or ibrutinib; may transition to pirtobrutinib |
| CAR-T eligible late-line cohort | R/R CLL/SLL after at least two prior lines including BTK inhibitor and BCL-2 inhibitor |
| Richter transformation cohort | CLL plus aggressive lymphoma diagnosis/biopsy/proxy transformation regimen |

---
