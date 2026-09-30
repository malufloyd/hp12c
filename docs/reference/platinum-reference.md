# HP 12c Platinum (silver, RPN + ALG) - Reference for emulator + tests

Legend: **[MAN]** = verified in HP 12c Platinum User's Guide (Edition 5 text / 2009 build). **[PHOTO]** = read off Wikimedia Commons photos. **[CALC]** = computed by the researcher, not printed in the manual. **UNVERIFIED** = sources missing or disagree.

Keystroke notation below: `[x]`=multiply, `[/]`=divide, `[=]`=ENTER key used as "=" in ALG mode. `f X` / `g X` = press shift then key. Display strings are in default US format (period decimal, comma thousands) unless stated. The minus sign in results is shown as "-".

---------------------------------------------------------------------------------------------------

## 1. KEYBOARD MAP (4 rows x 10 columns)

Source: Commons photo of HP 12c Platinum [PHOTO], cross-checked against the manual's Function Key Index and keycodes [MAN].
Keycodes (two digits = row, column; column 10 = 0) were verified in the manual's program listings: n=11 i=12 PV=13 PMT=14 FV=15 CHS=16, divide=10, multiply=20, yx=21 1/x=22 %T=23 D%=24 %=25 EEX=26, minus=30, R/S=31 SST=32 Rdn=33 x<>y=34 CLx=35 ENTER=36, plus=40, ON=41 f=42 g=43 STO=44 RCL=45. Digits use their own digit as keycode. Example listings: `f SL`=42 23, `f DB`=42 25, `g GTO`=43 33, `g PSE`=43 31, `g x=0`=43 35, `STO +`=44 40.

Each cell: **primary (white)** / f (gold, above key) / g (blue, on lower face).

### Row 1
| Col | Primary | f (gold above) | g (blue below) |
|---|---|---|---|
| 1 | n | AMORT | 12x |
| 2 | i | INT | 12/ (12 divide) |
| 3 | PV | NPV | CFo (CF0) |
| 4 | PMT | RND | CFj |
| 5 | FV | IRR | Nj |
| 6 | CHS | **RPN** | DATE |
| 7 | 7 | (none) | BEG |
| 8 | 8 | (none) | END |
| 9 | 9 | (none) | MEM |
| 10 | divide | (none) | **UNDO (curved arrow icon)** |

### Row 2
Gold bracket "BOND" spans cols 1-2 (over PRICE, YTM). Gold bracket "DEPRECIATION" spans cols 3-5 (over SL, SOYD, DB).
| Col | Primary | f (gold) | g (blue) |
|---|---|---|---|
| 1 | y^x | PRICE (BOND) | sqrt(x) |
| 2 | 1/x | YTM (BOND) | e^x |
| 3 | %T | SL (DEPRECIATION) | LN |
| 4 | Delta% | SOYD (DEPRECIATION) | FRAC |
| 5 | % | DB (DEPRECIATION) | INTG |
| 6 | EEX | **ALG** | Delta-DYS |
| 7 | 4 | (none) | D.MY |
| 8 | 5 | (none) | M.DY |
| 9 | 6 | (none) | x-bar w (weighted mean) |
| 10 | multiply | (none) | **x^2** |

### Row 3
Gold bracket "CLEAR" spans cols 2-6 (over Sigma, PRGM, FIN, REG, PREFIX); each of those gold words is a CLEAR sub-function (f + key).
| Col | Primary | f (gold) | g (blue) |
|---|---|---|---|
| 1 | R/S | P/R | PSE |
| 2 | SST | CLEAR Sigma (stat regs R1-R6 + stack) | BST |
| 3 | R-down | CLEAR PRGM | GTO |
| 4 | x<>y | CLEAR FIN | x<=y |
| 5 | CLx | CLEAR REG | x=0 |
| 6 (tall, rows 3-4) | ENTER (vertical text) | CLEAR PREFIX | **= (equals)** on Platinum (Gold: LST x) |
| 7 | 1 | (none) | x-hat,r (x estimate) |
| 8 | 2 | (none) | y-hat,r (y estimate) |
| 9 | 3 | (none) | n! |
| 10 | minus | (none) | **<- (backspace)** |

### Row 4 (ENTER occupies col 6 of rows 3 and 4)
| Col | Primary | f | g |
|---|---|---|---|
| 1 | ON (recessed/lower than other keys) | **OFF** (gold label above; Platinum only per photo) | (none) |
| 2 | f (gold/orange shift, coloured key face) | - | - |
| 3 | g (blue shift, coloured key face) | - | - |
| 4 | STO | (none) | **( (open paren)** |
| 5 | RCL | (none) | **) (close paren)** |
| 6 | (ENTER, tall key, continued from row 3) | | |
| 7 | 0 | (none) | x-bar (mean) |
| 8 | . (decimal point) | (none) | s (std dev) |
| 9 | Sigma+ | (none) | Sigma- |
| 10 | plus | (none) | **LST x** |

