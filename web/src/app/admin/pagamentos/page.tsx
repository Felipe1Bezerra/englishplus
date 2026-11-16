import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState, PageHeader, Table } from "@/components/ui";
import { pageApi, type PaymentRow } from "@/lib/api";
import { brl, formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Pagamentos" };

const PROVIDER_LABEL: Record<string, string> = {
  mercadopago: "Mercado Pago",
  simulated: "Teste",
};

export default async function PaymentsPage() {
  const payments = await pageApi<PaymentRow[]>("/admin/payments");

  return (
    <>
      <PageHeader title="Pagamentos" description="Os 100 pagamentos mais recentes." />

      {payments.length === 0 ? (
        <EmptyState>Nenhum pagamento recebido ainda.</EmptyState>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Aluno</th>
              <th>Pacote</th>
              <th>Valor</th>
              <th>Origem</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>{formatDate(payment.paidAt)}</td>
                <td>
                  <Link
                    href={`/admin/alunos/${payment.studentId}`}
                    className="font-semibold text-navy underline-offset-4 hover:underline"
                  >
                    {payment.studentName}
                  </Link>
                </td>
                <td>
                  {payment.packageName} ({payment.billing === "yearly" ? "anual" : "mensal"})
                </td>
                <td className="font-semibold">{brl(payment.amountCents)}</td>
                <td>{PROVIDER_LABEL[payment.provider] ?? payment.provider}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
