"use client";
import { useQuery } from "@tanstack/react-query";
import { api, Ticket } from "../../lib/api";

export function TicketsList() {
  const { data } = useQuery<{ tickets: Ticket[] }>({
    queryKey: ["tickets"],
    queryFn: async () => {
      const res = await api.get("/api/v1/tickets", { params: { page: 1, pageSize: 10 } });
      return { tickets: (res.data.data.items ?? []) as Ticket[] };
    }
  });
  return (
    <div className="mt-4">
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th className="text-left">Pedido</th>
            <th className="text-left">Empresa</th>
            <th className="text-left">WhatsApp</th>
            <th className="text-left">Status</th>
            <th className="text-left">Data</th>
          </tr>
        </thead>
        <tbody>
          {(data?.tickets ?? []).map((t) => (
            <tr key={t.id}>
              <td>#{t.pedido}</td>
              <td>{t.empresa ?? "--"}</td>
              <td>{t.contatoWpp}</td>
              <td>{t.status.replace(/_/g, " ")}</td>
              <td>{new Date(t.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
