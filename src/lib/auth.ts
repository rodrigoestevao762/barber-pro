import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { BARBERS, getBarberByEmail } from "@/lib/barbers";

process.env.NEXTAUTH_URL = "https://barber-pro-six.vercel.app";
process.env.NEXTAUTH_URL_INTERNAL = "https://barber-pro-six.vercel.app";
delete process.env.VERCEL_URL;

// Contas oficiais dos barbeiros e gestor com senhas provisórias configuradas
const PROVISIONAL_USERS = [
  {
    id: "barbeiro-dono",
    email: "fabiobastos20v@hotmail.com",
    aliases: ["dono@mrbastos.com", "admin@mrbastos.com"],
    phone: "5575998679820",
    phoneAliases: ["7598679820", "557598679820", "75998679820"],
    name: "Mr. Bastos (Dono)",
    role: "ADMIN",
    barberId: "barbeiro-dono",
    passwords: ["123", "admin123", "@Familia435"],
  },
  {
    id: "barbeiro-nando",
    email: "nandomrbastos@gmail.com",
    aliases: ["nando@mrbastos.com", "lucas@mrbastos.com"],
    phone: "5575999697600",
    phoneAliases: ["7599697600", "557599697600", "75999697600"],
    name: "Nando Barbeiro",
    role: "BARBER",
    barberId: "barbeiro-nando",
    passwords: ["123", "barbeiro123"],
  },
  {
    id: "barbeiro-saul",
    email: "saultheobaldos@gmail.com",
    aliases: ["saul@mrbastos.com", "felipe@mrbastos.com"],
    phone: "5575981208732",
    phoneAliases: ["7581208732", "557581208732", "75981208732"],
    name: "Saul Barbeiro",
    role: "BARBER",
    barberId: "barbeiro-saul",
    passwords: ["123", "barbeiro123"],
  },
  {
    id: "client-test",
    email: "cliente@mrbastos.com",
    aliases: [],
    phone: "75988887777",
    phoneAliases: ["5575988887777"],
    name: "Rodrigo Estêvão",
    role: "CLIENT",
    barberId: null,
    passwords: ["123", "123456"],
  },
];

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "super-secret-barber-key-123",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "E-mail ou Telefone", type: "text" },
        phone: { label: "Telefone", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const input = (credentials?.identifier || credentials?.phone || "").trim();
        const pwd = (credentials?.password || "").trim();

        if (!input || !pwd) return null;

        const cleanPhone = input.replace(/\D/g, "");
        const lowerInput = input.toLowerCase();

        // 1. Verifica contas provisionadas dos barbeiros / dono / cliente de teste
        const foundProvisional = PROVISIONAL_USERS.find(
          (u) =>
            u.email.toLowerCase() === lowerInput ||
            u.aliases?.some((a) => a.toLowerCase() === lowerInput) ||
            (cleanPhone && (
              u.phone.includes(cleanPhone) ||
              u.phoneAliases?.some((p) => p.includes(cleanPhone) || cleanPhone.includes(p))
            ))
        );

        if (foundProvisional) {
          const customPwd = (global as any).__mrbastos_custom_passwords?.[foundProvisional.email.toLowerCase()];
          const isMatch = (customPwd && customPwd === pwd) || foundProvisional.passwords.includes(pwd);

          if (isMatch) {
            return {
              id: foundProvisional.id,
              name: foundProvisional.name,
              email: foundProvisional.email,
              phone: foundProvisional.phone,
              role: foundProvisional.role,
              barberId: foundProvisional.barberId,
            } as any;
          }
          return null;
        }

        // 2. Busca no banco de dados Prisma (se disponível)
        try {
          const phoneVariants = cleanPhone ? [
            cleanPhone,
            cleanPhone.startsWith("55") ? cleanPhone.slice(2) : `55${cleanPhone}`,
          ] : [];

          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: { equals: lowerInput, mode: "insensitive" } },
                ...phoneVariants.map((p) => ({ phone: p })),
              ],
            },
          });

          if (user && user.password) {
            const isValid = await bcrypt.compare(pwd, user.password);
            if (isValid) {
              const barberMatch = getBarberByEmail(user.email);
              return {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                barberId: barberMatch?.id || null,
              } as any;
            }
          }
        } catch (dbErr) {
          console.warn("DB offline ou não disponível na autorização:", dbErr);
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.barberId = (user as any).barberId;
        token.phone = (user as any).phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).barberId = token.barberId;
        (session.user as any).phone = token.phone;
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
};
