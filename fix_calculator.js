const fs = require('fs');
const path = require('path');

const targetPath = '/home/vedant/Desktop/All data/Data from phone/programming/Projects/Carbon_Footprint/src/context/CalculatorContext.tsx';
let content = fs.readFileSync(targetPath, 'utf8');

// Replace `const { user } = useAuth();` with `const { user, userProfile } = useAuth();`
content = content.replace('const { user } = useAuth();', 'const { user, userProfile } = useAuth();');

// Insert `if (userProfile?.isTestAccount) return;`
content = content.replace(
  'saveCalculation(user.uid, computedResults)\n        .then(async (calculationId) => {\n          // Fetch current total user count for the community stats doc',
  'saveCalculation(user.uid, computedResults)\n        .then(async (calculationId) => {\n          if (userProfile?.isTestAccount) return;\n          // Fetch current total user count for the community stats doc'
);

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Fixed CalculatorContext.tsx');
