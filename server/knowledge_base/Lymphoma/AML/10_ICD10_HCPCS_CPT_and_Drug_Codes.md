# Acute Myeloid Leukemia (AML) — ICD-10, HCPCS/CPT and Drug Code Reference


## 10. ICD-10, HCPCS/CPT and Drug Code Reference


### 10.1 ICD/10 Codes

#### 10.1.1 Core AML ICD-10-CM Codes

| ICD-10-CM Code | Description | Notes |
|---|---|---|
| C92.00 | Acute myeloblastic leukemia, not having achieved remission | Billable AML code |
| C92.01 | Acute myeloblastic leukemia, in remission | Used for remission-state tracking |
| C92.02 | Acute myeloblastic leukemia, in relapse | Useful for R/R cohort logic |
| C92.40 | Acute promyelocytic leukemia, not having achieved remission | APL should often be separated from non-APL AML |
| C92.41 | Acute promyelocytic leukemia, in remission | APL remission |
| C92.42 | Acute promyelocytic leukemia, in relapse | APL relapse |
| C92.50 | Acute myelomonocytic leukemia, not having achieved remission | Subtype-specific AML code |
| C92.51 | Acute myelomonocytic leukemia, in remission | Subtype-specific remission |
| C92.52 | Acute myelomonocytic leukemia, in relapse | Subtype-specific relapse |
| C92.60 | Acute myeloid leukemia with 11q23-abnormality, not having achieved remission | Captures 11q23/KMT2A-related coding bucket |
| C92.61 | Acute myeloid leukemia with 11q23-abnormality, in remission | Remission |
| C92.62 | Acute myeloid leukemia with 11q23-abnormality, in relapse | Relapse |
| C92.A0 | Acute myeloid leukemia with multilineage dysplasia, not having achieved remission | AML-MRC / MDS-related coding bucket |
| C92.A1 | Acute myeloid leukemia with multilineage dysplasia, in remission | Remission |
| C92.A2 | Acute myeloid leukemia with multilineage dysplasia, in relapse | Relapse |
| C92.Z0 | Other myeloid leukemia, not having achieved remission | Use cautiously |
| C92.Z1 | Other myeloid leukemia, in remission | Use cautiously |
| C92.Z2 | Other myeloid leukemia, in relapse | Use cautiously |
| C92.90 | Myeloid leukemia, unspecified, not having achieved remission | Avoid if specific AML codes are available |
| C92.91 | Myeloid leukemia, unspecified, in remission | Avoid if specific AML codes are available |
| C92.92 | Myeloid leukemia, unspecified, in relapse | Avoid if specific AML codes are available |

ICD10 Data lists C92.0 as acute myeloblastic leukemia and notes that C92.0 itself is non-billable/non-specific because greater specificity is required, while C92.00, C92.01, and C92.02 specify non-remission, remission, and relapse states. [icd10data.com]

#### 10.1.2 Additional Related Codes for AML Cohort Refinement

| Code | Description | Use Case |
|---|---|---|
| C93.00 | Acute monoblastic/monocytic leukemia, not having achieved remission | AML-related monocytic subtype logic |
| C94.00 | Acute erythroid leukemia, not having achieved remission | AML-related erythroid subtype logic |
| C94.20 | Acute megakaryoblastic leukemia, not having achieved remission | AML-related megakaryoblastic subtype logic |
| D61.818 | Other pancytopenia | Supportive diagnostic signal when paired with AML |
| Z85.6 | Personal history of leukemia | Survivorship/history code, not active AML |

Genentech’s venetoclax AML billing reference lists multiple AML-related ICD-10-CM codes including C92.00, C92.01, C92.50, C92.51, C92.60, C92.61, C92.A0, C92.A1, C93.00, C93.01, C94.00, C94.01, C94.20, and C94.21 for administrative coding context. [genentech-pro.com]

---

### 10.2 CPT Drug Administration Code

#### 10.2.1 Common CPT Administration Code Framework

