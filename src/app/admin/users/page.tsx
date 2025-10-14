"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";


type Profile = { id: string; full_name: string|null; phone: string|null; role: "admin"|"owner"; is_online: boolean };

export default function AdminUsers() {
  const [rows, setRows] = useState<Profile[]>([]);

  async function load() {
    const { data, error } = await supabase.from("profiles").select("*").order("created_at",{ascending:false});
    if (error) alert(error.message); else setRows(data as Profile[]);
  }
  useEffect(()=>{ load(); },[]);

  async function setRole(id: string, role: "admin"|"owner") {
    const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
    if (error) return alert(error.message);
    load();
  }
  async function removeUser(id: string) {
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) return alert(error.message);
    load();
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Admin: Users</h2>
      <table className="w-full border">
        <thead><tr className="bg-neutral-50">
          <th className="p-2 text-left">Name</th><th className="p-2">Phone</th><th className="p-2">Role</th><th className="p-2">Online</th><th className="p-2">Actions</th>
        </tr></thead>
        <tbody>
          {rows.map(u=>(
            <tr key={u.id} className="border-t">
              <td className="p-2">{u.full_name ?? "—"}</td>
              <td className="p-2">{u.phone ?? "—"}</td>
              <td className="p-2">{u.role}</td>
              <td className="p-2">{u.is_online ? "Yes":"No"}</td>
              <td className="p-2 flex gap-2">
                <button className="btn" onClick={()=>setRole(u.id, "admin")}>Make Admin</button>
                <button className="btn" onClick={()=>setRole(u.id, "owner")}>Make Owner</button>
                <button className="btn" onClick={()=>removeUser(u.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
