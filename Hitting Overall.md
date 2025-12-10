# Hitting Overall Formula v10 - FINAL
## CLB Season 2 Complete Documentation

---

## Executive Summary

**Formula:** `HO = scaled(wOPS)` where `wOPS = 1.5Ã—BA + 2Ã—ISO`

This version updates hit rates from cross-season empirical analysis (ASA S2, S4, CLB S1), adjusts T1 trajectory to restore SLG King identity, and introduces CP caps by trajectory/class to preserve hierarchy.

**Key Changes from v9:**
- Hit rates updated from cross-season empirical analysis (charge and slap separated)
- HR rate formula: `(CP - 40) / 150` â†’ `0.10 + (CP - 40) / 200`
- T1 charge trajectory: 42% air â†’ 48% air (LL -6, FB +7, DF -1)
- T2 Power CP cap: 88 (down from 92)
- wOPS bounds: 0.372-1.398 â†’ 0.736-1.634

**Why These Changes?**
- Empirical analysis of 189 player-seasons showed High trajectory worth +24 WP, Medium+HC worth +22 WP
- T1 needed higher air% to achieve SLG King status over T2 with Hit Curve
- T2 Power CP cap prevents T2 from matching T1's SLG ceiling
- New hit rates better reflect actual game outcomes across multiple seasons

---

## Part 1: Core Formula

### 1.1 wOPS Calculation

```
wOPS = 1.5Ã—BA + 2Ã—ISO
```

**Why this weighting?**
- Traditional OPS (2Ã—BA + ISO) correlates r=0.861 with individual RBI
- Power-weighted (1.5Ã—BA + 2Ã—ISO) correlates r=0.920 with individual RBI
- Power weighting properly values HR production and creates slap build differentiation

### 1.2 BA Calculation

```
BA = Base_BA + SP_Adjustment

Base_BA = Î£(Outcome% Ã— Hit_Rate)
```

Where hit rates are empirically derived from cross-season analysis (ASA S2, S4, CLB S1):

**Charge Swing Hit Rates:**
| Outcome | Hit Rate | Source |
|---------|----------|--------|
| GB (Ground Ball) | 30% | Cross-season empirical |
| LL (Line Low) | 81% | Cross-season empirical |
| HL (High Liner) | 80% | Cross-season empirical |
| Air (FB+DF) | HR_rate(CP) | CP formula |

**Slap Swing Hit Rates:**
| Outcome | Hit Rate | Source |
|---------|----------|--------|
| GB (Ground Ball) | 10% | Cross-season empirical |
| LL (Line Low) | 39% | Cross-season empirical |
| HL (High Liner) | 74% | Cross-season empirical |
| Air (FB+DF) | 71% | Cross-season empirical |

### 1.3 ISO Calculation

```
ISO = HR% Ã— 3
HR% = Charge_Air% Ã— HR_rate(CP)
```

**Note:** XBH (doubles/triples) contribution is negligible at Speed â‰¤70 and excluded for simplicity.

### 1.4 SLG Calculation

```
SLG = BA + ISO
```

---

## Part 2: CP Formula (HR Rate)

**Continuous formula:**

```
HR_rate = 0.10 + (CP - 40) / 200    for CP < 94
HR_rate = 100%                      for CP â‰¥ 94 (automatic HO 10)
```

### 2.1 CP to HR Rate Table

| CP | HR Rate |
|----|---------|
| 40 | 10.0% |
| 50 | 15.0% |
| 60 | 20.0% |
| 70 | 25.0% |
| 80 | 30.0% |
| 85 | 32.5% |
| 88 | 34.0% |
| 90 | 35.0% |
| 92 | 36.0% |
| 93 | 36.5% |
| **94+** | **100%** |

### 2.2 Formula Comparison (v9 vs v10)

| CP | v9: (CP-40)/150 | v10: 0.10+(CP-40)/200 |
|----|-----------------|----------------------|
| 40 | 0.0% | 10.0% |
| 60 | 13.3% | 20.0% |
| 70 | 20.0% | 25.0% |
| 80 | 26.7% | 30.0% |
| 93 | 35.3% | 36.5% |

### 2.3 Why the Change?

The v10 formula includes a base 10% HR rate even at low CP, better matching empirical observations that even low-power players occasionally hit home runs. The gentler slope (Ã·200 vs Ã·150) combined with the base rate produces similar values at high CP while being more realistic at low CP.

