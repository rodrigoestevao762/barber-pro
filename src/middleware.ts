import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Rotas protegidas
const rotasProtegidasBarbeiro = ["/dashboard"];
const rotasProtegidasCliente = ["/painel-cliente"];

// --- RATE LIMITING NO EDGE (In-Memory por isolate) ---
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_MAX = 60; // máx 60 requisições
const RATE_LIMIT_WINDOW = 60 * 1000; // janela de 1 minuto em ms

// --- FIREWALL WAF BÁSICO ---
const BLOCKED_USER_AGENTS = ["wget", "python-requests", "nikto", "sqlmap", "nmap", "gobuster"];
const BLOCKED_URL_PATTERNS = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i, // Padrões básicos de SQL Injection na URL
  /\.env/i,                         // Bloqueia tentativas de leitura de .env
  /\.git/i,                         // Bloqueia tentativas de leitura de .git
  /wp-admin|wp-login/i,             // Bloqueia scanners automáticos de WordPress
];

export async function middleware(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const url = request.nextUrl.pathname;
  const userAgent = request.headers.get("user-agent")?.toLowerCase() || "";

  // 1. FIREWALL WAF: Bloqueio de Scanners e Ferramentas Maliciosas
  if (BLOCKED_USER_AGENTS.some((bot) => userAgent.includes(bot))) {
    return new NextResponse("Forbidden - Malicious Scanner Blocked", { status: 403 });
  }

  // 2. FIREWALL WAF: Prevenção de Path Traversal e Injeção de Código na URL
  if (BLOCKED_URL_PATTERNS.some((pattern) => pattern.test(url))) {
    return new NextResponse("Forbidden - Suspicious Payload Detected", { status: 403 });
  }

  // 3. RATE LIMITING NO EDGE (Anti-DDoS / Força Bruta)
  const now = Date.now();
  const windowData = rateLimitMap.get(ip) || { count: 0, lastReset: now };

  if (now - windowData.lastReset > RATE_LIMIT_WINDOW) {
    windowData.count = 1;
    windowData.lastReset = now;
  } else {
    windowData.count++;
  }
  rateLimitMap.set(ip, windowData);

  if (windowData.count > RATE_LIMIT_MAX) {
    return new NextResponse("Too Many Requests - Rate Limit Exceeded", {
      status: 429,
      headers: { "Retry-After": "60" },
    });
  }

  // Otimização: Se não for rota protegida nem de autenticação, responde imediatamente sem latência
  const isDashboardRoute = rotasProtegidasBarbeiro.some((r) => url.startsWith(r));
  const isClientRoute = rotasProtegidasCliente.some((r) => url.startsWith(r));
  const isLoginRoute = url === "/login";

  if (!isDashboardRoute && !isClientRoute && !isLoginRoute) {
    const res = NextResponse.next();
    res.headers.set("X-Powered-By", "MrBastos-Engine");
    return res;
  }

  // 4. AUTENTICAÇÃO E CONTROLE DE ACESSO RBAC (NextAuth JWT)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || "super-secret-barber-key-123",
  });

  // Se tentar acessar rota protegida sem sessão ativa
  if (!token && (isDashboardRoute || isClientRoute)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", url);
    return NextResponse.redirect(loginUrl);
  }

  // Se cliente tentar acessar painel interno do barbeiro/gestor (/dashboard)
  if (token && isDashboardRoute && (token as any).role === "CLIENT") {
    return NextResponse.redirect(new URL("/painel-cliente", request.url));
  }

  // Se barbeiro/gestor tentar acessar painel de cliente (/painel-cliente)
  if (token && isClientRoute && (token as any).role !== "CLIENT") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Se já estiver logado e tentar abrir /login
  if (token && isLoginRoute) {
    const target = (token as any).role === "CLIENT" ? "/painel-cliente" : "/dashboard";
    return NextResponse.redirect(new URL(target, request.url));
  }

  const response = NextResponse.next();
  response.headers.set("X-Powered-By", "MrBastos-Engine");
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

