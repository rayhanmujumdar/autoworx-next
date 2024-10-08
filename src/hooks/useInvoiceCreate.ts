// useInvoiceCreate.ts
import { useEstimateCreateStore } from "@/stores/estimate-create";
import { usePathname } from "next/navigation";
import { InvoiceType } from "@prisma/client";
import { createInvoice } from "@/actions/estimate/invoice/create";
import { updateInvoice } from "@/actions/estimate/invoice/update";
import { ServerAction } from "@/types/action";
import { useListsStore } from "@/stores/lists";

export function useInvoiceCreate(type: InvoiceType) {
  const {
    invoiceId,
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
    tasks,
    items,
    reset: resetEstimateCreate,
  } = useEstimateCreateStore();
  const { client, vehicle, status, reset: resetLists } = useListsStore();

  const pathaname = usePathname();

  async function handleSubmit(): Promise<ServerAction> {
    let photoPaths = [];
    const clientId = client?.id;
    const vehicleId = vehicle?.id;
    const statusId = status?.id;
    const isEditPage = pathaname.includes("/estimate/edit/");

    // upload photos
    if (photos.length > 0) {
      const formData = new FormData();
      photos.forEach((photo) => {
        formData.append("photos", photo);
      });

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        console.error("Failed to upload photos");
        return res.json();
      }

      const json = await res.json();
      // if (json.status === "fail") {
      //   console.error("Fail to upload photos");

      //   return json
      // }
      console.log({ json });
      const data = json.data;
      photoPaths.push(...data);
    }
    let res;
    if (isEditPage) {
      res = await updateInvoice({
        id: invoiceId,
        clientId: clientId ? clientId : undefined,
        vehicleId: vehicleId ? vehicleId : undefined,
        statusId: statusId ? statusId : undefined,
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
        photos: photoPaths,
        items,
        tasks,
      });
    } else {
      res = await createInvoice({
        invoiceId,
        type,
        clientId: clientId ? +clientId : undefined,
        vehicleId: vehicleId ? +vehicleId : undefined,
        statusId: statusId ? +statusId : undefined,
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
        photos: photoPaths,
        items,
        tasks,
      });
    }

    if (res.type === "success") {
      resetEstimateCreate();
      resetLists();
    }

    return res;
  }

  return handleSubmit;
}
