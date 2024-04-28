"use client";

import { addCustomer } from "@/app/customer/add";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/Dialog";
import Input from "@/components/Input";
import Submit from "@/components/Submit";

export default function NewCustomer({ setCustomers }: { setCustomers: any }) {
  async function handleSubmit(data: FormData) {
    const firstName = data.get("first-name") as string;
    const lastName = data.get("last-name") as string;
    const email = data.get("email") as string;
    const mobile = parseInt(data.get("mobile") as string);
    const company = data.get("company") as string;
    const address = data.get("address") as string;
    const city = data.get("city") as string;
    const state = data.get("state") as string;
    const zip = data.get("zip") as string;
    const tag = data.get("tag") as string;

    const res = await addCustomer({
      firstName,
      lastName,
      email,
      mobile,
      customerCompany: company,
      address,
      city,
      state,
      zip,
      tag,
    });

    setCustomers((prev: any) => [...prev, res]);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="text-xs text-[#6571FF]">
          + New Customer
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <form>
          <DialogHeader>
            <DialogTitle>Add Client</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <div className="flex">
              <div>
                <label htmlFor="first-name" className="text-lg font-medium">
                  First Name
                </label>
                <Input
                  type="text"
                  name="first-name"
                  className="rounded-md border-2 border-slate-400 p-1"
                  required
                />
              </div>

              <div>
                <label htmlFor="last-name" className="text-lg font-medium">
                  Last Name
                </label>
                <Input
                  type="text"
                  name="last-name"
                  className="rounded-md border-2 border-slate-400 p-1"
                />
              </div>
            </div>

            <div className="flex">
              <div>
                <label htmlFor="email" className="text-lg font-medium">
                  Email Address
                </label>
                <Input
                  type="text"
                  name="email"
                  className="rounded-md border-2 border-slate-400 p-1"
                />
              </div>

              <div>
                <label htmlFor="mobile" className="text-lg font-medium">
                  Mobile Number
                </label>
                <Input
                  type="text"
                  name="mobile"
                  className="rounded-md border-2 border-slate-400 p-1"
                />
              </div>
            </div>

            <div>
              <label htmlFor="company">Company Name</label>
              <Input
                type="text"
                name="company"
                className="w-full rounded-md border-2 border-slate-400 p-1"
              />
            </div>

            <div>
              <label htmlFor="address">Address</label>
              <Input
                type="text"
                name="address"
                className="w-full rounded-md border-2 border-slate-400 p-1"
              />
            </div>

            <div className="flex justify-between">
              <div>
                <label htmlFor="city">City</label>
                <br />
                <Input
                  type="text"
                  name="city"
                  className="w-32 rounded-md border-2 border-slate-400 p-1"
                />
              </div>

              <div>
                <label htmlFor="state">State</label>
                <br />
                <Input
                  type="text"
                  name="state"
                  className="w-32 rounded-md border-2 border-slate-400 p-1"
                />
              </div>

              <div>
                <label htmlFor="zip">Zip</label>
                <br />
                <Input
                  type="text"
                  name="zip"
                  className="w-32 rounded-md border-2 border-slate-400 p-1"
                />
              </div>
            </div>

            <div>
              <label htmlFor="tag">Add Tag</label>
              <br />
              <Input
                type="text"
                name="tag"
                className="w-32 rounded-md border-2 border-slate-400 p-1"
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose className="rounded-lg border-2 border-slate-400 p-2">
              Cancel
            </DialogClose>
            <Submit
              className="rounded-lg border bg-[#6571FF] px-5 py-2 text-white"
              formAction={handleSubmit}
            >
              Add
            </Submit>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
