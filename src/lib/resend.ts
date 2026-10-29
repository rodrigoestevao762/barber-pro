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
    const fromSender = process.env.RESEND_FROM || "Mr. Bastos Barbearia <onboarding@resend.dev>";

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
            .card { max-width: 540px; margin: 0 auto; background-color: #091220; border: 1px solid rgba(200, 142, 112, 0.3); border-radius: 20px; padding: 40px 32px; box-shadow: 0 20px 50px rgba(0,0,0,0.8); }
            .logo-text { font-family: Georgia, serif; font-size: 26px; color: #FFFFFF; letter-spacing: 3px; text-transform: uppercase; text-align: center; margin: 0 0 6px 0; }
            .tagline { color: #C88E70; font-size: 11px; text-transform: uppercase; letter-spacing: 4px; text-align: center; margin: 0 0 32px 0; font-weight: 600; }
            .divider { height: 1px; background: rgba(255,255,255,0.08); margin: 24px 0; }
            h2 { font-size: 20px; font-weight: 600; color: #FFFFFF; margin-top: 0; }
            p { color: #A0AEC0; font-size: 14px; line-height: 1.6; margin: 16px 0; }
            .btn { display: inline-block; background-color: #C88E70; color: #050B14 !important; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; text-decoration: none; padding: 16px 36px; border-radius: 12px; margin: 24px 0; text-align: center; }
            .link-box { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 12px; border-radius: 8px; font-size: 11px; color: #C88E70; word-break: break-all; }
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
