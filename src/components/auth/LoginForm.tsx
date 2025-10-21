// src/components/auth/LoginForm.tsx
import React from "react";

export default function LoginForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const text = await res.text(); // ⬅︎ točan tekst iz endpointa (npr. "Invalid login credentials")
        console.error("Login failed:", res.status, text);
        setError(text || `Login error ${res.status}`);
        return;
      }

      // Uspješno: preusmjeri u admin sučelje (promijeni path po potrebi)
      window.location.href = "/admin";
    } catch (err: any) {
      setError(err?.message ?? "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="input input-bordered w-full"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Lozinka"
        className="input input-bordered w-full"
        required
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button className="btn btn-primary w-full" disabled={loading}>
        {loading ? "Prijava..." : "Prijavi se"}
      </button>
    </form>
  );
}