Notes:
- Also f + digit 0-9 sets FIX decimals; f + "." sets scientific (SCI) notation. STO/RCL are followed by 0-9, .0-.9, or n/i/PV/PMT/FV; STO +,-,x,/ arithmetic works only on R0-R4 [MAN].
- Manual: "g" on CLx-row key naming: backspace = `g` + minus key (glyph "<-"); Undo = `g` + divide key; both verified in Function Key Index (Backspacing, Undo) [MAN].
- "RPN" and "ALG" gold labels: f RPN = RPN mode, f ALG = ALG mode [MAN p.20]. Photo puts RPN over CHS, ALG over EEX [PHOTO].
- ALG mode: the ENTER key acts as "=" ; manual examples press the bare ENTER key (glyph shown as "=") to complete; the blue "=" legend printed below ENTER. Whether hardware needs `g` is UNVERIFIED but manual keystrokes use the bare key and program keycode for it in ALG is 36 (same as ENTER) [MAN].
- Contrast: hold `f` and press `+` (darker) or `-` (lighter) [MAN p.16]. (QSG text shows "hold f while pressing plus or minus".)
- The ON key sits lower than other keys "to prevent inadvertent pressing" [MAN p.16].
- Photo legend colours on a Platinum photo: gold labels appear red-orange (photo of later unit); f key orange/red, g key blue. Treat exact legend hue as UNVERIFIED (manual text says "gold").

### Differences vs 12C Gold [PHOTO of Gold + tangentsoft/Wikipedia]
Gold key map is identical in positions of all financial/stat/math keys. Differences:
| Item | Gold | Platinum |
|---|---|---|
| CHS f-label | none | RPN |
| EEX f-label | none | ALG |
| ON f-label | none | OFF (gold text above ON) |
| divide g-label | none | UNDO |
| multiply g-label | none (Gold has NO x^2) | x^2 |
| minus g-label | none | backspace arrow |
| plus g-label | none | LST x |
| STO g-label / RCL g-label | none | "(" / ")" |
| ENTER g-label | LST x | = |
| Modes | RPN only | RPN + ALG |
| Logo | small gold plate "hp 12C" emblem (top right of bezel) | "HP 12c Platinum" printed top-left of bezel + silver "hp" logo top right |
Early Platinum revision F2231A (2003) lacked parentheses; parentheses added ~2005 (per hpmuseum + tangentsoft "Parens" variant). The manual used here includes parentheses/undo/backspace.

---------------------------------------------------------------------------------------------------

## 2. FUNCTION LIST (with * = Platinum-only relative to Gold)

### Arithmetic / entry
- plus, minus, multiply, divide: two-number ops. RPN: x,y registers. ALG: left-to-right, evaluated on operator or "=" (chain calc: 456-75/18.5*68/1.9 = 737.07 evaluated left to right, each operator completes previous).
- ENTER (RPN): copy X into Y, terminates digit entry. In ALG it is "=".*
- CHS: change sign of X (or exponent during EEX entry).
- EEX: enter exponent (e.g. 1.7814 EEX 12).
- CLx: clear X/display. `f CLEAR PREFIX` cancels f/g/STO/RCL/GTO prefix and (held) shows 10-digit mantissa.
- `g <-` backspace* : deletes last digit during entry; after a calculation clears the number.
- `g UNDO`* : recovers data after CLx, backspace, CLEAR REG/FIN/Sigma (the undo indicator lights only right after such clears).
- `( )` `g STO`/`g RCL`* ALG only, max 13 pending open parentheses; "( )" annunciator while open. Too many -> Error 4.
- `g LST x`: recall number displayed before previous op (RPN: lifts stack, 23 ops feed it). In ALG: swaps X with LAST X, never lifts stack (manual App. B). Placement differs (Gold: g ENTER).
- x<>y, R-down (roll down 4 levels), STO/RCL n, i, PV, PMT, FV and 0-9, .0-.9 (20 data registers).
- Register arithmetic STO +,-,x,/ n only for R0..R4 (else Error 4). RCL arithmetic n/a.

### Percent
- `%`: x% of y (y kept). ALG: `y [x] x %  [=]`; note "%" divides by 100 unless preceded by +/- (then computes percent amount: 1250 + 7 % -> 87.50).
- `Delta%`: percent change from Y to X. `%T`: X as percent of Y (total kept in RPN; add totals via + chain in ALG).

### Math
- 1/x, sqrt(x) (g), x^2* (g), y^x, e^x (g), LN (g), n! (g), RND (f: rounds mantissa to display), INTG (g: integer part), FRAC (g: fraction part). No log10, trig, or hyperbolics. n! only for integer 0..69 (Error 0 otherwise); LN x<=0 -> Error 0.

### Time value of money
- n, i, PV, PMT, FV: press after keying to store; press right after an unrelated op to solve (see manual footnote p.41: if the preceding op was a store into a financial register, the next press of one of these five KEYS calculates; STO n etc. counts as store).
- `g 12x`: multiply X by 12 and store in n. `g 12/`: divide X by 12 and store in i.
- `g BEG` / `g END`: payment mode; BEGIN annunciator when Begin.
- `STO EEX`: toggles "C" indicator = compound interest for odd-period (non-integer n). Not programmable.
- `f INT`: simple interest, 360-day in X, 365-day in Y (x<>y), uses n=days, i=annual %, PV negative principal.
- `f AMORT`: amortize x payments using PMT,i,PV: X=interest, Y=principal (x<>y), PV=balance, n=payments total amortized; results rounded to current display digits.
- `n` result rounded up to next integer (down if fractional part < 0.005) [MAN p.50 footnote].
- `f NPV`, `f IRR`: discounted cash flow. `g CFo` initial (stores R0, n=0, N0=1), `g CFj` (stores in next Rj, n=n+1, Nj=1), `g Nj` (1-99 repeats). Platinum* allows CF0 + 80 cash flows, Gold only 20 CFs (R0-R9,R.0-R.9 shared) [Wikipedia; manual note p.75: "up to 80 ... fewer if a program is stored"].
- NPV result also stored in PV; IRR result stored in i; NPV/IRR do not change n.

