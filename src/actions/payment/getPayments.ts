"use server";

import { getCompanyId } from "@/lib/companyId";
import { db } from "@/lib/db";

export interface ReturnPayment {
  id: number;
  invoiceId: string;
  client: {
    id?: number;
    name?: string;
  };
  vehicle?: string;
  date: Date;
  amount: number;
  method: string;
}

export async function getPayments(): Promise<ReturnPayment[]> {
  const companyId = await getCompanyId();

  const payments = await db.payment.findMany({
    where: {
      companyId,
    },
    include: {
      invoice: {
        include: {
          vehicle: true,
          client: true,
        },
      },
      card: true,
      cash: true,
      check: true,
      other: {
        include: {
          paymentMethod: true,
        },
      },
    },
  });

  return payments.map((payment) => {
    return {
      id: payment.id,
      invoiceId: payment.invoiceId as string,
      client: {
        id: payment?.invoice?.client?.id,
        name:
          payment?.invoice?.client?.firstName +
          " " +
          payment?.invoice?.client?.lastName,
      },
      vehicle: `${payment?.invoice?.vehicle?.year} ${payment?.invoice?.vehicle?.make} ${payment?.invoice?.vehicle?.model}`,
      date: payment.date as Date,
      amount: Number(payment.invoice?.grandTotal),
      method: getPaymentMethod(payment),
    };
  });
}

function getPaymentMethod(payment: any) {
  if (payment.card) {
    return "Credit Card";
  } else if (payment.cash) {
    return "Cash";
  } else if (payment.check) {
    return "Check";
  } else if (payment.other) {
    return payment.other.paymentMethod?.name;
  } else {
    return "Unknown";
  }
}