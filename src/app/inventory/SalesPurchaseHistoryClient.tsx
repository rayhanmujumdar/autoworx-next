"use client";

import { cn } from "@/lib/cn";
import {
  InventoryProduct,
  InventoryProductHistory,
  InventoryProductHistoryType,
  Vendor,
} from "@prisma/client";
import * as Tabs from "@radix-ui/react-tabs";
import moment from "moment";
import Link from "next/link";
import { useState } from "react";
import { HiExternalLink } from "react-icons/hi";
import EditHistory from "./EditHistory";

enum Tab {
  Sales = "sales",
  Purchase = "purchase",
}

const evenColor = "bg-white";
const oddColor = "bg-[#F8FAFF]";

export default function SalesPurchaseHistoryClient({
  product,
  histories,
}: {
  product?: InventoryProduct;
  histories: (InventoryProductHistory & { vendor: Vendor | null })[];
}) {
  const [tab, setTab] = useState<Tab>(Tab.Sales);

  return (
    <div className="app-shadow mt-4 h-[63%] w-full overflow-y-auto rounded-lg bg-white p-4">
      <Tabs.Root value={tab} onValueChange={(value) => setTab(value as Tab)}>
        <Tabs.List className="flex gap-5">
          <Tabs.Trigger
            value={Tab.Sales}
            className={cn(
              "rounded-md p-2 px-5 text-sm 2xl:text-lg",
              tab === Tab.Sales
                ? "bg-[#6571FF] text-white"
                : "border border-[#6571FF] text-[#6571FF]",
            )}
          >
            Sales List
          </Tabs.Trigger>
          <Tabs.Trigger
            value={Tab.Purchase}
            className={cn(
              "rounded-md p-2 px-5 text-sm 2xl:text-lg",
              tab === Tab.Purchase
                ? "bg-[#6571FF] text-white"
                : "border border-[#6571FF] text-[#6571FF]",
            )}
          >
            Purchase List
          </Tabs.Trigger>
        </Tabs.List>
        <div className="mt-3">
          <Tabs.Content value={Tab.Sales}>
            <Table
              histories={histories.filter((history) => history.type === "Sale")}
              type="Sale"
              product={product}
            />
          </Tabs.Content>
          <Tabs.Content value={Tab.Purchase}>
            <Table
              histories={histories.filter(
                (history) => history.type === "Purchase",
              )}
              type="Purchase"
              product={product}
            />
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  );
}

function Table({
  histories,
  type,
  product,
}: {
  histories: (InventoryProductHistory & { vendor: Vendor | null })[];
  type: InventoryProductHistoryType;
  product?: InventoryProduct;
}) {
  return (
    <table className="w-full text-sm 2xl:text-base">
      <thead className="bg-white">
        <tr className="h-10 border-b">
          {product?.type === "Product" && (
            <th className="text-center">
              {type === "Sale" ? "Invoice" : "Receipt"}
            </th>
          )}
          <th className="text-center">Name</th>
          <th className="text-center">Price</th>
          <th className="text-center">Quantity</th>
          <th className="text-center">Total</th>
          <th className="text-center">Date</th>
          {type === "Purchase" && <th className="text-center">Action</th>}
        </tr>
      </thead>

      <tbody>
        {histories.map((history, index) => (
          <tr
            key={history.id}
            className={cn("py-3", index % 2 === 0 ? evenColor : oddColor)}
          >
            {product?.type === "Product" && (
              <>
                {type === "Sale" ? (
                  <td className="text-center text-[#6571FF]">
                    {history.invoiceId && (
                      <Link href={`/estimate/view/${history.invoiceId}`}>
                        {history.invoiceId}
                      </Link>
                    )}
                  </td>
                ) : (
                  <td className="text-center text-[#6571FF]">
                    <p>{product && product.receipt}</p>
                  </td>
                )}
              </>
            )}

            <td className="text-nowrap text-center">{history.vendor?.name}</td>
            <td className="text-nowrap text-center">
              ${history.price?.toString()}
            </td>
            <td className="text-center">{history.quantity}</td>
            <td className="text-center">
              ${parseFloat(history.price?.toString() || "0") * history.quantity}
            </td>
            <td className="text-center">
              {moment(history.date).format(
                // date.month.year
                "DD.MM.YYYY",
              )}
            </td>
            {type === "Purchase" && (
              <td className="text-center">
                <EditHistory
                  historyId={history.id}
                  productId={product?.id!}
                  date={history.date!}
                  vendor={history.vendor}
                  quantity={history.quantity}
                  price={Number(history.price)}
                  unit={product?.unit!}
                  lot={product?.lot!}
                  notes={history.notes!}
                />
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
