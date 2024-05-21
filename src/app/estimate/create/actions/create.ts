"use server";

import { auth } from "@/app/auth";
import { db } from "@/lib/db";
import { ServerAction } from "@/types/action";
import { AuthSession } from "@/types/auth";
import {
  Task,
  InvoiceType,
  Service,
  Material,
  Labor,
  Tag,
} from "@prisma/client";

export async function create({
  title,
  invoiceId,
  type,

  clientId,
  vehicleId,
  statusId,

  subtotal,
  discount,
  tax,
  deposit,
  depositNotes,
  depositMethod,
  grandTotal,
  due,

  internalNotes,
  terms,
  policy,
  customerNotes,
  customerComments,

  photos,
  items,
}: {
  title: string;
  invoiceId: string;
  type: InvoiceType;

  clientId?: number;
  vehicleId?: number;
  statusId?: number;

  subtotal: number;
  discount: number;
  tax: number;
  deposit: number;
  depositNotes: string;
  depositMethod: string;
  grandTotal: number;
  due: number;

  internalNotes: string;
  terms: string;
  policy: string;
  customerNotes: string;
  customerComments: string;

  photos: string[];
  items: {
    service: Service | null;
    material: Material | null;
    labor: Labor | null;
    tags: Tag[];
  }[];
}): Promise<ServerAction> {
  const session = (await auth()) as AuthSession;
  const companyId = session.user.companyId;

  const invoice = await db.invoice.create({
    data: {
      id: invoiceId,
      title,
      type,
      customerId: clientId,
      vehicleId,
      statusId,
      subtotal,
      discount,
      tax,
      deposit,
      depositNotes,
      depositMethod,
      grandTotal,
      due,
      internalNotes,
      terms,
      policy,
      customerNotes,
      customerComments,
      companyId,
    },
  });

  // Upload photos
  photos.forEach(async (photo) => {
    await db.invoicePhoto.create({
      data: {
        invoiceId: invoice.id,
        photo,
      },
    });
  });

  items.forEach(async (item) => {
    const service = item.service;
    const material = item.material;
    const labor = item.labor;
    const tags = item.tags;

    const invoiceItem = await db.invoiceItem.create({
      data: {
        invoiceId: invoice.id,
        serviceId: service?.id,
        materialId: material?.id,
        laborId: labor?.id,
      },
    });

    tags.forEach(async (tag) => {
      await db.itemTag.create({
        data: {
          itemId: invoiceItem.id,
          tagId: tag.id,
        },
      });
    });
  });

  return {
    type: "success",
    data: invoice,
  };
}
