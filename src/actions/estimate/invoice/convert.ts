"use server";

import { db } from "@/lib/db";
import { ServerAction } from "@/types/action";
import { revalidatePath } from "next/cache";

export async function convertInvoice(id: string): Promise<ServerAction> {
  const invoice = await db.invoice.findUnique({ where: { id } });

  if (!invoice) {
    return { type: "error", message: "Invoice not found" };
  }

  await db.invoice.update({
    where: { id },
    data: {
      type: invoice.type === "Estimate" ? "Invoice" : "Estimate",
    },
  });

  // get all the product materials
  const materials = await db.material.findMany({
    where: {
      invoiceId: id,
      // productId not null
      productId: { not: null },
    },
    include: {
      vendor: true,
    },
  });

  // merge all the same products and sum the quantity
  const productsWithQuantity = materials.reduce(
    (acc: { id: number; quantity: number }[], material) => {
      const product = acc.find((p) => p.id === material.productId);

      if (product) {
        if (material.quantity !== null) {
          product.quantity += material.quantity;
        }
      } else {
        acc.push({
          id: material.productId as number,
          quantity: material.quantity || 0,
        });
      }

      return acc;
    },
    [],
  );

  await Promise.all(
    productsWithQuantity.map(async (product) => {
      // create a new history entry
      await db.inventoryProductHistory.create({
        data: {
          productId: product.id,
          date: new Date(),
          quantity: product.quantity,
          price: materials.find((m) => m.productId === product.id)?.sell,
          vendorId: materials.find((m) => m.productId === product.id)?.vendor
            ?.id!,
          type: "Sale",
          invoiceId: id,
        },
      });

      // update the inventoryProduct quantity
      await db.inventoryProduct.update({
        where: {
          id: product.id,
        },
        data: {
          quantity: {
            decrement: product.quantity,
          },
        },
      });
    }),
  );

  revalidatePath("/estimate");

  return { type: "success", message: "Invoice converted" };
}
