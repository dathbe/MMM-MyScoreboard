Insert one line into the provider registration block in start(), immediately after the PWHL line. Unified diff:

@@
     this.providers.CPL = require('./providers/CPL.js')
     this.providers.PWHL = require('./providers/PWHL.js')
+    this.providers.LiveTennisAPI = require('./providers/LiveTennisAPI.js')
 
     this.localLogos = {}