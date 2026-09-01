# Acute Myeloid Leukemia (AML) — Line-of-Therapy (LOT) Framework


## 12. Line-of-Therapy (LOT) Framework

### 12.1 LOT Construction Rules

1. **Index date:** first AML-directed systemic therapy after AML diagnosis.
2. **Regimen window:** agents started within 28 days of the first AML drug are grouped into the same regimen.
3. **Cycle-based continuation:** cytotoxic induction/consolidation may have long inpatient gaps and should not automatically trigger a new line.
4. **New line trigger:** addition of a new non-maintenance AML drug after the regimen-defining window, switch to salvage therapy, relapse code plus new therapy, or substantial treatment gap followed by AML therapy.
5. **Maintenance exception:** post-remission oral azacitidine or continuation strategy should be classified as maintenance, not automatically as a new disease-progression line.
6. **Transplant handling:** allogeneic transplant should be captured as a treatment event and may define post-transplant phase rather than a conventional LOT.
7. **Supportive-only periods:** transfusions, antimicrobials, growth factors, and hydroxyurea alone should not define systemic AML LOT unless business rules include cytoreduction.

### 12.2 Example LOT Schema

| LOT | Example Regimens | Notes |
|---|---|---|
| 1L intensive | 7+3 ± midostaurin; CPX-351; FLAG-IDA-like induction | Often inpatient; may include reinduction before response |
| 1L low-intensity | Venetoclax + azacitidine; venetoclax + decitabine; venetoclax + LDAC | Common older/unfit pathway |
| Consolidation | HiDAC; cytarabine-based consolidation; CPX-351 consolidation | Usually not counted as new LOT |
| Maintenance | Oral azacitidine; targeted maintenance in selected settings | Separate maintenance phase |
| 2L / salvage | Gilteritinib, IDH inhibitor, menin inhibitor, salvage chemotherapy | Triggered by relapse/refractory status |
| 3L+ | Clinical trial, targeted rechallenge, palliative HMA, supportive care | High unmet need |

---