---

## Part 3: SP Formula (BA Adjustment)

**Continuous formula (unchanged from v9):**

```
SP_Adjustment = 0.005 Ã— (SP - 60) Ã— Slap%
```

Where:
- SP 60 is the baseline
- **Values below SP 60 go negative** â€” low SP penalizes BA
- Slap% comes from character class

### 3.1 SP Effect by Class

| SP | Power (20%) | Balanced (40%) | Technique (60%) | Speed (80%) |
|----|-------------|----------------|-----------------|-------------|
| 10 | -0.050 | -0.100 | -0.150 | -0.200 |
| 40 | -0.020 | -0.040 | -0.060 | -0.080 |
| 60 | +0.000 | +0.000 | +0.000 | +0.000 |
| 80 | +0.020 | +0.040 | +0.060 | +0.080 |
| 100 | +0.040 | +0.080 | +0.120 | +0.160 |
| 120 | +0.060 | +0.120 | +0.180 | +0.240 |

---

## Part 4: CP Caps by Trajectory/Class

**New in v10:** CP caps vary by trajectory and class to preserve hierarchy.

| Trajectory | Class | CP Cap | Rationale |
|------------|-------|--------|-----------|
| T1 | Power | 92 | Standard (sub-threshold) |
| T2 | Power | **88** | Prevents T2 from matching T1 SLG |
| T2 | Balanced | 92 | Class weights limit ceiling naturally |
| T3 | All | 92 | Standard |
| T4 | All | 92 | Standard |
| T5 | All | 92 | Standard |
| T6 | All | 92 | Standard |

**Why T2 Power is capped at 88:**

Empirical analysis showed Hit Curve adds ~+16 WP equivalent value. Without a cap, T2 Power with Hit Curve would exceed T1's SLG at the same CP. The CP 88 cap ensures:
- T1 Power (CP 92): SLG = 0.902 â€” **SLG King**
- T2 Power (CP 88): SLG = 0.892 â€” Close but not equal
- T2 Balanced (CP 92): SLG = 0.843 â€” Class weights limit naturally

---

## Part 5: HO Scaling

### 5.1 wOPS Bounds

| Bound | wOPS | Derivation |
|-------|------|------------|
| MIN | 0.736 | T1 Power at CP 10, SP 10 |
| MAX | 1.634 | T1 Power at CP 93, SP 100 |

**Range:** 0.898
**Step size:** ~0.100 wOPS per HO level

### 5.2 Scaling Formula

```python
if CP >= 94:
    HO = 10  # Automatic
else:
    HO_raw = 1 + (wOPS - 0.736) Ã— 9 / (1.634 - 0.736)
    HO = round(HO_raw).clip(1, 10)
```

Simplified:
```
HO â‰ˆ (wOPS - 0.736) Ã— 10 + 1
```

### 5.3 HO Thresholds

The wOPS needed to reach each HO level:

| HO | wOPS Threshold |
|----|----------------|
| 1 | 0.736 (MIN) |
| 2 | 0.786 |
| 3 | 0.886 |
| 4 | 0.985 |
| 5 | 1.085 |
| 6 | 1.185 |
| 7 | 1.285 |
| 8 | 1.385 |
| 9 | 1.484 |
| 10 | 1.584 (or CP 94+ auto) |

---

## Part 6: Class Weights

Character class determines slap/charge swing distribution:

| Class | Slap% | Charge% | Primary Driver |
|-------|-------|---------|----------------|
| Power | 20% | 80% | Charge Power (CP) |
| Balanced | 40% | 60% | Both |
| Technique | 60% | 40% | Slap Power (SP) |
| Speed | 80% | 20% | Slap Power (SP) |

---

## Part 7: Trajectory Distributions

### 7.1 T1 Charge Distribution (Updated in v10)

| Zone | GB | LL | HL | FB | DF | Air% |
|------|----|----|----|----|----|----|
| v9 | 20 | 24 | 14 | 24 | 18 | 42% |
| **v10** | 20 | **18** | 14 | **31** | **17** | **48%** |