### Bonds
- `f PRICE`: price per 100 par given yield i, coupon PMT(%), settlement date ENTER maturity; accrued interest in Y (x<>y). Stored in PV. Semiannual, actual/actual (US Treasury basis). FV register afterwards = 100 + coupon/2.
- `f YTM`: yield from price (PV), coupon PMT, dates. Result in i. May display "running".
- Dates must be entered in current date format; >500 years or maturity<settlement -> Error 8.

### Depreciation
- `f SL`, `f SOYD`, `f DB`: year number in X; inputs PV=cost, FV=salvage, n=life, i=DB factor % (DB only, e.g. 200). Result in X, remaining depreciable value in Y (x<>y).

### Calendar
- `g D.MY` (D.MY annunciator), `g M.DY`. Date entry: MM.DDYYYY or DD.MMYYYY.
- `g DATE`: date + days (negative days via CHS), result shown as MM,DD,YYYY w (w = weekday 1=Mon..7=Sun; separators in display).
- `g Delta-DYS`: actual days between dates in X, 30/360 days in Y (x<>y). Range 15 Oct 1582 .. 25 Nov 4046.

### Statistics
- `Sigma+`, `g Sigma-`: accumulate (y ENTER x Sigma+). Registers: R1 n, R2 sum x, R3 sum x^2, R4 sum y, R5 sum y^2, R6 sum xy.
- `g x-bar` (X = mean of x, Y = mean of y), `g x-bar w` (weighted mean; item ENTER weight Sigma+), `g s` (sample std dev sx in X, sy in Y).
- `g x-hat,r` (estimate x from y, correlation r in Y), `g y-hat,r` (estimate y from x, r in Y).
- `f CLEAR Sigma` clears R1-R6, stack and display.

### Clearing
- CLx; `f CLEAR Sigma`; `f CLEAR PRGM` (program mode only: fills program memory with GTO 000, sets line 000; in Run mode only resets to line 000); `f CLEAR FIN` (n,i,PV,PMT,FV); `f CLEAR REG` (data regs, financial regs, stack, LAST X, display; not program).

### Programming
- `f P/R` toggle Program/Run (PRGM annunciator). `R/S` run/stop. `g PSE` pause ~1 s showing X. `SST` single step (held: shows lines); `g BST` back step. `g GTO nnn` (Program mode: `g GTO . nnn` with the decimal point required; Run mode without dot). `g x<=y`, `g x=0` conditional: if true execute next line else skip one. `g MEM` displays "P-08 r-20"-style status (program lines allotted / data registers left). Any key stops a running program. Programs written in RPN must be run in RPN (and ALG in ALG).
- Programmable: almost all; NOT programmable: f CLEAR REG, g D.MY, g M.DY, STO EEX (C toggle), f CLEAR PRGM [MAN Key Index].
- `g DATE` in a program pauses ~1 s.

### Modes / special
- `f RPN`, `f ALG`*. FIX 0-9 (`f digit`), SCI (`f .`). No ENG mode (UNVERIFIED that none exists on Platinum firmware? the manual documents only standard and scientific formats; Gold likewise) [MAN Section 5].
- ON+"." toggles digit separators (hold "." then press ON, calculator off). ON+"-" (hold minus, press ON) resets Continuous Memory -> "Pr Error".
- Auto power-off after ~12 minutes idle [MAN p.16]. Battery: 2 x CR2032 (Platinum) / Gold classic: originally 3 x LR44, later 1 x CR2032 (tangentsoft).

Platinum-only summary: ALG mode + parentheses + "=" ; UNDO; backspace; x^2; 80 cash flows; 400 program lines; LST x on plus key; OFF label; contrast adjust; f-key based RPN/ALG toggle; MEM shows different sizes.

---------------------------------------------------------------------------------------------------

## 3. MACHINE SPECS

