"use client";
import AdminLayout from "@/app/adminLayout";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MySpinner from "@/components/ui/my-spinner";

type UserRole = "ADMIN" | "MANAGER" | "USER" | "VIEWER";

type User = {
  id: number;
  email: string;
  name: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
};

const emptyNewUser = {
  email: "",
  name: "",
  role: "USER" as UserRole,
  isActive: true,
};

export default function AccountsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [creating, setCreating] = useState<boolean>(false);
  const [newUser, setNewUser] = useState<typeof emptyNewUser>(emptyNewUser);
  const [search, setSearch] = useState<string>("");

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users", { cache: "no-store" });
      const data = await res.json();
      setUsers(data as User[]);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const canCreate = useMemo(() => {
    return newUser.email.trim().length > 3;
  }, [newUser.email]);

  const handleCreate = async () => {
    if (!canCreate) return;
    setCreating(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (!res.ok) throw new Error("create_failed");
      setNewUser(emptyNewUser);

      await loadUsers();
    } catch (e) {
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (user: User) => {
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, isActive: !user.isActive }),
      });
      if (!res.ok) throw new Error("patch_failed");

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, isActive: !u.isActive } : u
        )
      );
    } catch (e) {}
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Comptes utilisateurs
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gérez la création, l’activation et les rôles des comptes.
            </p>
          </div>
        </div>

        <Card className="p-5">
          <h2 className="text-base md:text-lg font-semibold mb-4">
            Créer un utilisateur
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <input
              className="border rounded px-3 py-2"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser((s) => ({ ...s, email: e.target.value }))
              }
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Nom (optionnel)"
              value={newUser.name}
              onChange={(e) =>
                setNewUser((s) => ({ ...s, name: e.target.value }))
              }
            />
            <select
              className="border rounded px-3 py-2"
              value={newUser.role}
              onChange={(e) =>
                setNewUser((s) => ({ ...s, role: e.target.value as UserRole }))
              }
            >
              <option value="ADMIN">ADMIN</option>
              <option value="MANAGER">MANAGER</option>
              <option value="USER">USER</option>
              <option value="VIEWER">VIEWER</option>
            </select>
            <div className="flex items-center gap-2">
              <input
                id="new-active"
                type="checkbox"
                checked={newUser.isActive}
                onChange={(e) =>
                  setNewUser((s) => ({ ...s, isActive: e.target.checked }))
                }
              />
              <label htmlFor="new-active">Actif</label>
            </div>
            <div className="flex items-center">
              <Button disabled={!canCreate || creating} onClick={handleCreate}>
                {creating ? "Création..." : "Créer"}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Un mot de passe initial est défini automatiquement. Vous pourrez le
            changer plus tard.
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-base md:text-lg font-semibold">Utilisateurs</h2>
            <input
              className="border rounded px-3 py-2 w-full max-w-xs"
              placeholder="Rechercher par email, nom ou rôle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {loading ? (
            <div className="py-6">
              <MySpinner />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left">
                    <th className="py-2 px-3 text-xs font-medium uppercase text-muted-foreground">
                      ID
                    </th>
                    <th className="py-2 px-3 text-xs font-medium uppercase text-muted-foreground">
                      Email
                    </th>
                    <th className="py-2 px-3 text-xs font-medium uppercase text-muted-foreground">
                      Nom
                    </th>
                    <th className="py-2 px-3 text-xs font-medium uppercase text-muted-foreground">
                      Rôle
                    </th>
                    <th className="py-2 px-3 text-xs font-medium uppercase text-muted-foreground">
                      Statut
                    </th>
                    <th className="py-2 px-3 text-xs font-medium uppercase text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users
                    .filter((u) => {
                      const target = `${u.email} ${u.name ?? ""} ${
                        u.role
                      }`.toLowerCase();
                      return target.includes(search.toLowerCase());
                    })
                    .map((u) => (
                      <tr key={u.id} className="bg-card rounded-lg shadow-sm">
                        <td className="py-3 px-3 align-middle">{u.id}</td>
                        <td className="py-3 px-3 align-middle font-medium">
                          {u.email}
                        </td>
                        <td className="py-3 px-3 align-middle">
                          {u.name ?? "—"}
                        </td>
                        <td className="py-3 px-3 align-middle">
                          <span
                            className={
                              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
                              (u.role === "ADMIN"
                                ? "bg-red-100 text-red-700"
                                : u.role === "MANAGER"
                                ? "bg-amber-100 text-amber-700"
                                : u.role === "USER"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-100 text-slate-700")
                            }
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-3 align-middle">
                          <span
                            className={
                              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
                              (u.isActive
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-zinc-200 text-zinc-700")
                            }
                          >
                            {u.isActive ? "Actif" : "Inactif"}
                          </span>
                        </td>
                        <td className="py-3 px-3 align-middle">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="secondary"
                              onClick={() => void toggleActive(u)}
                            >
                              {u.isActive ? "Désactiver" : "Activer"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
