# Multiple Myeloma (MM) — Line-of-Therapy (LOT) Framework


## 12. Line-of-Therapy (LOT) Framework

### 12.1 LOT Construction Rules

1. **Index date:** first MM-directed systemic therapy after diagnosis.
2. **Regimen window:** group agents started within 28-60 days into the same line; MM induction frequently uses triplets or quadruplets.
3. **Induction vs transplant vs maintenance:** induction, ASCT, consolidation, and maintenance should be separated as phases but not automatically counted as new progression-driven LOTs.
4. **Maintenance exception:** lenalidomide maintenance after induction/ASCT is a continuation/maintenance phase unless evidence of progression appears.
5. **Dose holds and gaps:** temporary treatment holds for cytopenias, infection, surgery, stem cell collection, or transplant should not automatically create a new LOT.
6. **New-line trigger:** addition of a new active anti-myeloma class after regimen window, switch due to progression, relapse code C90.02, start of CAR-T/bispecific/ADC after prior regimen, or substantial gap followed by new therapy.
7. **Class exposure logic:** track PI, IMiD, anti-CD38, BCMA, GPRC5D, FcRH5, CAR-T, ADC, and bispecific exposure separately.
8. **CAR-T episode handling:** leukapheresis, bridging therapy, lymphodepletion, product infusion, CRS/ICANS care, and follow-up should be grouped as a cell-therapy episode.
9. **Bispecific step-up dosing:** step-up and first full dose should be classified within one bispecific LOT, not multiple starts.
10. **Supportive-care-only products:** bone agents, IVIG, transfusions, antimicrobials, pain medications, and growth factors should not define MM LOT.

### 12.2 Example LOT Schema

| LOT / Phase | Example Regimens / Events | Notes |
|---|---|---|
| 1L induction, transplant eligible | Dara-VRd, VRd, Dara-VTd, KRd-based approaches depending practice/label | Include anti-CD38 quadruplets and PI/IMiD backbone |
| ASCT episode | Stem cell collection, high-dose melphalan, autologous transplant | Separate episode, not necessarily new LOT |
| Consolidation | Additional induction-like cycles after ASCT | Continuation phase |
| Maintenance | Lenalidomide ± PI or other risk-adapted maintenance | Long duration; not progression by itself |
| 1L transplant-ineligible | Dara-Rd, Dara-VRd, VRd-lite, VMP-like approaches depending label/fitness | Continuous vs fixed/intensified frontline patterns |
| 2L / first relapse | Dara/pom/dex, Isa/pom/dex, carfilzomib combinations, Tec-Dara after 2026 label if eligible | Lenalidomide-refractory segmentation critical |
| 3L+ RRMM | CAR-T, BCMA bispecific, GPRC5D bispecific, selinexor, clinical trial | Track antigen exposure |
| Post-BCMA relapse | Talquetamab, FcRH5 trials, CELMoDs, clinical trial | High-unmet-need segment |
| Supportive / palliative | Steroids, transfusions, bone agents, pain management | Separate from systemic anti-MM LOT |

---
