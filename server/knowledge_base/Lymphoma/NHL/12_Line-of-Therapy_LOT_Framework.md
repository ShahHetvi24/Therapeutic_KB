# Non-Hodgkin Lymphoma (NHL) — Line-of-Therapy (LOT) Framework


## 12. Line-of-Therapy (LOT) Framework

### 12.1 LOT Construction Rules

1. **Index date:** first NHL-directed systemic therapy after confirmed NHL diagnosis.
2. **Regimen window:** group drugs initiated within 28-60 days into the same regimen, depending subtype and regimen length.
3. **Subtype-specific rules:** DLBCL uses curative-intent cycles; FL may include observation and long treatment gaps; MCL may include induction, transplant, and maintenance.
4. **Maintenance exception:** rituximab maintenance or post-induction maintenance should not automatically trigger a new LOT.
5. **Radiation exception:** localized radiation may be initial local therapy and should be captured separately from systemic LOT.
6. **CAR-T handling:** leukapheresis, lymphodepletion, product infusion, hospitalization, CRS/ICANS care, and bridging therapy should be grouped as a CAR-T episode rather than multiple independent LOTs.
7. **Bispecific step-up dosing:** step-up dosing and hospitalization/monitoring should be part of the same bispecific LOT.
8. **Transformation trigger:** switch from indolent regimen to aggressive lymphoma regimen after transformed diagnosis should create transformed-LBCL pathway.
9. **New line trigger:** addition of new active systemic class after regimen window, start of salvage regimen, CAR-T, bispecific, ADC after progression, or substantial treatment gap followed by active therapy.
10. **Supportive-only therapies:** growth factors, transfusions, antimicrobials, IVIG, and antiemetics should not define a new LOT.

### 12.2 Example LOT Schema by Subtype

| Subtype | LOT | Example Regimens / Events |
|---|---|---|
| DLBCL | 1L | R-CHOP, Polivy-R-CHP, DA-EPOCH-R |
| DLBCL | 2L | CAR-T if early relapse/refractory and eligible, salvage chemo + ASCT if late relapse and transplant eligible |
| DLBCL | 3L+ | Epcoritamab, glofitamab, loncastuximab, polatuzumab-based therapy, tafasitamab-lenalidomide, clinical trial |
| FL | Watch-and-wait | Diagnosis without therapy until active treatment trigger |
| FL | 1L | Rituximab, BR, obinutuzumab-based therapy, R2, radiation for localized disease |
| FL | 2L | R2, anti-CD20-based therapy, epcoritamab + R2, clinical trial |
| FL | 3L+ | Mosunetuzumab, epcoritamab, CAR-T, tazemetostat, clinical trial |
| MCL | 1L | BR, intensive cytarabine-containing therapy, transplant/maintenance in selected patients |
| MCL | R/R | BTK inhibitor, CAR-T, pirtobrutinib, clinical trial |
| PTCL | 1L | BV-CHP for CD30-positive PTCL, CHOP-like therapy, clinical trial |
| PTCL | R/R | Brentuximab, pralatrexate, HDAC inhibitor, clinical trial |

---
