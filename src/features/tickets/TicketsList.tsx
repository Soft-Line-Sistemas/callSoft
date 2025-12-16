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
            <th className="text-left">Pedido</th>
            <th className="text-left">Assunto</th>
            <th className="text-left">Solicitante</th>
            <th className="text-left">Status</th>
            <th className="text-left">Data</th>
          </tr>
        </thead>
        <tbody>
          {(data?.tickets ?? []).map((t) => (
            <tr key={t.id}>
              <td>#{t.numero}</td>
              <td>{t.subject}</td>
              <td>{t.clientName}</td>
              <td>{t.status}</td>
              <td>{new Date(t.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
