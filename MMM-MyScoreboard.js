Add ATP and WTA to the supportedLeagues map, immediately after the PWHL entry. Unified diff:

@@
     'PWHL': { provider: 'PWHL', logoFormat: 'url' },
 
+    // Tennis (Live Tennis API)
+    'ATP': { provider: 'LiveTennisAPI', logoFormat: 'url', homeTeamFirst: true },
+    'WTA': { provider: 'LiveTennisAPI', logoFormat: 'url', homeTeamFirst: true },
+
     // International Soccer
     'ALL_SOCCER': { provider: 'Scorepanel', logoFormat: 'url', homeTeamFirst: true },