- **Display**: 10-digit 7-segment LCD with commas/points (thousands separators); minus sign on the left. Nine status indicators along the bottom per manual [MAN p.86]; identified ones: `f`, `g`, `BEGIN`, `D.MY`, `C`, `PRGM`, `RPN`, `ALG`, `( )` (pending parentheses), plus an undo arrow indicator and a battery symbol upper-left, and the word `running` flashing during long calcs. Exact count/order of the nine is UNVERIFIED (manual does not list them in one place; self-test lights indicators not normally shown).
- **Exponent display (scientific)**: mantissa first 7 digits, two-digit exponent at right; negative exponent shows minus, positive shows blank. Example `1.487456 01`. Auto-switches to scientific when result can't be shown in FIX.
- **Standard format**: after factory/reset: 2 decimals. `f 0`-`f 9` = FIX n (max 8 decimals shown when 9 requested, `14.87456320`). `f .` = SCI. Format persists across power-off; reset by Continuous Memory reset. `f PREFIX` held shows all 10 digits of mantissa (e.g. `1487456320`).
- **Internal precision**: 10-digit mantissa, 2-digit exponent; arithmetic done with full 10 digits regardless of display [MAN]. Internal guard digits: UNVERIFIED.
- **Rounding**: display rounds half-up on 3rd digit (5-9 up). Rounding of internal value only changes with RND, AMORT (rounds to display), INTG/FRAC, SL/SOYD/DB? (manual lists RND, AMORT, DB/SL/SOYD results as "not altered unless you use..." list: `B, !, V, Y, #` = RND, AMORT, SL, SOYD, DB). So SL, SOYD, DB, AMORT and RND round internal to display digits.
- **Overflow**: |result| > 9.999999999E99 halts and shows `9.999999 99` (or `-9.999999 99`). **Underflow**: |x| < 1E-99 -> treated as 0, no halt.
- **Data registers**: 20 (R0-R9, R.0-R.9) at reset; plus stack X,Y,Z,T + LAST X; financial n,i,PV,PMT,FV; stat registers reuse R1-R6 (so overwriting R1-R6 corrupts stats).
- **Program memory**: 8 lines (all `GTO 000`) + 20 registers at reset [MAN p.114]. Max 400 lines [MAN p.115]. Registers convert to program lines as program grows (HP "Using Memories" PDF: registers convert at seven program steps each, from the high end .9 down). A hpmuseum-search summary claims "20 data registers with 309 program lines, register conversion beyond 309" - conflicts with manual's 8-lines-at-reset text; UNVERIFIED exact thresholds. Practical test: at reset `g MEM` -> "P-08 r-20" per manual ("Resets N to P008 r20").
- **Cash flow storage**: CF0..CF80 and Nj counts stored in the memory area (Platinum), so free register/program space limits count [MAN note p.75]. Gold: CFs share R0..R.9 (max 20).
- **Continuous memory**: everything (registers, stack, LAST X, program, display format, date format, payment mode, RPN/ALG) persists across off. Reset (ON + minus, reset hole, or power loss) -> `Pr Error`, all cleared, 8 program lines, 2-decimals, M.DY, End, RPN. Key press clears message.
- **Stack lift**: 4-level stack. `ENTER`, `CLx`, `Sigma+`, `Sigma-` disable lift on next number entry (new digit replaces X). Other ops lift. One-number functions don't lift. `f PREFIX`... n/a. Two-number ops drop stack, Z copies into T (T duplicates).
- **Digit separators**: default "." decimal, "," thousands; ON+"." toggles.
- **Power**: 2 x CR2032, auto-off 12 min.
- **Self-tests** (calculator off; hold ON then press key; release ON then key): ON+multiply = full test ~25 s ("running" flashes) -> shows `-8,8,8,8,8,8,8,8,8,8,` with all indicators lit; ON+plus (manual text prints a garbled key symbol; likely plus) = continuous test until keypress; ON+divide = keyboard/display test: press keys in order row by row (ENTER pressed twice, in rows 3 and 4) -> `12`; wrong key -> Error 9.
- **Physical (Gold, Wikipedia)**: 128 x 79 x 15 mm, 113 g.

### Error codes [MAN Appendix D]
| Error | Meaning | Conditions |
|---|---|---|
| Error 0 | Mathematics | divide by 0 (÷, 1/x); sqrt(x<0); LN(x<=0); y^x when y=0 & x<=0, or y<0 & x non-integer; Delta% with y=0; %T with y=0; STO/ ÷ (0-4) by 0; n! of non-integer or negative |
| Error 1 | Storage register overflow | STO +,-,x,/ result > 9.999999999E99 (R0-R4); also x^2 ("g x^2")? manual lists a key glyph "A" (12x) here; treat as: 12x overflow; UNVERIFIED |
| Error 2 | Statistics | x-bar w with sum x = 0; s with n=0 or n=1 or n*sumx^2-(sumx)^2 < 0 (same for y); x-hat,r/y-hat,r with n=0, or zero variance / product <=0 |
| Error 3 | IRR | computation too complex; needs a guess (see section 4) |
| Error 4 | Memory | >400 program lines; GTO to nonexistent line; STO arithmetic on R5-R9 or R.0-R.9; too many open parentheses (>13) |
| Error 5 | Compound interest | n: i=0 and PMT=0; PMT between FV*d and -PV*d inclusive (d = (i/100)/(1+i/100*S), S=0 End,1 Begin) i.e. no solution; i<=-100. i: n=0; n>=1E10 or n<0; i<=-100 (typo in list); all cash flows same sign. PV/PMT/FV: i<=-100. AMORT: n=0? also i<=-100. YTM when result negative "Error 5 or negative result". SL/SOYD/DB: n<=0 or non-integer x; SOYD/DB x<=0; SOYD PMT<0 (UNVERIFIED mapping of glyph rows) |
| Error 6 | Storage registers | STO/RCL to a register that does not exist or was converted to program lines; CFj/Nj n>80; Nj not integer 0..99 (x>99, x<0, non-integer); attempting Nj for CF0 |
| Error 7 | IRR | no solution (needs at least one positive and one negative cash flow; sign errors) |
| Error 8 | Calendar | illegal date/format; adding days beyond range; bond: >500 years between dates, maturity earlier than settlement, maturity with no coupon date 6 months earlier (31st of Mar/May/Aug/Oct/Dec, Aug 29 (non-leap) and 30) |
| Error 9 | Service | self-test failure or wrong key order in keyboard test |
| Pr Error | Continuous Memory reset | power loss, ON+minus, reset hole |
Error display cleared with any key (key not executed).

---------------------------------------------------------------------------------------------------

## 4. IRR / NPV / TVM ALGORITHM NOTES [MAN Appendix C, E]

