"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("As senhas não coincidem."); return; }
    if (password.length < 8) { setError("A senha deve ter pelo menos 8 caracteres."); return; }
    setLoading(true);
    const res = await fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erro ao criar conta.");
      setLoading(false);
      return;
    }
    await signIn("credentials", { email, password, redirect: false });
    router.push("/dashboard");
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="text-5xl jp font-bold text-indigo-600 dark:text-indigo-400 mb-2">始めよう</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Criar sua conta</h1>
        <p className="text-sm text-muted mt-1">Grátis para sempre no Bloco 1</p>
      </div>
      <div className="card-bg rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Seu nome" />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seu@email.com" />
          <Input label="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Mínimo 8 caracteres" />
          <Input label="Confirmar senha" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required placeholder="Repita a senha" />
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <Button type="submit" loading={loading} size="lg" className="w-full mt-2">Criar conta</Button>
        </form>
        <p className="text-center text-sm text-muted mt-4">
          Já tem conta?{" "}
          <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
