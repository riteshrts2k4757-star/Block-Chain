const fs = require('fs');

const files = [
  'src/pages/admin/LoadConfiguration.jsx',
  'src/pages/admin/LiveTelemetry.jsx',
  'src/pages/admin/LiveLoadTesting.jsx',
  'src/pages/admin/Fleet.jsx',
  'src/pages/admin/DriverDetails.jsx',
  'src/pages/admin/AlertRules.jsx',
  'src/components/common/EnvironmentMonitor.jsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('http://localhost:5000')) {
    content = content.replace(/http:\/\/localhost:5000/g, '${API_BASE_URL}');
    
    const depth = f.split('/').length - 2;
    const dots = '../'.repeat(depth);
    const importStmt = `import { API_BASE_URL } from '${dots}config';\n`;
    
    if (!content.includes('API_BASE_URL')) {
      content = content.replace(/import (.*) from '(.*)';\n/, match => match + importStmt);
    } else if (!content.includes('import { API_BASE_URL }')) {
       content = content.replace(/import (.*) from '(.*)';\n/, match => match + importStmt);
    }
    
    fs.writeFileSync(f, content);
    console.log('Updated ' + f);
  }
});
