import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

declare global {
  var __mrbastos_reset_tokens: Record<string, { email: string; expiresAt: number }> | undefined;
  var __mrbastos_custom_passwords: Record<string, string> | undefined;
}

if (!global.__mrbastos_custom_passwords) {
  global.__mrbastos_custom_passwords = {};
}

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword || newPassword.length < 3) {
      return NextResponse.json(
        { error: "Dados inválidos ou senha muito curta (mínimo 3 caracteres)." },
        { status: 400 }
      );
    }

    if (!global.__mrbastos_reset_tokens) {
      global.__mrbastos_reset_tokens = {};
    }

    const tokenData = global.__mrbastos_reset_tokens[token];

    if (!tokenData) {
      return NextResponse.json(
        { error: "Token inválido ou expirado. Por favor, solicite um novo link de recuperação." },
        { status: 400 }
      );
    }

    if (Date.now() > tokenData.expiresAt) {
      if (global.__mrbastos_reset_tokens) {
        delete global.__mrbastos_reset_tokens[token];
      }
      return NextResponse.json(
        { error: "Este link expirou. Por favor, solicite um novo link de recuperação." },
        { status: 400 }
      );
    }

    const userEmail = tokenData.email;

    // 1. Armazena nova senha em memória para login imediato
    if (global.__mrbastos_custom_passwords) {
      global.__mrbastos_custom_passwords[userEmail] = newPassword;
    }

    // 2. Tenta atualizar no banco de dados se disponível
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.updateMany({
        where: { email: userEmail },
        data: { password: hashedPassword },
      });
    } catch (dbErr) {
      console.warn("DB indisponível, senha atualizada em memória:", dbErr);
    }

    // Remove token usado
    if (global.__mrbastos_reset_tokens) {
      delete global.__mrbastos_reset_tokens[token];
    }

    return NextResponse.json({
      success: true,
      message: "Sua senha foi redefinida com sucesso! Você já pode entrar com sua nova senha.",
    });
  } catch (error: any) {
    console.error("Erro em reset-password:", error);
    return NextResponse.json(
      { error: "Erro ao redefinir senha." },
      { status: 500 }
    );
  }
}
