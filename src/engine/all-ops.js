// Registers every op module (side-effect imports). Later tasks append here.
import './ops-basic.js';
import './mathfn.js';
import './clear.js';
import './alg.js';   // must come after ops-basic.js / mathfn.js (wraps their handlers)
import './dates.js';
import './finance.js';
import './cashflow.js';