- **TVM equation** (End: S=0, Begin: S=1): `0 = PV + (1+iS)*PMT*[1-(1+i)^-n]/i + FV*(1+i)^-n`. Odd period (non-integer n): simple: `0 = PV[1+i*FRAC(n)] + (1+iS)*PMT*[1-(1+i)^-INTG(n)]/i + FV(1+i)^-INTG(n)`; compound (C on): PV(1+i)^FRAC(n) replaces PV[...].
- Solving n: closed form; result rounded up to integer (except frac < 0.005). i: iterative solve (no iteration count documented -> UNVERIFIED). Error 5 arises when no solution exists (e.g. PMT between FV*d and -PV*d, same-sign flows, i<=-100).
- **NPV**: `CF0 + sum CFj/(1+i)^j` with Nj repeats. Result also in PV.
- **IRR**: iterative; solves `0 = sum CFj * [1-(1+IRR)^-nj]/IRR * (1+IRR)^-(sum of preceding n) + CF0`. Manual: iterates NPV until "about zero" using 10-digit rounding; may take seconds to minutes; display shows `running`; any key stops it. Cases: (1) positive answer displayed = only positive answer; (2) negative answer displayed = maybe others; (3) **Error 3** = too complex/possibly multiple roots; enter a guess i then `f IRR`... manual says press guess then `f IRR` (glyph shows "gt"/`f L`); use NPV at guesses to find sign change, then `RCL i`/guess+IRR to converge; (4) **Error 7** = no answer (no sign change: need at least one positive and one negative CF). No fixed iteration limit is documented -> UNVERIFIED (an emulator may use Newton/bisection to 1e-10 relative NPV).
- Amortization formulas (App. E): `INT1 = |PV0*i|_RND * sign(PMT)` (0 if n=0 & Begin), `PRN=PMT-INT`, `PV_j=PV_{j-1}+PRN_j`; each period's interest rounded to display digits (RND) - this yields the few-cent differences from bank statements.
- Bond formulas per Mayle SIA 1993 (semiannual, actual/actual).
- SL: (SBV-SAL)/L; SOYD: (L-j+1)/(L(L+1)/2)*(SBV-SAL); DB: RBV_{j-1}*FACT/(100L) (RBV capped so total does not exceed salvage; result rounded to display digits per note).
- Stat formulas: sample std dev (n-1), linear regression y=A+Bx, r = correlation.
- Day count: actual = f(DT2)-f(DT1) with 365yyyy+31(mm-1)+dd+INTG(z/4)-x ...; 30/360 with dd=31 rules (see manual App. E).

---------------------------------------------------------------------------------------------------

## 5. WORKED EXAMPLES (for automated tests)

Assume calculator freshly reset (Pr Error cleared), RPN, FIX 2, M.DY, End, unless stated. Always start each TVM example with `f CLEAR FIN` (written FIN-clr). `f CLEAR REG` = REG-clr. Display values are as shown in manual. Page refs are the printed manual pages [MAN].

### A. Arithmetic / chain (RPN and ALG)
**A1 (RPN, p.23-24)** Checkbook: `58.33 ENTER 22.95 -` -> 35.38; `13.7 -` -> 21.68; `10.14 -` -> 11.54; `1053 +` -> 1,064.54.
**A2 (RPN)** `(3+4)x(5+6)`: `3 ENTER 4 + 5 ENTER 6 + x` -> 77.00 [MAN QSG Table 1-2].
**A3 (RPN, p.24-25)** `3 ENTER 4 x 5 ENTER 6 x +` -> 12.00, then 30.00, then 42.00.
**A4 (ALG mode, App. B p.242)** `f ALG`; `CLx CLx 21.1 + 23.8 =` -> 21.10, 23.8, 44.90. Then `77.35 - 90.89 =` -> -13.54.
**A5 (ALG chain, p.26)** `CLx CLx 456 - 75 / ...` i.e. keys: 456 - 75 [/] -> 381.00; 18.5 [x] -> 20.59; 68 [/] -> 1,400.43; 1.9 = -> 737.07.
**A6 (ALG parentheses, p.27/245)** `CLx CLx 8 [/] g( 5 - 1 g) =` intermediate displays: after `8 [/] g( 5 -` -> 5.00; after `1 g)` -> 4.00; final `=` -> 2.00. (Also without parens: 8/5-1 = 0.60 [MAN].)
**A7 (ALG power, p.102)** `CLx CLx 2 y^x 1.4 =` -> 2.64; `2 y^x 1.4 CHS =` -> 0.38; `2 CHS y^x 3 =` -> -8.00; `2 y^x 3 1/x =` -> 1.26.
**A8 (RPN power)** `2 ENTER 1.4 y^x` -> 2.64; `2 ENTER 1.4 CHS y^x` -> 0.38; `2 CHS ENTER 3 y^x` -> -8.00; `2 ENTER 3 1/x y^x` -> 1.26.
**A9 (p.18)** `1.7814 EEX 12` -> display `1.7814 12`.
**A10 (p.86-89 display)** `19.8745632 ENTER 5 -` -> 14.87 (RPN) [ALG: `19.8745632 - 5 =` -> 14.87]. Then `f 4` -> 14.8746; `f 1` -> 14.9; `f 0` -> 15.; `f 9` -> 14.87456320; `f .` -> `1.487456 01`; `f 2` -> 14.87. Hold `f PREFIX`: `1487456320`.
**A11 (p.100-102)** `.258 1/x` -> 3.88; `f RND` -> 3.88 (X now exactly 3.88); `g INTG` -> 3.00; `g LST x` -> 3.88 (RPN); after `g FRAC` -> 0.88.

