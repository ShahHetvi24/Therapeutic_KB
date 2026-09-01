# Acute Myeloid Leukemia (AML) — Disease-Specific Patient Cohort Definitions


## 11. Disease-Specific Patient Cohort Definitions

### 11.1 Core AML Cohort

**Inclusion Criteria**

1. At least one inpatient claim with AML ICD-10-CM diagnosis code, or
2. At least two outpatient claims with AML ICD-10-CM diagnosis codes separated by 7-90 days, or
3. AML diagnosis plus AML-directed therapy, bone marrow procedure, hematology/oncology visit, or molecular testing within a defined window.

**Recommended AML Codes**

- C92.00, C92.01, C92.02
- C92.40-C92.42 for APL, if included
- C92.50-C92.52
- C92.60-C92.62
- C92.A0-C92.A2
- C93.00-C93.02, C94.00-C94.02, C94.20-C94.22 where subtype logic requires inclusion

These codes align with ICD-10 AML/myeloid leukemia categories and administrative AML billing examples. [icd10data.com], [genentech-pro.com]

### 11.2 Exclusion Criteria

Exclude or separately flag:

1. Chronic myeloid leukemia codes such as C92.10-C92.12 unless blast-phase transformation is explicitly being studied.
2. Personal history-only code Z85.6 without active AML diagnosis or treatment.
3. APL if the business question focuses on non-APL AML.
4. Pediatric AML if the cohort is adult AML only.
5. Clinical trial-only therapy where drug identification is not visible in claims.

### 11.3 Subcohort Definitions

| Cohort | Suggested Definition |
|---|---|
| Newly diagnosed AML | Earliest AML diagnosis after 12-24 months AML-free lookback |
| Intensive-eligible proxy | Age <75, no severe frailty markers, intensive chemo observed, inpatient induction |
| Intensive-ineligible proxy | Age ≥75 or comorbidity/frailty markers, venetoclax + HMA/LDAC, no intensive induction |
| FLT3-mutated proxy | FLT3 test claim and use of midostaurin or gilteritinib |
| IDH1-mutated proxy | Ivosidenib use or IDH1 mutation result if EMR/genomics available |
| IDH2-mutated proxy | Enasidenib use or IDH2 mutation result if available |
| CD33-positive proxy | Gemtuzumab ozogamicin use |
| Secondary / AML-MRC proxy | C92.A codes, prior MDS/CMML diagnosis, CPX-351 use |
| R/R AML | Relapse code, salvage therapy, reinduction, menin inhibitor, gilteritinib/IDH inhibitor after prior AML therapy, or transplant after salvage |
| Transplant cohort | HSCT procedure codes and transplant facility claims |

---
