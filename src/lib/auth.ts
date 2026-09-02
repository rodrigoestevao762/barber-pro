import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "super-secret-barber-key-123",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        phone: { label: "Telefone", type: "text" },
        password: { label: "Senha (Somente Gestor)", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.phone) return null;
        
        const user = await prisma.user.findUnique({
          where: { phone: credentials.phone }
        });

        if (!user) return null;

        // Todos precisam de senha
        if (!credentials.password || !user.password) return null;
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        };
      }
    })
  ],
  pages: {
    signIn: '/login', // Redireciona usuários não logados para cá
  },
  session: {
    strategy: "jwt", // Mais rápido e não onera o banco de dados
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.sub;
      }
      return session;
    }
  }
};

