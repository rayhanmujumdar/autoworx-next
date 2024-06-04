import Selector from "@/components/Selector";
import { useListsStore } from "@/stores/lists";
import { Category, Tag } from "@prisma/client";
import { useEffect, useState } from "react";
import newCategory from "./actions/newCategory";
import { useEstimatePopupStore } from "@/stores/estimate-popup";
import { useEstimateCreateStore } from "@/stores/estimate-create";
import { newLabor } from "./actions/newLabor";
import Close from "./CloseEstimate";
import { updateLabor } from "./actions/updateLabor";
import { cn } from "@/lib/cn";
import { SelectTags } from "@/components/Lists/SelectTags";

export default function LaborCreate() {
  const { categories } = useListsStore();
  const { currentSelectedCategoryId } = useEstimateCreateStore();

  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [hours, setHours] = useState<number>();
  const [charge, setCharge] = useState<number>();
  const [discount, setDiscount] = useState<number>();
  const [addToCannedLabor, setAddToCannedLabor] = useState<boolean>(false);

  const [categoryInput, setCategoryInput] = useState("");

  const { close, data } = useEstimatePopupStore();
  const itemId = data?.itemId;

  const [categoryOpen, setCategoryOpen] = useState(false);

  useEffect(() => {
    if (currentSelectedCategoryId) {
      setCategory(
        categories.find((cat) => cat.id === currentSelectedCategoryId)!,
      );
    }
  }, [currentSelectedCategoryId]);

  useEffect(() => {
    if (data?.labor && data.edit) {
      setName(data.labor.name);
      setCategory(data.labor.category);
      setTags(data.labor.tags);
      setNotes(data.labor.notes);
      setHours(data.labor.hours);
      setCharge(data.labor.charge);
      setDiscount(data.labor.discount);
      setAddToCannedLabor(data.labor.addToCannedLabor);
    } else {
      setName("");
      setCategory(null);
      setTags([]);
      setNotes("");
      setHours(1);
      setCharge(0);
      setDiscount(0);
      setAddToCannedLabor(false);
    }
  }, [data]);

  async function handleNewCategory() {
    const res = await newCategory({
      name: categoryInput,
    });

    if (res.type === "success") {
      useListsStore.setState((state) => {
        return { categories: [...state.categories, res.data] };
      });
      setCategory(res.data);
      setCategoryInput("");
      setCategoryOpen(false);
    }
  }

  async function handleSubmit() {
    if (!name) {
      alert("Labor name is required");
      return;
    }

    const res = await newLabor({
      name,
      categoryId: category?.id,
      tags,
      notes,
      hours: hours || 1,
      charge: charge || 0,
      discount: discount || 0,
      addToCannedLabor,
    });

    if (res.type === "success") {
      // Change the service where itemId is the same
      useEstimateCreateStore.setState((state) => {
        const items = state.items.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              labor: res.data,
            };
          }
          return item;
        });
        return { items };
      });

      // Add to listsStore
      useListsStore.setState((state) => {
        return { labors: [...state.labors, res.data] };
      });

      close();
    }
  }

  async function handleEdit() {
    if (!name) {
      alert("Labor name is required");
      return;
    }

    const res = await updateLabor({
      id: data.labor.id,
      name,
      categoryId: category?.id,
      tags,
      notes,
      hours: hours || 1,
      charge: charge || 0,
      discount: discount || 0,
      addToCannedLabor,
    });

    if (res.type === "success") {
      // Change the service where itemId is the same
      useEstimateCreateStore.setState((state) => {
        const items = state.items.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              labor: res.data,
            };
          }
          return item;
        });
        return { items };
      });

      // Update the labor in listsStore
      useListsStore.setState((state) => {
        return {
          labors: state.labors.map((labor) => {
            if (labor.id === data.labor.id) {
              return res.data;
            }
            return labor;
          }),
        };
      });

      close();
    }
  }

  return (
    <div className="flex flex-col gap-2 p-5">
      <h3 className="w-full text-xl font-semibold">
        {/* Labor Information */}
        {data?.edit ? "Edit Labor Information" : "Labor Information"}
      </h3>

      <div className="flex items-center gap-2">
        <label htmlFor="name" className="w-28 text-end text-sm">
          Labor Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border-2 border-slate-400 p-1 text-xs"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="w-28 text-end text-sm">Category</label>
        <Selector
          label={category ? category.name : ""}
          openState={[categoryOpen, setCategoryOpen]}
          newButton={
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Category Name"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                className="w-full rounded-md border-2 border-slate-400 p-1"
              />
              <button
                onClick={handleNewCategory}
                className={cn(
                  "text-nowrap rounded-md px-2 text-white",
                  categoryInput ? "bg-slate-700" : "bg-slate-400",
                )}
                type="button"
                disabled={!categoryInput}
              >
                Quick Add
              </button>
            </div>
          }
        >
          <div>
            {categories
              // sort by currentSelectedCategoryId
              .sort((a, b) => {
                if (a.id === currentSelectedCategoryId) return -1;
                if (b.id === currentSelectedCategoryId) return 1;
                return 0;
              })
              .map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat)}
                  className="mx-auto my-1 block w-[90%] rounded-md border-2 border-slate-400 p-1 text-center hover:bg-slate-200"
                >
                  {cat.name}
                </button>
              ))}
          </div>
        </Selector>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="tags" className="w-28 text-end text-sm">
          Tags
        </label>
        <div className="w-full">
          <SelectTags value={tags} setValue={setTags} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="notes" className="w-28 text-end text-sm">
          Notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="h-30 w-full rounded-md border-2 border-slate-400 p-1 text-xs"
        />
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="hours" className="w-28 text-end text-sm">
          No. of Hours
        </label>
        <input
          type="number"
          id="hours"
          value={hours}
          onChange={(e) => setHours(parseInt(e.target.value))}
          className="w-full rounded-md border-2 border-slate-400 p-1 text-xs"
        />
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="perhour" className="w-28 text-end text-sm">
          $/hr
        </label>
        <input
          type="number"
          id="perhour"
          value={charge}
          onChange={(e) => setCharge(parseFloat(e.target.value))}
          className="w-full rounded-md border-2 border-slate-400 p-1 text-xs"
        />
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="discount" className="w-28 text-end text-sm">
          Discount
        </label>
        <input
          type="number"
          id="discount"
          value={discount}
          onChange={(e) => setDiscount(parseFloat(e.target.value))}
          className="w-full rounded-md border-2 border-slate-400 p-1 text-xs"
        />
      </div>

      <div className="ml-5 flex items-center gap-5">
        <input
          id="check"
          type="checkbox"
          checked={addToCannedLabor}
          onChange={(e) => setAddToCannedLabor(e.target.checked)}
        />
        <label htmlFor="check">Add to Canned Labor</label>
      </div>

      <div className="flex justify-center gap-5">
        <Close />
        <button
          className="w-fit rounded-md bg-[#6571FF] p-1 px-5 text-white"
          onClick={data?.edit ? handleEdit : handleSubmit}
          type="button"
        >
          Done
        </button>
      </div>
    </div>
  );
}
