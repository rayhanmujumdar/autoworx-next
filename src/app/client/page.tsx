import Title from "@/components/Title";
import { cn } from "@/lib/cn";
import Link from "next/link";
import React from "react";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import { IoSearchOutline } from "react-icons/io5";
import EditClient from "./EditClient";
import { db } from "@/lib/db";
import { getCompanyId } from "@/lib/companyId";
import DeleteClient from "./DeleteClient";
import NewCustomer from "@/components/Lists/NewCustomer";
import ClientList from "./ClientList";
import Header from "./Header";

export default async function Page() {
  const companyId = await getCompanyId();
  const clients = await db.client.findMany({
    where: { companyId },
    include: { tag: true, source: true },
  });

  return (
    <div className="h-full w-full space-y-8">
      <Title>Client List</Title>

      <Header />
      <ClientList clients={clients} />
    </div>
  );
}
