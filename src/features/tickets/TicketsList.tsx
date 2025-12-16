"use client";
import { useQuery } from "@tanstack/react-query";
import { api, Ticket } from "../../lib/api";

export function TicketsList() {
  const { data } = useQuery<{ tickets: Ticket[] }>({
    queryKey: ["tickets"],
    queryFn: async () => {
      const res = await api.get("/tickets");
      return { tickets: res.data as Ticket[] };
    }
  });
  return (
    <div className="mt-4">
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th className="text-left">Número</th>
            <th className="text-left">Status</th>
            <th className="text-left">Data</th>
            <th className="text-left">Hora</th>
          </tr>
        </thead>
        <tbody>
          {(data?.tickets ?? []).map((t) => {
            const createdAt = t.createdAt ? new Date(t.createdAt) : null;
            return (
              <tr key={t.id}>
                <td>{t.numero}</td>
                <td>{t.status}</td>
                <td>{createdAt ? createdAt.toLocaleDateString() : "-"}</td>
                <td>{createdAt ? createdAt.toLocaleTimeString() : "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
