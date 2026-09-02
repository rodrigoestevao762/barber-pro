import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/login');
    const isDashboard = req.nextUrl.pathname.startsWith('/dashboard');

    // Se o usuário já está logado e tenta acessar a página de login
    if (isAuthPage && isAuth) {
      if (token.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Se um usuário normal ou não logado tenta acessar o Dashboard
    if (isDashboard && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  },
  {
    callbacks: {
      authorized: () => true, // Deixa a função middleware acima decidir as regras
    },
  }
);

// Define quais rotas o middleware vai interceptar e vigiar
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};

