# Chronic Lymphocytic Leukemia (CLL) — Line-of-Therapy (LOT) Framework


## 12. Line-of-Therapy (LOT) Framework

### 12.1 LOT Construction Rules

1. **Index date:** first CLL-directed systemic therapy after CLL diagnosis.
2. **Regimen window:** group drugs started within 28-60 days into the same LOT, depending data granularity and regimen type.
3. **Continuous BTKi rule:** ongoing BTK inhibitor refills are continuation of the same LOT unless there is a clear switch, addition, or progression event.
4. **Fixed-duration rule:** venetoclax-based regimens may stop after planned duration; treatment end should not automatically indicate progression.
5. **Anti-CD20 combination rule:** obinutuzumab or rituximab started near venetoclax initiation should be grouped into the same line.
6. **Switch rule:** change from one BTKi to another may represent intolerance, access, or progression; use diagnosis, timing, and next therapy to classify.
7. **Progression trigger:** relapse code, new class addition, new regimen after treatment gap, start of pirtobrutinib, PI3K inhibitor, CAR-T, or Richter-directed regimen.
8. **Richter transformation rule:** once transformation is identified, subsequent therapy should be separated from CLL LOT.

### 12.2 Example LOT Schema

| LOT | Example Regimens | Notes |
|---|---|---|
| 1L continuous targeted | Acalabrutinib, zanubrutinib, or ibrutinib ± anti-CD20 | Continuous therapy; adherence and discontinuation matter |
| 1L fixed-duration | Venetoclax + obinutuzumab | Requires venetoclax ramp-up and TLS monitoring |
| 1L all-oral fixed-duration | Acalabrutinib + venetoclax | FDA approved in 2026 for adults with CLL/SLL |
| 2L targeted | BTKi after Ven-Obi, venetoclax-based therapy after BTKi, or alternate BTKi | Sequence depends on prior class exposure and reason for discontinuation |
| Post-covalent BTKi | Pirtobrutinib | Traditional approval in 2025 after prior covalent BTKi |
| Double-exposed late-line | Pirtobrutinib, liso-cel, clinical trial | Key high-unmet-need segment |
| Richter transformation | DLBCL-like or transformation-specific regimens | Should be separated from ordinary CLL progression |

---
