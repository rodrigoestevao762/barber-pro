const fs = require('fs');

const d = fs.readFileSync('public/logo-path-d.txt', 'utf8').trim();

const componentContent = `export function LogoMrBastos({
  size = 200,
  color = "currentColor",
  className = "",
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="190 190 655 665"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill={color}
    >
      <path
        d="${d}"
        fillRule="evenodd"
      />
    </svg>
  );
}
`;

fs.writeFileSync('src/components/LogoMrBastos.tsx', componentContent, 'utf8');
console.log('src/components/LogoMrBastos.tsx successfully updated!');