| CPT / Code Family | Typical Use in AML |
|---|---|
| 96413 | Chemotherapy IV infusion, initial, up to 1 hour |
| 96415 | Each additional hour of chemotherapy infusion |
| 96417 | Sequential chemotherapy infusion, additional substance/drug |
| 96409 | Chemotherapy IV push, initial substance/drug |
| 96411 | Chemotherapy IV push, each additional substance/drug |
| 96401 | Chemotherapy administration, subcutaneous or intramuscular |
| 96365 | Therapeutic/prophylactic/diagnostic IV infusion, initial, up to 1 hour |
| 96366 | Each additional hour of non-chemotherapy infusion |
| 96372 | Therapeutic/prophylactic/diagnostic injection, subcutaneous or intramuscular |
| 38220 | Bone marrow aspiration |
| 38221 | Bone marrow biopsy |
| 38222 | Bone marrow aspiration and biopsy at same encounter |

CMS has a billing and coding article for infusion, injection, and hydration services, and AAPC describes CPT 96413 as IV infusion chemotherapy administration for a single or initial substance/drug up to one hour. [cms.gov], [aapc.com]

#### 10.2.2 Coding Notes

- Use the drug-specific HCPCS J-code for physician office or hospital outpatient buy-and-bill drugs when applicable. CMS and coding references note that HCPCS codes are used with drug billing and that coverage/payment may depend on payer and setting. [cms.gov]
- Oral AML drugs such as venetoclax, midostaurin, gilteritinib, ivosidenib, enasidenib, oral azacitidine, and oral decitabine/cedazuridine are commonly processed under pharmacy benefit or NDC-based medical/pharmacy workflows rather than J-code buy-and-bill in many settings. [genentech-pro.com]
- Administration codes should be selected based on route, drug complexity, indication, infusion time, sequence, setting of care, payer policy, and documentation. [cms.gov], [aapc.com]

---

### 10.3 Selected Drug HCPCS Codes by Disease Market Basket

#### 10.3.1 AML Buy-and-Bill / Medical Benefit Drug Codes

| AML Product | Generic | HCPCS Code | Descriptor / Billing Unit | Notes |
|---|---|---|---|---|
| Vidaza / generics | Azacitidine injection | J9025 | Injection, azacitidine, 1 mg | Valid 2026 HCPCS code; chemotherapy drug category |
| Dacogen / generics | Decitabine injection | J0894 | Injection, decitabine, 1 mg | Valid 2026 HCPCS code; injection drug category |
| Mylotarg | Gemtuzumab ozogamicin | J9203 | Injection, gemtuzumab ozogamicin, 0.1 mg | Valid 2026 HCPCS code; CD33 ADC, chemotherapy category |
| Vyxeos | Daunorubicin/cytarabine liposome | J9153 | Injection, liposomal, 1 mg daunorubicin and 2.27 mg cytarabine | Valid 2026 HCPCS code; Jazz Pharmaceuticals product |
| Cytarabine | Cytarabine injection | J9100 / related cytarabine codes depending formulation | Verify current HCPCS/formulation | Common cytotoxic chemotherapy backbone; verify payer and formulation |
| Daunorubicin | Daunorubicin injection | J9150 / related anthracycline code depending formulation | Verify current HCPCS/formulation | Used in 7+3; verify product-specific code |
| Idarubicin | Idarubicin injection | J9211 / related code depending formulation | Verify current HCPCS/formulation | Alternative anthracycline in some regimens |

Sources: HCPCS references for azacitidine, decitabine, gemtuzumab ozogamicin, and Vyxeos. [hcpcs.codes], [seer.cancer.gov], [buyandbill.com]

#### 10.3.2 AML Oral / Pharmacy Benefit Products

| AML Product | Generic | Coding Approach |
|---|---|---|
| Venclexta | Venetoclax | NDC/pharmacy claim; no standard J-code in routine oral use |
| Rydapt | Midostaurin | NDC/pharmacy claim |
| Xospata | Gilteritinib | NDC/pharmacy claim |
| Tibsovo | Ivosidenib | NDC/pharmacy claim |
| Idhifa | Enasidenib | NDC/pharmacy claim |
| Onureg | Oral azacitidine | NDC/pharmacy claim |
| Daurismo | Glasdegib | NDC/pharmacy claim |
| Revuforj | Revumenib | NDC/pharmacy claim |
| Komzifti | Ziftomenib | NDC/pharmacy claim |
| Inqovi | Decitabine/cedazuridine | NDC/pharmacy claim |

Genentech’s venetoclax AML billing documentation provides NDC-based billing examples for oral venetoclax and states that coding requirements vary by patient, setting of care, and payer. [genentech-pro.com]

---