### B. Percent
**B1 (RPN p.31)** `300 ENTER 14 %` -> 300.00 then 42.00.
**B2 (ALG p.32)** `CLx CLx 300 [x] 14 % =` -> 300.00, 14., 0.14 (shown after %), 42.00.
**B3 (RPN net amount p.33)** `23250 ENTER 8 % -` -> 1,860.00 then 21,390.00; `6 % +` -> 1,283.40 then 22,673.40.
**B4 (ALG p.33)** `1250 + 7 %` -> 87.50; `=` -> 1,337.50. Also `200 - 25 % =` -> 150.00.
**B5 (Delta%)** `58.5 ENTER 53.25 D%` -> -8.97 (RPN). ALG: `35.5 = 31.25 D%` -> -11.97 [MAN App B].
**B6 (%T, RPN p.35)** `3.92 ENTER 2.36 + 1.67 +` -> 7.95; `2.36 %T` -> 29.69; `CLx 3.92 %T` -> 49.31; `CLx 1.67 %T` -> 21.01. ALG version: `3.92 + 2.36 + 1.67 = 7.95`, `2.36 %T` -> 29.69.

### C. Simple interest, TVM
**C1 (p.43)** `f FIN-clr`; `60 n 7 i 450 CHS PV f INT` -> 5.25; `+` -> 455.25. (ALG: `+ x<>y =` -> 455.25.) 365-day: `f INT` then `Rdn x<>y` -> 5.18; `+` -> 455.18.
**C2 (p.50-51)** n solve: `f FIN-clr; 10.5 g 12/ (0.88); 35000 PV; 325 CHS PMT; g END; n` -> 328.00; `12 /` -> 27.33. Fractional last payment: `328 n FV` -> 181.89; `RCL PMT +` -> -143.11. Balloon: `327 n FV` -> -141.87; `RCL PMT +` -> -466.87.
**C3 (p.53-54)** `f FIN-clr; 6.25 ENTER 24 / i` -> 0.26; `775 CHS PV; 50 CHS PMT; 4000 FV; g END; n` -> 58.00; `2 /` -> 29.00; `FV FV` -> 4,027.27; `RCL PMT +` -> 3,977.27; `4000 -` -> -22.73. (ALG: `6.25 / 24 i`... `FV FV`... same values.)
**C4 (p.55)** annual rate: `f FIN-clr; 8 ENTER 4 x n` -> 32.00; `6000 CHS PV 10000 FV i` -> 1.61; `4 x` -> 6.44.
**C5 (p.57)** PV: `f FIN-clr; 4 g 12x` -> 48.00; `5.9 g 12/` -> 0.49; `450 CHS PMT; g END; PV` -> 19,198.60; `1500 +` -> 20,698.60.
**C6 (p.58)** `5 n 12 i 17500 PMT 540000 FV g END PV` -> -369,494.09.
**C7 (p.59)** `29 g 12x` -> 348.00; `5.25 g 12/` -> 0.44; `243400 PV; g END; PMT` -> -1,363.29.
**C8 (p.60)** `15 ENTER 2 x n` -> 30.00; `9.75 ENTER 2 / i` -> 4.88; `3200 CHS PV 60000 FV g END PMT` -> -717.44.
**C9 (p.61)** balloon: `5 g 12x` 60.00; `5.25 g 12/` 0.44; `243400 PV`; `1363.29 CHS PMT` -1,363.29; `g END FV` -> -222,975.98.
**C10 (p.62)** Begin mode: `2 g 12x` 24.00; `6.25 g 12/` 0.52; `50 CHS PMT; g BEG; FV` -> 1,281.34.
**C11 (p.63)** `f FIN-clr; 6 n 2 CHS i 32000 CHS PV FV` -> 28,346.96.
**C12 QSG loan** `f CLEAR FIN; g END; 6.9 g 12/; 360 g 12x; 125000 PV; 0 FV; PMT` -> [CALC] -823.25 (not printed in QSG; QSG shows steps only).

### D. Odd period
**D1 (p.65-66)** `f FIN-clr; g M.DY; g END; STO EEX` (C on); `2.152004 ENTER 3.012004 g DDYS` -> 15.00; `x<>y` -> 16.00; `30 /` -> 0.53; `36 +  n` -> 36.53; `5 g 12/` -> 0.42; `4500 PV PMT` -> -135.17.
**D2 (p.67)** C off (`STO EEX`); `7.192004 ENTER 8.012004 g DDYS` -> 13.00; `30 /` 0.43; `42 + n` 42.43; `3950 PV 120 CHS PMT i` -> 1.16; `12 x` -> 13.95.

### E. Amortization
**E1 (p.69-70)** `5.25 g 12/` 0.44; `250000 PV`; `1498.12 CHS PMT` -1,498.12; `g END`; `12 f AMORT` -> -13,006.53; `x<>y` -> -4,970.91; `RCL PV` -> 245,029.09; `RCL n` -> 12.00. Then `12 f AMORT` -> -12,739.18; `x<>y` -> -5,238.26; `RCL PV` -> 239,790.83; `RCL n` -> 24.00.
**E2** Reset `250000 PV 0 n`; `1 f AMORT` -> -1,093.75; `x<>y` -> -404.37; `1 f AMORT` -> -1,091.98; `x<>y` -> -406.14; `RCL n` -> 2.00.
**E3 (p.71)** 30-year: `30 g 12x` 360.00; `250000 PV` ; `PMT` -> -1,380.51; `0 n; 1 f AMORT` -> -1,093.75; `x<>y` -> -286.76; `RCL PV` -> 249,713.24.

