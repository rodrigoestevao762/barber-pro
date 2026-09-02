import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Força a URL oficial para corrigir o problema de cookies no domínio principal da Vercel
process.env.NEXTAUTH_URL = "https://barber-pro-six.vercel.app";
process.env.NEXTAUTH_URL_INTERNAL = "https://barber-pro-six.vercel.app";
delete process.env.VERCEL_URL;

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

