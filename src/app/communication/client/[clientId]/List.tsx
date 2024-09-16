import { cn } from "@/lib/cn";
import { Client } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getClients } from "../actions/actions";

// TODO: use layout for this component
export default function List({ id }: { id: string }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    getClients().then((data) => {
      setClients(data);
    });
  }, []);

  useEffect(() => {
    if (search !== "") {
      const filteredClients = clients.filter(
        (client: any) =>
          client.firstName.toLowerCase().includes(search.toLowerCase()) ||
          client.lastName.toLowerCase().includes(search.toLowerCase()),
      );
      setFilteredClients(filteredClients);
    } else {
      setFilteredClients(clients);
    }
  }, [search, clients]);

  return (
    <div className="app-shadow h-[83vh] w-[20%] rounded-lg border border-emerald-600 bg-white p-3">
      {/* Header */}
      <h2 className="text-[14px] text-[#797979]">Client List</h2>

      {/* Search */}
      <form className="w-full">
        <input
          type="text"
          placeholder="Search here..."
          className="my-6 mr-2 w-full rounded-md border border-emerald-600 p-2 text-[12px] text-[#797979]"
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>

      {/* List */}
      <div className="mt-2 flex h-[87%] flex-col gap-2 overflow-y-auto max-[1835px]:h-[82%]">
        {filteredClients?.map((user: any) => {
          const selected = id == user.id;

          return (
            <Link
              key={user.id}
              className={cn(
                "flex items-center gap-2 rounded-md p-3",
                selected ? "bg-[#006D77]" : "bg-[#F2F2F2]",
              )}
              href={`/communication/client/${user.id}`}
            >
              <Image
                src={
                  !user.photo
                    ? "/images/default.png"
                    : user.photo.includes("/images/default.png")
                      ? "/images/default.png"
                      : `/api/images/${user.photo}`
                }
                alt={user.firstName + " " + user.lastName}
                width={60}
                height={60}
                className="rounded-full max-[1400px]:h-[40px] max-[1400px]:w-[40px]"
              />
              <div className="flex flex-col">
                <p
                  className={cn(
                    "text-[14px] font-bold",
                    selected ? "text-white" : "text-[#797979]",
                  )}
                >
                  {user.firstName} {user.lastName}
                </p>
                <p
                  className={cn(
                    "mt-2 text-xs",
                    selected ? "text-white" : "text-[#797979]",
                  )}
                >
                  {user.customerCompany}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
