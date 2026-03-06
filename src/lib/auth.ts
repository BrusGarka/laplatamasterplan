const SENHA_HASH =
  "222140aca454ee11343c83a59c258897c25b618eac67038275c82d7273b387be";

const STORAGE_KEY = "laplata_authenticated";

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verificarSenha(senha: string): Promise<boolean> {
  const hash = await sha256(senha);
  return hash === SENHA_HASH;
}

export function estaAutenticado(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function marcarComoAutenticado(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // localStorage indisponível (privado, etc.)
  }
}
