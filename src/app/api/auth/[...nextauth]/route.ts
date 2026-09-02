import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || "https://barber-pro-six.vercel.app";
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "super-secret-barber-key-123";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