### F. NPV / IRR
**F1 (p.74-75, ungrouped)** `f REG-clr; 80000 CHS g CFo (-80,000.00); 500 CHS g CFj -500.00; 4500 g CFj; 5500 g CFj; 4500 g CFj; 130000 g CFj; RCL n` -> 5.00; `13 i; f NPV` -> 212.18.
**F2 (p.77, grouped)** `f REG-clr; 79000 CHS g CFo; 14000 g CFj; 11000 g CFj; 10000 g CFj; 3 g Nj; 9100 g CFj; 9000 g CFj; 2 g Nj; 4500 g CFj; 100000 g CFj; RCL n` -> 7.00; `13.5 i; f NPV` -> 907.77; `f IRR` -> 13.72.
**F3 (p.79-81)** (continuing F2 after IRR) `RCL 5` -> 9,000.00 (CF5); `5 n; RCL g Nj` -> 2.00; `7 n`. Change CF2: `9000 STO 2; 13.5 i; f NPV` -> -644.75. Change N5: `5 n; 4 g Nj; 7 n; f NPV` -> -1,857.21.

### G. Bonds
**G1 (p.82)** `g M.DY; 4.75 i; 6.75 PMT; 4.282004 ENTER 6.042018; f PRICE` -> 120.38; `+` -> 123.07 (ALG: `+ x<>y =`).
**G2 (p.83)** `122.125 PV; 6.75 PMT; 4.282004 ENTER 6.042018; f YTM` -> 4.60 (PV displays 122.13).

### H. Depreciation
**H1 (p.84-85)** `10000 PV; 500 FV; 5 n; 200 i; 1 f DB` -> 4,000.00; `x<>y` -> 5,500.00; `2 f DB` -> 2,400.00; `x<>y` 3,100.00; `3 f DB` -> 1,440.00; `x<>y` -> 1,660.00.
**H2 [CALC]** same inputs: `1 f SL` -> 1,900.00 (x<>y 7,600.00); `1 f SOYD` -> 3,166.67 (x<>y 6,333.33); `2 f SOYD` -> 2,533.33. (Computed from App. E formulas; not printed as examples.)

### I. Dates
**I1 (p.39)** `g D.MY; 14.052004 ENTER 120 g DATE` -> `11,09,2004 6` (Saturday).
**I2 (p.40)** `g M.DY; 6.032004 ENTER 10.142005 g Delta-DYS` -> 498.00; `x<>y` -> 491.00.

### J. Statistics (p.94-99)
**J1** `f CLEAR Sigma`; pairs (hours ENTER sales Sigma+): 32 ENTER 17000; 40 ENTER 25000; 45 ENTER 26000; 40 ENTER 20000; 38 ENTER 21000; 50 ENTER 28000; 35 ENTER 15000 each Sigma+ -> 1.00 .. 7.00. `g x-bar` -> 21,714.29; `x<>y` -> 40.00. `g s` -> 4,820.59; `x<>y` -> 6.03. `48 g y-hat,r` -> 28,818.93; `x<>y` -> 0.90 (r). `0 g y-hat,r` -> 15.55 (intercept). Population sigma via `g x-bar Sigma+ g s` -> 4,463.00 / x<>y 5.58 (after mean, Sigma+ shows 8.00).
**J2 weighted mean** `f CLEAR Sigma; 1.16 ENTER 15 Sigma+; 1.24 ENTER 7 Sigma+; 1.2 ENTER 10 Sigma+; 1.18 ENTER 17 Sigma+` -> 1.00..4.00; `g x-bar-w` -> 1.19.

### K. Programming (p.107-109)
**K1 (RPN)** `f P/R` (PRGM on) `f CLEAR PRGM` -> 000; keys `ENTER 2 5 % - 5 +` stored as lines 001 (36), 002 (2), 003 (5), 004 (25), 005 (30), 006 (5), 007 (40). `f P/R` (run). `625 R/S` -> 473.75; `159 R/S` -> 124.25. Line 008 shows `008,43,33,000` (GTO 000).
**K2 (ALG version)** keys `- 2 5 % + 5 =` : 001 `30`, 002 2, 003 5, 004 25, 005 40, 006 5, 007 36. Run: `625 R/S` -> 473.75; `159 R/S` -> 124.25.
**K3 (self-check)** after reset: `f P/R g MEM` -> `P-08  r-20`.

Known manual inconsistencies to ignore in tests: p.26/243 ALG example "65 g ... 12 = 96.75" prints wrong numbers; and Example A5 uses rounding of intermediate displays only.

---------------------------------------------------------------------------------------------------

## 6. VISUAL REFERENCE NOTES (HP 12C GOLD, classic)

