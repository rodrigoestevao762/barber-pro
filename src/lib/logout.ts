import { signOut } from "next-auth/react";

/**
 * Encerra a sessão no NextAuth, força limpeza de cookies server-side e redireciona para o login.
 */
export async function disconnectAccount(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
    await signOut({ redirect: false });
  } catch {
    // Continua o redirecionamento mesmo em falha de rede para limpar cookies no endpoint GET
  }
  window.location.assign("/api/auth/logout");
}
