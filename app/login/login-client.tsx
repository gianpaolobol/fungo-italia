"use client";

import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function LoginClient({ returnTo }: { returnTo: string }) {
  const router = useRouter();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(path: string, body: Record<string, string>) {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Operazione non riuscita.");
      router.replace(returnTo);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Operazione non riuscita.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-[#e8eee6] p-1">
        <TabsTrigger value="login" className="rounded-xl">Accedi</TabsTrigger>
        <TabsTrigger value="register" className="rounded-xl">Registrati</TabsTrigger>
      </TabsList>

      <TabsContent value="login" className="mt-5 space-y-4">
        <div className="space-y-2">
          <label htmlFor="login-email" className="text-sm font-bold">Email</label>
          <Input id="login-email" type="email" autoComplete="email" value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} />
        </div>
        <div className="space-y-2">
          <label htmlFor="login-password" className="text-sm font-bold">Password</label>
          <Input id="login-password" type="password" autoComplete="current-password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} />
        </div>
        <Button
          className="h-11 w-full rounded-xl bg-[#174f2b] hover:bg-[#0f3f20]"
          disabled={busy || !loginEmail || !loginPassword}
          onClick={() => void submit("/api/auth/login", { email: loginEmail, password: loginPassword })}
        >
          <LogIn />
          {busy ? "Accesso…" : "Accedi"}
        </Button>
      </TabsContent>

      <TabsContent value="register" className="mt-5 space-y-4">
        <div className="space-y-2">
          <label htmlFor="display-name" className="text-sm font-bold">Nome visualizzato</label>
          <Input id="display-name" autoComplete="name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
        </div>
        <div className="space-y-2">
          <label htmlFor="register-email" className="text-sm font-bold">Email</label>
          <Input id="register-email" type="email" autoComplete="email" value={registerEmail} onChange={(event) => setRegisterEmail(event.target.value)} />
        </div>
        <div className="space-y-2">
          <label htmlFor="register-password" className="text-sm font-bold">Password</label>
          <Input id="register-password" type="password" autoComplete="new-password" value={registerPassword} onChange={(event) => setRegisterPassword(event.target.value)} />
          <p className="text-xs text-[#607365]">Almeno 10 caratteri.</p>
        </div>
        <Button
          className="h-11 w-full rounded-xl bg-[#174f2b] hover:bg-[#0f3f20]"
          disabled={busy || displayName.trim().length < 2 || !registerEmail || registerPassword.length < 10}
          onClick={() => void submit("/api/auth/register", { displayName, email: registerEmail, password: registerPassword })}
        >
          <UserPlus />
          {busy ? "Registrazione…" : "Crea account"}
        </Button>
      </TabsContent>

      {message && (
        <div role="alert" className="mt-4 rounded-xl border border-[#dca9a9] bg-[#fff1f1] p-3 text-sm text-[#7a2525]">
          {message}
        </div>
      )}
    </Tabs>
  );
}