**Changes:** LL -6, FB +7, DF -1
**FB:DF ratio:** 1.82 (matches S1 High trajectory's 1.85)

**Why the change:** Increasing air% from LL (not GB or HL) preserves T1's "boom or bust" identity â€” sacrificing BA (from LL hits) for more HR opportunities.

### 7.2 All Trajectory Distributions

**Charge (Sweet Spot):**
| Tier | GB | LL | HL | FB | DF | Air% |
|------|----|----|----|----|----|----|
| T1 | 20 | 18 | 14 | 31 | 17 | 48% |
| T2 | 20 | 21 | 25 | 22 | 12 | 34% |
| T3 | 11 | 20 | 36 | 24 | 9 | 33% |
| T4 | 16 | 24 | 33 | 21 | 6 | 27% |
| T5 | 13 | 20 | 36 | 25 | 6 | 31% |
| T6 | 18 | 30 | 31 | 18 | 3 | 21% |

**Slap (Sweet Spot):**
| Tier | GB | LL | HL | FB | DF | Air% |
|------|----|----|----|----|----|----|
| T1 | 25 | 28 | 17 | 20 | 10 | 30% |
| T2 | 17 | 21 | 31 | 22 | 9 | 31% |
| T3 | 14 | 22 | 38 | 20 | 6 | 26% |
| T4 | 16 | 30 | 35 | 16 | 3 | 19% |
| T5 | 16 | 24 | 39 | 18 | 3 | 21% |
| T6 | 20 | 31 | 26 | 20 | 3 | 23% |

---

## Part 8: Hierarchy at Ceilings

With v10 changes, the hierarchy at CP ceilings:

| Player | CP Cap | BA | SLG | wOPS | HO |
|--------|--------|------|------|------|-----|
| T1 Power | 92 | 0.487 | **0.902** | 1.560 | 9 |
| T2 Power | 88 | 0.546 | 0.892 | 1.510 | 9 |
| T2 Balanced | 92 | 0.551 | 0.843 | 1.411 | 8 |
| T3 Balanced | 92 | **0.587** | 0.801 | 1.309 | 7 |

**Hierarchy preserved:**
- **T1 = SLG King** (0.902 > 0.892) âœ“
- **T3 = BA King** (0.587 highest) âœ“
- T2 has higher BA than T1 but lower SLG â€” meaningful tradeoff âœ“

**HR Gap (per 300 ABs):**
- T1 Power: 41.5 HRs
- T2 Power: 34.5 HRs
- Gap: 7.0 HRs per season â€” meaningful difference

---

## Part 9: T1 Power Progression

### At SP 60 (typical for power hitters):

| CP | HR Rate | BA | SLG | wOPS | HO |
|----|---------|------|------|------|-----|
| 40 | 10.0% | 0.387 | 0.502 | 0.811 | 2 |
| 50 | 15.0% | 0.406 | 0.579 | 0.955 | 3 |
| 60 | 20.0% | 0.426 | 0.656 | 1.099 | 5 |
| 70 | 25.0% | 0.445 | 0.733 | 1.243 | 6 |
| 80 | 30.0% | 0.464 | 0.810 | 1.387 | 8 |
| 85 | 32.5% | 0.474 | 0.848 | 1.459 | 8 |
| 88 | 34.0% | 0.479 | 0.871 | 1.502 | 9 |
| 90 | 35.0% | 0.483 | 0.886 | 1.531 | 9 |
| 92 | 36.0% | 0.487 | 0.902 | 1.560 | 9 |
| 93 | 36.5% | 0.489 | 0.909 | 1.574 | 9 |

### Minimum CP for HO thresholds (at SP 60):

| Target HO | Min CP |
|-----------|--------|
| 2 | 40 |
| 3 | 50 |
| 5 | 60 |
| 6 | 70 |
| 8 | 80 |
| 9 | 88 |
| 10 | 94+ |

---

## Part 10: Formula Code Reference

```python
# Hit rates (v10 - cross-season empirical)
CHARGE_RATES = {
    'GB': 0.30,
    'LL': 0.81,
    'HL': 0.80,
}

SLAP_RATES = {
    'GB': 0.10,
    'LL': 0.39,
    'HL': 0.74,
    'AIR': 0.71,
}

# CP formula (v10)
def hr_rate(cp):
    if cp >= 94:
        return 1.00  # Auto HO 10
    return 0.10 + max(0, (cp - 40) / 200)

# SP formula (continuous, unclamped)
def sp_adjustment(sp, slap_pct):
    return 0.005 * (sp - 60) * slap_pct

# Class weights
CLASS_WEIGHTS = {
    'Power':     {'slap': 0.20, 'charge': 0.80},
    'Balanced':  {'slap': 0.40, 'charge': 0.60},
    'Technique': {'slap': 0.60, 'charge': 0.40},
    'Speed':     {'slap': 0.80, 'charge': 0.20},
}

# CP Caps by trajectory/class (v10)
CP_CAPS = {
    ('T1', 'Power'): 92,
    ('T2', 'Power'): 88,  # Reduced to preserve T1 SLG supremacy
    ('T2', 'Balanced'): 92,
    ('T3', 'Power'): 92,
    ('T3', 'Balanced'): 92,
    ('T4', 'Power'): 92,
    ('T4', 'Balanced'): 92,
    ('T5', 'Speed'): 92,
    ('T5', 'Technique'): 92,
    ('T6', 'Speed'): 92,
}

# Trajectory distributions (v10 - T1 updated)
TRAJ_CHARGE = {
    'T1': {'GB': 20, 'LL': 18, 'HL': 14, 'FB': 31, 'DF': 17},  # v10: 48% air
    'T2': {'GB': 20, 'LL': 21, 'HL': 25, 'FB': 22, 'DF': 12},
    'T3': {'GB': 11, 'LL': 20, 'HL': 36, 'FB': 24, 'DF': 9},
    'T4': {'GB': 16, 'LL': 24, 'HL': 33, 'FB': 21, 'DF': 6},
    'T5': {'GB': 13, 'LL': 20, 'HL': 36, 'FB': 25, 'DF': 6},
    'T6': {'GB': 18, 'LL': 30, 'HL': 31, 'FB': 18, 'DF': 3},
}

TRAJ_SLAP = {
    'T1': {'GB': 25, 'LL': 28, 'HL': 17, 'FB': 20, 'DF': 10},
    'T2': {'GB': 17, 'LL': 21, 'HL': 31, 'FB': 22, 'DF': 9},
    'T3': {'GB': 14, 'LL': 22, 'HL': 38, 'FB': 20, 'DF': 6},
    'T4': {'GB': 16, 'LL': 30, 'HL': 35, 'FB': 16, 'DF': 3},
    'T5': {'GB': 16, 'LL': 24, 'HL': 39, 'FB': 18, 'DF': 3},
    'T6': {'GB': 20, 'LL': 31, 'HL': 26, 'FB': 20, 'DF': 3},
}

# wOPS scaling (v10)
MIN_OPS = 0.736  # T1 Power at CP 10, SP 10
MAX_OPS = 1.634  # T1 Power at CP 93, SP 100

def calculate_ho(tier, char_class, cp, sp, hit_curve=False):
    slap_w = CLASS_WEIGHTS[char_class]['slap']
    charge_w = CLASS_WEIGHTS[char_class]['charge']
    
    c = TRAJ_CHARGE[tier]
    s = TRAJ_SLAP[tier]
    
    hr = hr_rate(cp)
    
    # Base BA (separate rates for charge and slap)
    base_ba = (
        charge_w * c['GB'] / 100 * CHARGE_RATES['GB'] +
        charge_w * c['LL'] / 100 * CHARGE_RATES['LL'] +
        charge_w * c['HL'] / 100 * CHARGE_RATES['HL'] +
        charge_w * (c['FB'] + c['DF']) / 100 * hr +
        slap_w * s['GB'] / 100 * SLAP_RATES['GB'] +
        slap_w * s['LL'] / 100 * SLAP_RATES['LL'] +
        slap_w * s['HL'] / 100 * SLAP_RATES['HL'] +
        slap_w * (s['FB'] + s['DF']) / 100 * SLAP_RATES['AIR']
    )
    
    # SP adjustment
    sp_adj = sp_adjustment(sp, slap_w)
    ba = base_ba + sp_adj
    
    # ISO from charge air
    charge_air = (c['FB'] + c['DF']) / 100
    iso = 3 * charge_w * charge_air * hr
    
    # Hit Curve bonus (if applicable)
    if hit_curve:
        iso += 0.2 * hr
    
    # wOPS (power-weighted)
    wops = 1.5 * ba + 2 * iso
    
    # HO (full 1-10 scale)
    if cp >= 94:
        return 10
    else:
        ho_raw = 1 + (wops - MIN_OPS) * 9 / (MAX_OPS - MIN_OPS)
        return round(max(1, min(10, ho_raw)))
```

---

## Part 11: Quick Reference Card

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚              HO FORMULA v10 QUICK REFERENCE                     â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  wOPS = 1.5Ã—BA + 2Ã—ISO  (power-weighted)                        â”‚
â”‚  ISO = HR% Ã— 3                                                  â”‚
â”‚  HR% = Charge_Air% Ã— HR_rate(CP)                                â”‚
â”‚                                                                 â”‚
â”‚  HO 1-10: Scaled from wOPS (0.736 - 1.634)                      â”‚
â”‚  HO 10: CP 94+ (automatic)                                      â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  HIT RATES (Charge): GB 30%, LL 81%, HL 80%                     â”‚
â”‚  HIT RATES (Slap):   GB 10%, LL 39%, HL 74%, Air 71%            â”‚
â”‚                                                                 â”‚
â”‚  SP Adjustment = 0.005 Ã— (SP - 60) Ã— Slap%  [unclamped]         â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  CP FORMULA:                                                    â”‚
â”‚    HR_rate = 0.10 + (CP - 40) / 200     [CP < 94]               â”‚
â”‚    HR_rate = 100%                       [CP â‰¥ 94]               â”‚
â”‚                                                                 â”‚
â”‚    CP 40â†’10%  CP 70â†’25%  CP 85â†’32.5%  CP 92â†’36%                 â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  CP CAPS:                                                       â”‚
â”‚    T2 Power: 88 (reduced)                                       â”‚
â”‚    All others: 92 (standard)                                    â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  wOPS BOUNDS:                                                   â”‚
â”‚    MIN = 0.736 (T1 Power at CP 10, SP 10)                       â”‚
â”‚    MAX = 1.634 (T1 Power at CP 93, SP 100)                      â”‚
â”‚    Step â‰ˆ 0.100 per HO level                                    â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  T1 CHARGE (48% air): GB 20, LL 18, HL 14, FB 31, DF 17         â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  HIERARCHY:                                                     â”‚
â”‚    T1 = SLG King (0.902 at ceiling)                             â”‚
â”‚    T3 = BA King (0.587 at ceiling)                              â”‚
â”‚    T2 = Technique power (Hit Curve, higher BA than T1)          â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## Part 12: Evidence Chain

### Empirically Derived (from cross-season data):
- **wOPS weighting (1.5Ã—BA + 2Ã—ISO):** Best correlation with individual RBI (r=0.920)
- **Hit rates:** Cross-season analysis of ASA S2, S4, CLB S1 (189 player-seasons, 20+ ABs)
  - Charge: GB 30%, LL 81%, HL 80%
  - Slap: GB 10%, LL 39%, HL 74%, Air 71%
- **Trajectory value:** High +23.6 WP, Medium +5.5 WP, Hit Curve +16.3 WP (regression RÂ²=0.540)
- **SP coefficient (0.005):** S1 regression showed ~0.004-0.005 per SP point

### Derived (math from formulas):
- wOPS bounds (0.736-1.634, anchored to T1 Power extremes)
- T1 air% increase (42%â†’48%) to achieve ~+2 WP advantage over T2
- T2 Power CP cap (88) to prevent SLG parity with T1

### Design Choices:
- T1 takes air from LL (preserves boom-or-bust identity)
- T2 Balanced uncapped (class weights limit naturally)
- FB:DF ratio 1.82 for T1 (matches S1 High trajectory)

---

## Part 13: Version History

| Version | Changes |
|---------|---------|
| v1-v5 | Various BA/SLG weighting attempts |
| v6 | Complex BA proxy model, Hit Curve effects, wasted air penalty |
| v7 | Simplified to empirical hit rates, SP bonus-only bins, T1 trajectory fix |
| v8 | Continuous CP and SP formulas, unclamped SP (0.497-1.303 bounds) |
| v9 | Power-weighted OPS (1.5Ã—BA + 2Ã—ISO), new bounds (0.372-1.398), no SP cap |
| **v10** | **Cross-season hit rates, T1 48% air, T2 Power CP cap 88, bounds 0.736-1.634** |

---

*Document generated from CLB S2 development process*
*Hit rates validated against ASA S2, ASA S4, and CLB S1 data (189 player-seasons)*
*Hierarchy preserved: T1 = SLG King, T3 = BA King*
