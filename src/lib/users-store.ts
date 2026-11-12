/**
 * Repositório resiliente de usuários da Mr. Bastos Barbearia.
 * Sincroniza usuários (Equipe + Clientes VIP) em memória e em arquivo JSON local (/tmp em produção, src/data em dev)
 * para garantir funcionamento mesmo quando o banco estiver temporariamente inacessível.
 *
 * Contas oficiais da equipe Mr. Bastos mantêm exclusivamente a senha de sistema configurada.
 */

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  passwordHash: string;
  role: "ADMIN" | "BARBER" | "CLIENT";
  barberId?: string;
  createdAt: string;
}

declare global {
  var __mrbastos_users: StoredUser[] | undefined;
}

function getUsersFilePath(): string | null {
  if (typeof window !== "undefined") return null;
  try {
    const path = require("path");
    return process.env.VERCEL || process.env.NODE_ENV === "production"
      ? path.join("/tmp", "mrbastos_users.json")
      : path.join(process.cwd(), "src", "data", "mrbastos_users.json");
  } catch (_) {
    return null;
  }
}

function getInitialUsers(): StoredUser[] {
  const now = new Date().toISOString();
  return [
    {
      id: "barbeiro-dono",
      name: "Mr. Bastos (Dono)",
      email: "fabiobastos20v@hotmail.com",
      phone: "(75) 99867-9820",
      passwordHash: "123",
      role: "ADMIN",
      barberId: "barbeiro-dono",
      createdAt: now,
    },
    {
      id: "admin-jully",
      name: "Jully Bastos",
      email: "jully_esp@hotmail.com",
      phone: "(75) 99867-9820",
      passwordHash: "123",
      role: "ADMIN",
      barberId: "barbeiro-dono",
      createdAt: now,
    },
    {
      id: "barbeiro-nando",
      name: "Nando Barbeiro",
      email: "nandomrbastos@gmail.com",
      phone: "(75) 99969-7600",
      passwordHash: "123",
      role: "BARBER",
      barberId: "barbeiro-nando",
      createdAt: now,
    },
    {
      id: "barbeiro-saul",
      name: "Saul Barbeiro",
      email: "saultheobaldos@gmail.com",
      phone: "(75) 98120-8732",
      passwordHash: "123",
      role: "BARBER",
      barberId: "barbeiro-saul",
      createdAt: now,
    },
  ];
}

function loadUsersFromDisk(): StoredUser[] {
  if (typeof window !== "undefined") return [];
  try {
    const fs = require("fs");
    const filePath = getUsersFilePath();
    if (filePath && fs.existsSync(filePath)) {
      const parsed = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return [];
}

function saveUsersToDisk(): void {
  if (typeof window !== "undefined") return;
  try {
    const fs = require("fs");
    const path = require("path");
    const filePath = getUsersFilePath();
    if (!filePath || !global.__mrbastos_users) return;
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(global.__mrbastos_users, null, 2), "utf-8");
  } catch (_) {}
}

function initUsers(): void {
  if (!global.__mrbastos_users) {
    const fromDisk = loadUsersFromDisk();
    if (fromDisk.length > 0) {
      global.__mrbastos_users = fromDisk;
    } else {
      global.__mrbastos_users = getInitialUsers();
      saveUsersToDisk();
    }
  }
}

export function getAllStoredUsers(): StoredUser[] {
  initUsers();
  return global.__mrbastos_users || [];
}

export function findStoredUserByEmailOrPhone(loginInput: string): StoredUser | undefined {
  initUsers();
  const clean = loginInput.trim().toLowerCase();
  const digits = clean.replace(/\D/g, "");

  return (global.__mrbastos_users || []).find((u) => {
    if (u.email.toLowerCase() === clean) return true;
    if (digits.length >= 8 && u.phone) {
      const uDigits = u.phone.replace(/\D/g, "");
      return uDigits === digits || uDigits.endsWith(digits) || digits.endsWith(uDigits);
    }
    return false;
  });
}

export function findStoredUserById(id: string): StoredUser | undefined {
  initUsers();
  return (global.__mrbastos_users || []).find((u) => u.id === id);
}

export function upsertStoredUser(data: {
  id?: string;
  name?: string;
  email: string;
  phone?: string | null;
  passwordHash?: string;
  role?: "ADMIN" | "BARBER" | "CLIENT";
  barberId?: string;
}): StoredUser {
  initUsers();
  const list = global.__mrbastos_users!;
  const cleanEmail = data.email.trim().toLowerCase();
  const existing = list.find(
    (u) => (data.id && u.id === data.id) || u.email.toLowerCase() === cleanEmail
  );

  if (existing) {
    if (data.name) existing.name = data.name;
    if (data.phone !== undefined && data.phone !== null) existing.phone = data.phone;
    if (data.passwordHash) existing.passwordHash = data.passwordHash;
    saveUsersToDisk();
    return existing;
  }

  const created: StoredUser = {
    id: data.id || `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: data.name || "Cliente VIP",
    email: cleanEmail,
    phone: data.phone || null,
    passwordHash: data.passwordHash || "",
    role: data.role || "CLIENT",
    barberId: data.barberId,
    createdAt: new Date().toISOString(),
  };

  list.push(created);
  saveUsersToDisk();
  return created;
}
