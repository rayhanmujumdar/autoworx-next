"use client";

import { cn } from "../../../../lib/cn";
import { TASK_COLOR } from "@/lib/consts";
import { usePopupStore } from "../../../../stores/popup";
import { Task, User } from "@prisma/client";
import Image from "next/image";

export default function UserComponent({
  isSelected,
  handleClick,
  user,
  users,
  index,
  tasks,
}: {
  isSelected: boolean;
  handleClick: () => void;
  user: User & { tasks: Task[] };
  users: User[];
  index: number;
  tasks: Task[];
}) {
  const { open } = usePopupStore();

  return (
    <>
      <button
        className={cn(
          "mt-2 flex w-full items-center rounded-lg py-2",
          isSelected ? "bg-[#006D77]" : "bg-[#F8F9FA]",
        )}
        onClick={handleClick}
        key={index}
      >
        <Image
          src={user.image}
          alt="User Image"
          width={50}
          height={50}
          className="rounded-full"
        />
        <p
          className={cn(
            "ml-2 text-[14px] font-bold",
            isSelected ? "text-white" : "text-[#797979]",
          )}
        >
          {user.name}
        </p>
      </button>

      {isSelected && (
        <div className="my-3">
          {user.tasks.map((task, index) => (
            <div className="ml-4 mt-2 flex items-center gap-2" key={index}>
              <div
                className="h-[10px] w-[10px] rounded-full"
                style={{ backgroundColor: TASK_COLOR[task.type] }}
              ></div>
              <p className="text-[16px]">{task.title}</p>
            </div>
          ))}

          <button
            className="mt-3 rounded-2xl bg-slate-500 px-5 py-1 text-[15px] text-white"
            onClick={() =>
              open("ASSIGN_TASK", {
                user,
                users,
                tasks,
              })
            }
          >
            + Assign Task
          </button>
        </div>
      )}
    </>
  );
}