- **Case**: black plastic body, ends of case and hinge-style side caps black; top display plate is a brushed gold/brass-tone anodised metal look (champagne gold) spanning the width above the keyboard; keyboard area recessed in a black bezel with a thin gold/bronze rim line at right and bottom; bottom strip printed "HEWLETT-PACKARD" (spaced caps) in gold with a gold bar at right.
- **Proportions**: 128 x 79 x 15 mm landscape (ratio about 1.62:1); display window about 2/3 of top plate width left-aligned, logo plate at top right corner; keyboard aspect approx 79:128 overall.
- **Logo**: small square gold-and-black metal emblem "hp" (italic lowercase inside circle) with "12C" in a black bar below, at right end of the gold plate.
- **LCD**: grey-green (yellowish) reflective LCD, black/dark-grey 7-segment digits with comma/point segments, 10 digit positions; annunciators (BEGIN, D.MY etc.) printed small below digits (visible in Commons photo: BEGIN at left-center, D.MY at center); thin gold-toned bezel around the glass.
- **Keys**: black keys, off-white/cream primary legends (large, sans-serif), gold-orange f-shift legends printed on the panel above keys, blue (teal) g-shift legends on a slanted lower face of each key; f key = gold/orange coloured face with black "f", g key = blue with black "g"; ON key black, slightly lower than the rest; ENTER is a tall key (2 rows) with vertical letters E-N-T-E-R and blue "LST x" at bottom; keys have concave/slanted lower band. Bracket lines: BOND (over yx,1/x), DEPRECIATION (over %T,D%,%), CLEAR (over SST..ENTER with sub-labels Sigma, PRGM, FIN, REG, PREFIX), all in gold.
- **Platinum differences** (silver): top plate silver/brushed aluminium, "HP 12c Platinum" printed top-left (dark grey), silver-metal "hp" logo tile top right, keyboard legends red-orange in the Commons photo, f key orange-red (gold), g key blue, ON key has "OFF" above it.

### Reference photos / URLs
- Wikipedia HP-12C: https://en.wikipedia.org/wiki/HP-12C
- Commons Gold photo (used above): https://commons.wikimedia.org/wiki/File:Financial_Calculator_Hewlett-Packard_HP-12C_built_from_1981,_this_item_produced_1988_(edited_to_remove_background,_warmer_colours).jpg
- Commons Platinum photo (used above): https://commons.wikimedia.org/wiki/File:HP_12C_Platinum.jpg
- Commons backside photo: https://commons.wikimedia.org/wiki/File:Backside_of_Financial_Calculator_Hewlett-Packard_HP-12C_built_from_1981,_this_item_produced_1988.jpg
- Direct file path pattern: https://commons.wikimedia.org/wiki/Special:FilePath/HP_12C_Platinum.jpg?width=1000
- Museum of HP Calculators 12C page: https://www.hpmuseum.org/hp12c.htm
- Variant identification: https://tangentsoft.com/rpn/wiki?name=Recognizing+HP-12C+Variants
- HP virtual museum: https://www.hp.com/hpinfo/abouthp/histnfacts/museum/personalsystems/0042/0042threeqtr.html
- Educalc keyboard functions: https://www.educalc.net/page/143022/

---------------------------------------------------------------------------------------------------

## 7. SOURCES USED (manual PDFs)
- HP 12c Platinum Financial Calculator User's guide, Edition 5, F2231AA-90001 (main source, full text extracted): https://hpcalcs.com/downloads/HP12cPlatinum_user_guide_English_EN.pdf  (mirror listing: https://literature.hpcalc.org/items/71)
- HP 12c Platinum Quick Start Guide Edition 1 (F2232-90201): https://literature.hpcalc.org/official/hp12cplatinum-qsg-en.pdf
- HP 12C Platinum Owner's Handbook and Problem-Solving Guide (older): https://h10032.www1.hp.com/ctg/Manual/bpia5309.pdf
- HP 12C Platinum Solutions Handbook: https://h10032.www1.hp.com/ctg/Manual/c00367123.pdf
- HP "Using Memories to Solve Problems": http://h20331.www2.hp.com/Hpsub/downloads/HP12CPMemory.pdf
- HP "Operating modes and clearing": http://h20331.www2.hp.com/Hpsub/downloads/HP12CPoperating.pdf
- Local copies: /private/tmp/claude-501/-Users-rodrigomferraz-Claude-code-HP12C/302a85dd-9602-43a8-bad7-cb921ff0db1e/scratchpad/{ug,qsg,oh,sh,mem,opm}.pdf, ug.txt (raw text; key glyphs garbled by font), ugdec.txt (glyph-decoded).
- Secondary: Wikipedia HP-12C and 25th Anniversary pages; tangentsoft variants page; hpmuseum (threads returned 403 to fetch; only search snippets seen: hpmuseum.org/cgi-bin/archv015.cgi?read=79432, archv016.cgi?read=98128, articles.cgi?read=416).
- Note: literature.hpcalc.org direct .pdf paths guessed initially (hp12cp-en.pdf etc.) returned HTML 404 pages; use the URLs above.

## 8. OPEN / UNVERIFIED items
1. Exact hardware behaviour of ENTER as "=" in ALG (g needed or not).
2. Precise register/program-line conversion arithmetic on the Platinum (manual: 8 lines/20 regs at reset, 400 max; HP memory PDF: 7 lines per register; a forum summary: 309 lines with 20 regs).
3. Number and list of the nine status indicators.
4. Internal guard digits; IRR/i-solve iteration limits.
5. Error-condition table glyph-to-key mapping for a few rows (Error 1 and Error 5 lines) - keys inferred.
6. ENG display format: not documented for 12C family (only FIX and SCI).
7. Legend colour (gold vs red-orange) on various Platinum revisions.
8. Case measurement of Platinum (assumed same 128 x 79 x 15 mm as Gold per Wikipedia).
