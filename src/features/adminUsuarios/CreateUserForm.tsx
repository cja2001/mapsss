import { useState, type FormEvent } from "react";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Alert } from "../../components/Alert";
import type { Rol } from "../../lib/types";
import { useCreateUserFn } from "./useCreateUserFn";

const inputClasses =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30";

export function CreateUserForm({ roles, onCreated }: { roles: Rol[]; onCreated: () => void }) {
  const { crearUsuario } = useCreateUserFn();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rolId, setRolId] = useState<string>(roles[0] ? String(roles[0].id) : "");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !password || !rolId || !nombre || !apellido) return;

    setLoading(true);
    setMsg(null);

    try {
      await crearUsuario({ email, password, nombre, apellido, rol_id: String(rolId) });
      setMsg({ text: "✓ Usuario creado exitosamente", type: "success" });
      setNombre("");
      setApellido("");
      setEmail("");
      setPassword("");
      onCreated();
    } catch (err) {
      let text = err instanceof Error ? err.message : "Error desconocido";
      if (text === "TypeError: Failed to fetch" || text === "Failed to fetch") {
        text =
          'No se pudo conectar con la Edge Function. Esto usualmente significa que no está desplegada en tu proyecto de Supabase. Despliégala con: "supabase functions deploy create-user"';
      }
      setMsg({ text, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h2 className="mb-4 text-lg font-bold text-white">Crear usuario</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <input
            className={inputClasses}
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <input
            className={inputClasses}
            placeholder="Apellido"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            required
          />
        </div>

        <input
          className={inputClasses}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className={inputClasses}
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <select
          className={inputClasses}
          value={rolId}
          onChange={(e) => setRolId(e.target.value)}
          required
        >
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre}
            </option>
          ))}
        </select>

        {msg && <Alert message={msg.text} type={msg.type} />}

        <Button type="submit" loading={loading}>
          {loading ? "Creando…" : "Crear usuario"}
        </Button>
      </form>
    </Card>
  );
}
