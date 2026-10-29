const fs = require('fs');

let content = fs.readFileSync('src/app/login/page.tsx', 'utf8');

// Update placeholder
content = content.replace(
  'placeholder="Ex: dono@mrbastos.com ou 75988887777"',
  'placeholder="Ex: fabiobastos20v@hotmail.com ou 7598679820"'
);

// Update Quick Access Buttons
content = content.replace(
  'onClick={() => fillQuickAccess("dono@mrbastos.com", "123")}',
  'onClick={() => fillQuickAccess("fabiobastos20v@hotmail.com", "123")}'
);
content = content.replace(
  '<p className="text-[10px] text-gray-500 font-mono">dono@mrbastos.com</p>',
  '<p className="text-[10px] text-gray-500 font-mono truncate">fabiobastos20v@hotmail.com</p>'
);

content = content.replace(
  'onClick={() => fillQuickAccess("nando@mrbastos.com", "123")}',
  'onClick={() => fillQuickAccess("nandomrbastos@gmail.com", "123")}'
);
content = content.replace(
  '<p className="text-[10px] text-gray-500 font-mono">nando@mrbastos.com</p>',
  '<p className="text-[10px] text-gray-500 font-mono truncate">nandomrbastos@gmail.com</p>'
);

content = content.replace(
  'onClick={() => fillQuickAccess("saul@mrbastos.com", "123")}',
  'onClick={() => fillQuickAccess("Saultheobaldos@gmail.com", "123")}'
);
content = content.replace(
  '<p className="text-[10px] text-gray-500 font-mono">saul@mrbastos.com</p>',
  '<p className="text-[10px] text-gray-500 font-mono truncate">Saultheobaldos@gmail.com</p>'
);

fs.writeFileSync('src/app/login/page.tsx', content, 'utf8');
console.log('src/app/login/page.tsx successfully updated with official emails!');
