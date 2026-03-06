import { useState, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  estaAutenticado,
  verificarSenha,
  marcarComoAutenticado,
} from "@/lib/auth";

interface AuthGateProps {
  children: ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const [autenticado, setAutenticado] = useState(estaAutenticado);
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      const ok = await verificarSenha(senha);
      if (ok) {
        marcarComoAutenticado();
        setAutenticado(true);
      } else {
        setErro("Senha incorreta.");
        setSenha("");
      }
    } catch {
      setErro("Erro ao verificar. Tente de novo.");
    } finally {
      setCarregando(false);
    }
  }

  if (autenticado) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Acesso ao La Plata</CardTitle>
          <CardDescription>
            Digite a senha para acessar o planejamento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoFocus
                autoComplete="current-password"
                disabled={carregando}
                className={erro ? "border-destructive" : ""}
              />
            </div>
            {erro && (
              <p className="text-sm text-destructive" role="alert">
                {erro}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={carregando}>
              {carregando ? "Verificando…" : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
