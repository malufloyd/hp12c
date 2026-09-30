// Registers every op module (side-effect imports). Later tasks append here.
import './ops-basic.js';
import './mathfn.js';
import './clear.js';
import './alg.js';   // must come after ops-basic.js / mathfn.js (wraps their handlers)
import './dates.js';
import './finance.js';
import './cashflow.js';
import './depreciation.js';
import './stats.js';
import './program.js';   // last: registers pr/rs/sst/bst/pse/gto/xley/xeq0/mem/clrPrgm and the recorder hooks
