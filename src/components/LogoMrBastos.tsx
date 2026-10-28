export function LogoMrBastos({
  size = 200,
  color = "white",
  className = "",
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 300 300"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* === CÍRCULO DUPLO EXTERNO === */}
      <circle cx="150" cy="150" r="140" fill="none" stroke={color} strokeWidth="2.5" />
      <circle cx="150" cy="150" r="132" fill="none" stroke={color} strokeWidth="1" />

      {/* === PENTE (top-left, angled) === */}
      <g transform="translate(32, 108) rotate(-20)">
        {/* Corpo / dorso */}
        <rect x="0" y="14" width="88" height="11" rx="4" fill={color} />
        {/* Dentes */}
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={3 + i * 10} y="0" width="6" height="16" rx="2" fill={color} />
        ))}
      </g>

      {/* === TESOURA (top-right) === */}
      <g transform="translate(176, 48) rotate(32)">
        {/* Lâmina superior */}
        <path
          d="M 18 26 C 28 20 62 10 88 6 L 88 13 C 64 18 30 30 18 38 Z"
          fill={color}
        />
        {/* Lâmina inferior */}
        <path
          d="M 18 26 C 28 32 62 42 88 46 L 88 39 C 64 34 30 22 18 14 Z"
          fill={color}
        />
        {/* Parafuso central */}
        <circle cx="18" cy="26" r="9" fill={color} />
        <circle cx="18" cy="26" r="4.5" fill="none" stroke="#050B14" strokeWidth="2" />
        {/* Argola superior */}
        <ellipse
          cx="0"
          cy="10"
          rx="11"
          ry="16"
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          transform="rotate(-20, 0, 10)"
        />
        {/* Argola inferior */}
        <ellipse
          cx="0"
          cy="42"
          rx="11"
          ry="16"
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          transform="rotate(20, 0, 42)"
        />
      </g>

      {/* === "Mr." — script leve === */}
      <text
        x="112"
        y="126"
        fill={color}
        fontSize="27"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontWeight="normal"
        textAnchor="middle"
      >
        Mr.
      </text>

      {/* === "Bastos" — elemento dominante === */}
      <text
        x="150"
        y="194"
        fill={color}
        fontSize="76"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontWeight="bold"
        textAnchor="middle"
      >
        Bastos
      </text>

      {/* === LINHAS DIVISÓRIAS === */}
      <line x1="46" y1="205" x2="254" y2="205" stroke={color} strokeWidth="1.5" />
      <line x1="50" y1="209" x2="250" y2="209" stroke={color} strokeWidth="0.7" opacity="0.45" />

      {/* === ESTRELAS === */}
      <text x="64" y="230" fill={color} fontSize="15" textAnchor="middle">★</text>
      <text x="236" y="230" fill={color} fontSize="15" textAnchor="middle">★</text>

      {/* === BIGODE === */}
      <path
        d="
          M 150 231
          C 143 224 126 220 110 226
          C 94 233 89 246 99 252
          C 110 258 128 251 138 243
          C 143 239 147 236 150 237
          C 153 236 157 239 162 243
          C 172 251 190 258 201 252
          C 211 246 206 233 190 226
          C 174 220 157 224 150 231
          Z
        "
        fill={color}
      />

      {/* === LINHAS DE RODAPÉ === */}
      <line x1="36" y1="257" x2="264" y2="257" stroke={color} strokeWidth="1.5" />
      <line x1="40" y1="262" x2="260" y2="262" stroke={color} strokeWidth="0.7" opacity="0.45" />

      {/* === "BARBEARIA" ao longo do arco inferior === */}
      <defs>
        <path id="barb-arc" d="M 16 198 A 140 140 0 0 0 284 198" />
      </defs>
      <text
        fill={color}
        fontSize="13"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="bold"
        letterSpacing="3.5"
      >
        <textPath href="#barb-arc" startOffset="50%" textAnchor="middle">
          ★  BARBEARIA  ★
        </textPath>
      </text>
    </svg>
  );
}

