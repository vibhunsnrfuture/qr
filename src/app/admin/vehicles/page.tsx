"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Row = { id: number; plate: string; owner_id: string; created_at: string };

export default function AdminVehicles() {
  const [rows, setRows] = useState<Row[]>([]);
  async function load() {
    const { data, error } = await supabase.from("vehicles").select("id,plate,owner_id,created_at").order("created_at",{ascending:false});
    if (error) alert(error.message); else setRows(data as Row[]);
  }
  useEffect(()=>{ load(); },[]);
  async function remove(id: number) {
    const { error } = await supabase.from("vehicles").delete().eq("id", id);
    if (error) return alert(error.message);
    load();
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Admin: Vehicles</h2>
      <table className="w-full border">
        <thead><tr className="bg-neutral-50">
          <th className="p-2 text-left">Plate</th><th className="p-2">Owner</th><th className="p-2">Created</th><th className="p-2">Actions</th>
        </tr></thead>
        <tbody>
          {rows.map(v=>(
            <tr key={v.id} className="border-t">
              <td className="p-2 font-mono">{v.plate}</td>
              <td className="p-2">{v.owner_id}</td>
              <td className="p-2">{new Date(v.created_at).toLocaleString()}</td>
              <td className="p-2"><button className="btn" onClick={()=>remove(v.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
