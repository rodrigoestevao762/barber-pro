import { NextResponse } from "next/server";
import { getBarberByEmail, BARBERS } from "@/lib/barbers";
import { sendPasswordResetEmail } from "@/lib/resend";
import crypto from "crypto";

// Store em memória para tokens de redefinição de senha
declare global {
  var __mrbastos_reset_tokens: Record<string, { email: string; expiresAt: number }> | undefined;
}

if (!global.__mrbastos_reset_tokens) {
  global.__mrbastos_reset_tokens = {};
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Por favor, informe um endereço de e-mail válido." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Localiza o usuário correspondente
    let userName = "Profissional";
    let targetPhone = "5575998679820";
    const matchedBarber = getBarberByEmail(cleanEmail);

    if (matchedBarber) {
      userName = matchedBarber.name;
      targetPhone = matchedBarber.phone;
    } else if (cleanEmail.includes("cliente") || cleanEmail.includes("rodrigo")) {
      userName = "Rodrigo (Cliente)";
      targetPhone = "5575988887777";
    }

    // 2. Cria token seguro de redefinição (válido por 1 hora)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 1000 * 60 * 60; // 1 hora

    if (!global.__mrbastos_reset_tokens) {
      global.__mrbastos_reset_tokens = {};
    }
    global.__mrbastos_reset_tokens[token] = {
      email: cleanEmail,
      expiresAt,
    };

    // 3. Monta o link de redefinição
    const origin = process.env.NEXTAUTH_URL || "https://mrbastos.com.br";
    const resetUrl = `${origin}/recuperar-senha?token=${token}`;

    // 4. Monta mensagem e link para WhatsApp
    const whatsappMsg = `Olá, ${userName}! Segue o link seguro para redefinir sua senha de acesso na Mr. Bastos Barbearia:\n\n${resetUrl}\n\n(Válido por 1 hora)`;
    const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(whatsappMsg)}`;

    // 5. Tenta enviar via Resend
    let resendResult: any = null;
    try {
      resendResult = await sendPasswordResetEmail({
        to: cleanEmail,
        name: userName,
        resetUrl,
      });
    } catch (e: any) {
      resendResult = { success: false, error: e.message };
    }

    return NextResponse.json({
      success: true,
      message: "Instruções e link de recuperação gerados com sucesso.",
      resetUrl,
      whatsappUrl,
      targetPhone,
      barberName: userName,
      email: cleanEmail,
      resendSuccess: resendResult?.success || false,
      resendSimulated: resendResult?.simulated || false,
    });
  } catch (error: any) {
    console.error("Erro em forgot-password:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar recuperação de senha." },
      { status: 500 }
    );
  }
}
