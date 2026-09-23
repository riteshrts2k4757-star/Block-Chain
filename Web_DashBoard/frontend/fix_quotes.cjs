const fs = require('fs');

const files = [
  'src/pages/admin/LoadConfiguration.jsx',
  'src/pages/admin/LiveTelemetry.jsx',
  'src/pages/admin/LiveLoadTesting.jsx',
  'src/pages/admin/Fleet.jsx',
  'src/pages/admin/DriverDetails.jsx',
  'src/pages/admin/AlertRules.jsx',
  'src/components/common/EnvironmentMonitor.jsx',
  'src/context/AuthContext.jsx',
  'src/context/AlertContext.jsx',
  'src/context/TelemetryContext.jsx',
  'src/services/api.js',
  'src/pages/Login.jsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f, 'utf8');
  
  // Replace: '${API_BASE_URL}/...' with `${API_BASE_URL}/...`
  // We look for single quotes that wrap the template literal.
  // There are two cases:
  // 1. fetch('${API_BASE_URL}/something') -> fetch(`${API_BASE_URL}/something`)
  // 2. fetch(`${API_BASE_URL}/something`) -> this one might be okay if it was already backticks, but wait, if it was backticks, it became `${API_BASE_URL}` which is fine.
  
  // Replace '${API_BASE_URL} to `${API_BASE_URL}
  content = content.replace(/'\$\{API_BASE_URL\}([^']*)'/g, '`${API_BASE_URL}$1`');
  
  // Replace "${API_BASE_URL} to `${API_BASE_URL}
  content = content.replace(/"\$\{API_BASE_URL\}([^"]*)"/g, '`${API_BASE_URL}$1`');

  fs.writeFileSync(f, content);
  console.log('Fixed quotes in ' + f);
});
