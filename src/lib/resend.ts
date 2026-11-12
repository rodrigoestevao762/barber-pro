import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: {
  to: string;
  name: string;
  resetUrl: string;
}) {
  if (!resend) {
    console.warn(
      "⚠️ RESEND_API_KEY não configurada no .env. Simulação de envio para:",
      to,
      "Link:",
      resetUrl
    );
    return {
      success: true,
      simulated: true,
      message: "Envio em modo demonstração (configure RESEND_API_KEY no .env para envio real)",
    };
  }

  try {
    const fromSender = process.env.RESEND_FROM || "Mr. Bastos Barbearia <nao-responda@mrbastos.com.br>";

    const { data, error } = await resend.emails.send({
      from: fromSender,
      to,
      subject: "Mr. Bastos Barbearia — Redefinição de Senha",
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050B14; color: #FFFFFF; margin: 0; padding: 40px 20px; }
            .card { max-width: 540px; margin: 0 auto; background-color: #091220; border: 1px solid rgba(37, 99, 235, 0.35); border-radius: 20px; padding: 40px 32px; box-shadow: 0 20px 50px rgba(0,0,0,0.8); }
            .logo-text { font-family: Georgia, serif; font-size: 26px; color: #FFFFFF; letter-spacing: 3px; text-transform: uppercase; text-align: center; margin: 0 0 6px 0; }
            .tagline { color: #3B82F6; font-size: 11px; text-transform: uppercase; letter-spacing: 4px; text-align: center; margin: 0 0 32px 0; font-weight: 600; }
            .divider { height: 1px; background: rgba(255,255,255,0.08); margin: 24px 0; }
            h2 { font-size: 20px; font-weight: 600; color: #FFFFFF; margin-top: 0; }
            p { color: #A0AEC0; font-size: 14px; line-height: 1.6; margin: 16px 0; }
            .btn { display: inline-block; background-color: #2563EB; color: #FFFFFF !important; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; text-decoration: none; padding: 16px 36px; border-radius: 12px; margin: 24px 0; text-align: center; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4); }
            .link-box { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 12px; border-radius: 8px; font-size: 11px; color: #60A5FA; word-break: break-all; }
            .footer { text-align: center; color: #4A5568; font-size: 11px; margin-top: 32px; letter-spacing: 1px; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1 class="logo-text">Mr. Bastos</h1>
            <p class="tagline">Barbearia &bull; Alagoinhas BA</p>
            
            <div class="divider"></div>

            <h2>Olá, ${name}!</h2>
            <p>Recebemos uma solicitação de redefinição de senha para a sua conta no sistema de gestão da <strong>Mr. Bastos Barbearia</strong>.</p>
            <p>Para escolher uma nova senha de acesso com segurança, clique no botão abaixo:</p>

            <div style="text-align: center;">
              <a href="${resetUrl}" class="btn" target="_blank">Redefinir Minha Senha</a>
            </div>

            <p style="font-size: 12px; color: #718096;">Se o botão não abrir, copie e cole o link abaixo no seu navegador:</p>
            <div class="link-box">${resetUrl}</div>

            <div class="divider"></div>

            <p style="font-size: 11px; color: #718096; margin: 0;">
              * Este link é válido por 1 hora. Se você não solicitou a alteração, ignore este e-mail; sua senha atual permanecerá segura.
            </p>
          </div>

          <div class="footer">
            &copy; ${new Date().getFullYear()} Mr. Bastos Barbearia &bull; O Padrão de Excelência
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Erro do Resend ao enviar e-mail:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Exceção no envio via Resend:", err);
    return { success: false, error: err.message || String(err) };
  }
}



const MR_BASTOS_FROM =
  process.env.RESEND_FROM || "Mr. Bastos Barbearia <nao-responda@mrbastos.com.br>";

export interface AppointmentConfirmationEmailParams {
  to: string;
  clientName: string;
  serviceName: string;
  servicePrice: number;
  barberName: string;
  dateFormatted: string;
  timeFormatted: string;
}

/**
 * Envia e-mail transacional de confirmação ao cliente da Mr. Bastos Barbearia.
 */
export async function sendAppointmentConfirmationEmail(
  params: AppointmentConfirmationEmailParams
): Promise<boolean> {
  if (!resend || !process.env.RESEND_API_KEY) {
    console.warn("[Resend] RESEND_API_KEY ou cliente ausente. Confirmação não enviada para:", params.to);
    return false;
  }

  const priceFormatted = params.servicePrice.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  try {
    const { error } = await resend.emails.send({
      from: MR_BASTOS_FROM,
      to: [params.to],
      subject: `Horário Confirmado na Mr. Bastos: ${params.dateFormatted} às ${params.timeFormatted}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #050B14; color: #f4f4f5; padding: 36px 20px;">
          <div style="max-width: 540px; margin: 0 auto; background-color: #081221; border: 1px solid #1e3a5f; border-radius: 20px; padding: 32px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #60a5fa; font-weight: 800;">MR. BASTOS BARBEARIA</p>
              <h1 style="margin: 8px 0 0 0; font-size: 22px; color: #ffffff;">Reserva Confirmada!</h1>
            </div>
            <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
              Olá, <strong style="color: #ffffff;">${params.clientName}</strong>. Seu horário na <strong>Mr. Bastos Barbearia (Hiper Gbarbosa - Alagoinhas, BA)</strong> foi reservado com sucesso.
            </p>
            <div style="background-color: #03070e; border: 1px solid #1e3a5f; border-radius: 14px; padding: 18px; margin: 20px 0;">
              <p style="margin: 6px 0; font-size: 13px; color: #94a3b8;">Serviço: <strong style="color: #ffffff;">${params.serviceName} (${priceFormatted})</strong></p>
              <p style="margin: 6px 0; font-size: 13px; color: #94a3b8;">Profissional: <strong style="color: #60a5fa;">${params.barberName}</strong></p>
              <p style="margin: 6px 0; font-size: 13px; color: #94a3b8;">Data e Hora: <strong style="color: #ffffff;">${params.dateFormatted} às ${params.timeFormatted}</strong></p>
              <p style="margin: 6px 0; font-size: 12px; color: #64748b;">Local: Hiper Gbarbosa - Alagoinhas, BA</p>
            </div>
            <div style="text-align: center; margin-top: 24px;">
              <a href="https://mrbastos.com.br/painel-cliente" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 12px; padding: 14px 26px; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px;">
                Acessar Painel do Cliente VIP
              </a>
            </div>
            <p style="margin-top: 24px; text-align: center; font-size: 11px; color: #64748b;">
              Mr. Bastos Barbearia • WhatsApp: (75) 9867-9820
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("[Resend] Erro ao enviar confirmação:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Resend] Exceção ao enviar confirmação:", err);
    return false;
  }
}

export interface NewBookingBarberNotificationParams {
  to: string;
  barberName: string;
  clientName: string;
  clientPhone: string;
  serviceName: string;
  servicePrice: number;
  dateFormatted: string;
  timeFormatted: string;
}

/**
 * Notifica o barbeiro da Mr. Bastos quando um novo agendamento é registrado em sua cadeira.
 */
export async function sendNewBookingNotificationToBarber(
  params: NewBookingBarberNotificationParams
): Promise<boolean> {
  if (!resend || !process.env.RESEND_API_KEY || !params.to) {
    return false;
  }

  const priceFormatted = params.servicePrice.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  try {
    const { error } = await resend.emails.send({
      from: MR_BASTOS_FROM,
      to: [params.to],
      subject: `Novo Agendamento (${params.dateFormatted} às ${params.timeFormatted}) - ${params.clientName}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #050B14; color: #f4f4f5; padding: 32px 20px;">
          <div style="max-width: 520px; margin: 0 auto; background-color: #081221; border: 1px solid #1e3a5f; border-radius: 20px; padding: 28px;">
            <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2.5px; color: #60a5fa; font-weight: 800;">AGENDA MR. BASTOS</p>
            <h2 style="margin: 8px 0 16px 0; font-size: 20px; color: #ffffff;">Novo atendimento na sua cadeira, ${params.barberName}</h2>
            <div style="background-color: #03070e; border: 1px solid #1e3a5f; border-radius: 14px; padding: 16px;">
              <p style="margin: 5px 0; font-size: 13px; color: #94a3b8;">Cliente: <strong style="color: #ffffff;">${params.clientName}</strong></p>
              <p style="margin: 5px 0; font-size: 13px; color: #94a3b8;">WhatsApp: <strong style="color: #60a5fa;">${params.clientPhone}</strong></p>
              <p style="margin: 5px 0; font-size: 13px; color: #94a3b8;">Serviço: <strong style="color: #ffffff;">${params.serviceName} (${priceFormatted})</strong></p>
              <p style="margin: 5px 0; font-size: 13px; color: #94a3b8;">Data/Hora: <strong style="color: #ffffff;">${params.dateFormatted} às ${params.timeFormatted}</strong></p>
            </div>
            <div style="text-align: center; margin-top: 20px;">
              <a href="https://mrbastos.com.br/dashboard/agenda" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 12px; padding: 12px 22px; border-radius: 10px;">
                Abrir Agenda do Painel
              </a>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("[Resend] Erro ao notificar barbeiro:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Resend] Exceção ao notificar barbeiro:", err);
    return false;
  }
}
