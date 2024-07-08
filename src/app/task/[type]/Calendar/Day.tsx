"use client";

import { Tooltip, TooltipContent } from "@/components/Tooltip";
import { cn } from "@/lib/cn";
import { TASK_COLOR } from "@/lib/consts";
import { usePopupStore } from "@/stores/popup";
import type {
  AppointmentFull,
  CalendarAppointment,
  CalendarTask,
} from "@/types/db";
import type {
  CalendarSettings,
  Customer,
  EmailTemplate,
  Order,
  Task,
  User,
  Vehicle,
} from "@prisma/client";
import moment from "moment";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDrop } from "react-dnd";
import { FaPen } from "react-icons/fa6";
import { useMediaQuery } from "react-responsive";
import { assignAppointmentDate } from "../actions/assignAppointmentDate";
import { dragTask } from "../actions/dragTask";
import mergeRefs from "merge-refs";
import DraggableDayTooltip from "./draggable/DraggableDayTooltip";
import DropRowButton from "./dropable/DropRowButton";

function useDate() {
  const searchParams = useSearchParams();
  const date = moment(searchParams.get("date"), moment.HTML5_FMT.DATE);
  return date.isValid() ? date : moment();
}

export default function Day({
  tasks,
  companyUsers,
  tasksWithoutTime,
  appointments,
  appointmentsFull,
  customers,
  vehicles,
  orders,
  settings,
  templates,
}: {
  // tasks with assigned users
  tasks: CalendarTask[];
  companyUsers: User[];
  tasksWithoutTime: Task[];
  appointments: CalendarAppointment[];
  appointmentsFull: AppointmentFull[];
  customers: Customer[];
  vehicles: Vehicle[];
  orders: Order[];
  settings: CalendarSettings;
  templates: EmailTemplate[];
}) {
  const rows = ["All Day"];

  rows.push(
    ...Array.from(
      { length: 24 },
      (_, i) =>
        `${i + 1 > 12 ? i + 1 - 12 : i + 1} ${i + 1 >= 12 ? "PM" : "AM"}`,
    ),
  );

  const date = useDate();

  const { open } = usePopupStore();
  const is1300 = useMediaQuery({ query: "(max-width: 1300px)" });
  const [draggedOverRow, setDraggedOverRow] = useState<number | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const [isRefAvailable, setIsRefAvailable] = useState<boolean>(false);

  const [{ canDrop, isOver }, dropRef] = useDrop({
    accept: ["tag", "task", "appointment"],
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }) as [{ canDrop: boolean; isOver: boolean }, any];

  useEffect(() => {
    // This effect checks if the ref is available and updates isRefAvailable accordingly.
    const checkRefAvailability = () => {
      setIsRefAvailable(!!parentRef.current);
    };

    checkRefAvailability();
    // Optionally, listen to resize events or other events that might affect the ref's availability
    window.addEventListener("resize", checkRefAvailability);
    return () => window.removeEventListener("resize", checkRefAvailability);
  }, []);

  const events = useMemo<
    ((
      | (CalendarTask & { type: "task" })
      | (CalendarAppointment & { type: "appointment" })
    ) & {
      rowStartIndex: number;
      rowEndIndex: number;
    })[]
  >(
    () =>
      [
        ...tasks.map((task) => ({ ...task, type: "task" as const })),
        ...appointments.map((appointment) => ({
          ...appointment,
          type: "appointment" as const,
        })),
      ]
        .filter((event: CalendarTask | CalendarAppointment) => {
          // return today's tasks
          // also filter by month and year
          const taskDate = moment(event.date);
          return (
            taskDate.date() === date.date() &&
            taskDate.month() === date.month() &&
            taskDate.year() === date.year()
          );
        })
        .map((event) => {
          const taskStartTime = moment(event.startTime, "HH:mm").format("h A");
          const taskEndTime = moment(event.endTime, "HH:mm").format("h A");

          // Find the rowStartIndex and rowEndIndex by looping through the rows array
          const rowStartIndex = rows.findIndex((row) => row === taskStartTime);
          const rowEndIndex = rows.findIndex((row) => row === taskEndTime);

          // Return the task with the rowStartIndex and rowEndIndex
          return { ...event, rowStartIndex, rowEndIndex };
        }),
    [tasks, appointments, date],
  );

  function formatDate(date: Date) {
    return moment(date).format("YYYY-MM-DD");
  }

  function formatTime(row: string = "") {
    const [hour, period] = row?.split(" ");
    const time = `${hour.padStart(2, "0")}:00 ${period}`;
    return moment(time, "hh:mm A").format("HH:mm");
  }
  async function handleDrop(event: React.DragEvent, rowIndex: number) {
    const startTime = formatTime(rows[rowIndex]);
    const endTime = formatTime(rows[rowIndex + 1]);
    const date = new Date().toISOString();

    // Get the task type
    const type = event.dataTransfer.getData("text/plain").split("|")[0];

    if (type === "task") {
      // Get the id of the task from the dataTransfer object
      const taskId = parseInt(
        event.dataTransfer.getData("text/plain").split("|")[1],
      );

      // Find the task in your state
      const task = tasksWithoutTime.find((task) => task.id == taskId);

      if (task) {
        // Add task to database
        await dragTask({
          id: task.id,
          date,
          startTime,
          endTime,
        });
      }
    } else {
      // Get the id of the appointment from the dataTransfer object
      const appointmentId = Number.parseInt(
        event.dataTransfer.getData("text/plain").split("|")[1],
      );

      // Find the appointment in your state
      const appointment = appointments.find(
        (appointment) => appointment.id === appointmentId,
      );

      if (appointment) {
        // Add appointment to database
        await assignAppointmentDate({
          id: appointment.id,
          date,
          startTime,
          endTime,
        });
      }
    }
  }

  /**
   * Calculates the left CSS position for a task in a row.
   *
   * This function dynamically calculates and returns the CSS `calc()` value for the `left` property
   * of a task based on its index within a row and the total number of tasks in that row. It ensures
   * tasks are evenly distributed across the parent container, with an additional shift to the right.
   * If the parent container's width cannot be determined, it returns "0%" as a fallback.
   *
   * @param taskIndex - Index of the task in the row.
   * @param tasksInRowLength - Total number of tasks in the row.
   * @returns CSS `calc()` string for the left position or "0%" if parent width is unknown.
   */
  function calculateLeftPosition(taskIndex: number, tasksInRowLength: number) {
    if (parentRef.current) {
      const parentWidth = parentRef.current.offsetWidth;
      console.log("parentWidth", parentWidth);
      const distributionPercentage = (90 / tasksInRowLength) * taskIndex;
      const shiftPercentage = (110 / parentWidth) * 100;
      return `calc(${distributionPercentage}% + ${shiftPercentage}%)`;
    }
    return "0%"; // Default fallback
  }
  return (
    <div
      ref={mergeRefs(dropRef, parentRef)}
      className="relative mt-3 h-[90%] overflow-auto border border-neutral-200"
    >
      {rows.map((row, i) => (
        <DropRowButton
          type="button"
          row={row}
          key={i}
          onDrop={(event: React.DragEvent) => {
            handleDrop(event, i);
            setDraggedOverRow(null);
          }}
          onDragOver={(event: React.DragEvent) => {
            event.preventDefault();
            setDraggedOverRow(i);
          }}
          onDragLeave={() => setDraggedOverRow(null)}
          className={cn(
            "block h-[45px] w-full border-neutral-200",
            i !== rows.length - 1 && "border-b",
            i !== 0 && "cursor-pointer",
          )}
          onClick={() => {
            const date = formatDate(new Date());
            const startTime = formatTime(row);
            open("ADD_TASK", { date, startTime, companyUsers });
          }}
          disabled={i === 0}
          style={{
            backgroundColor: draggedOverRow === i ? "#c4c4c4" : "white",
          }}
        >
          {/* Row heading */}
          <div
            className={cn(
              "flex h-full w-[100px] items-center justify-center border-r border-neutral-200 text-[19px] text-[#797979]",
              i === 0 && "font-bold",
            )}
          >
            {row}
          </div>
        </DropRowButton>
      ))}

      {/* Tasks */}
      {events.map((event, index) => {
        const top = `${event.rowStartIndex * 45}px`;
        const height = `${
          (event.rowEndIndex - event.rowStartIndex + 1) * 55
        }px`;
        const widthNumber = is1300 ? 300 : 300;
        let width = `${widthNumber}px`;
        // @ts-ignore
        const backgroundColor = event.priority
          ? // @ts-ignore
            TASK_COLOR[event.priority]
          : "rgb(255, 255, 255)";

        // Calculate how many tasks are in the same row
        //TODO:
        const eventStartTime = moment(event.startTime, "HH:mm");
        const eventEndTime = moment(event.endTime, "HH:mm");
        const tasksInRow = events
          .slice()
          .sort((a, b) => {
            const aRowStartIndex = a.rowStartIndex;
            const aRowEndIndex = a.rowEndIndex;
            const aBigIndex = aRowEndIndex - aRowStartIndex;
            const bRowStartIndex = b.rowStartIndex;
            const bRowEndIndex = b.rowEndIndex;
            const bBigIndex = bRowEndIndex - bRowStartIndex;
            return bBigIndex - aBigIndex;
          })
          .filter((task) => {
            const taskStartTime = moment(task.startTime, "HH:mm");
            const taskEndTime = moment(task.endTime, "HH:mm");
            if (
              event.rowStartIndex === task.rowStartIndex ||
              (eventStartTime.isBefore(taskEndTime) &&
                eventEndTime.isAfter(taskStartTime)) ||
              event.rowEndIndex === task.rowStartIndex ||
              event.rowStartIndex === task.rowEndIndex
            ) {
              return true;
            }
          });

        // If there are more than one task in the same row
        // then move the task right
        // If there are more than two tasks in the same row
        // then reduce the width of the task
        // Now figure out which task is this
        const taskIndex = tasksInRow.findIndex((task) => task.id === event.id);
        // If there's more than two tasks in the same row
        // then reduce the width of the task
        // calculate the width based on the number of tasks in the row (devide from 90%)
        if (tasksInRow.length > 2) {
          width = `${90 / tasksInRow.length}%`;
        }

        // Define a function to truncate the task title based on the height
        const truncateTitle = (title: string, maxLength: number) => {
          return title.length > maxLength
            ? `${title.slice(0, maxLength)}...`
            : title;
        };

        // Define the maximum title length based on the height
        const maxTitleLength =
          height === "45px" ? 60 : height === "90px" ? 120 : event.title.length;
        if (!isRefAvailable) return null;
        return (
          <Tooltip key={event.id}>
            <DraggableDayTooltip
              //@ts-ignore
              className={`absolute top-0 z-10 rounded-lg border-2 px-2 py-1 text-[17px] ${event.type === "appointment" ? "text-gray-600" : "text-white"} hover:z-20`}
              style={{
                left: calculateLeftPosition(taskIndex, tasksInRow.length),
                top,
                height,
                backgroundColor,
                maxWidth: width,
                minWidth: width,
              }}
              task={event}
              updateTaskData={{ event, companyUsers }}
              updateAppointmentData={{
                appointment: appointmentsFull.find(
                  (appointment) => appointment.id === event.id,
                ),
                employees: companyUsers,
                customers,
                vehicles,
                orders,
                templates,
                settings,
              }}
            >
              {
                <>
                  {event.type === "appointment" ? (
                    <div className="flex flex-col items-start">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{event.title}</h3>
                        </div>
                        <p className="text-left">
                          Client:{" "}
                          {event.customer &&
                            `${event.customer.firstName} ${event.customer.lastName}`}
                        </p>
                        <p className="text-left">
                          Assigned To:{" "}
                          {event.assignedUsers
                            .slice(0, 1)
                            .map((user: User) => user.name)}
                        </p>
                        <p className="text-left">
                          {moment(event.startTime, "HH:mm").format("hh:mm A")}{" "}
                          To {moment(event.endTime, "HH:mm").format("hh:mm A")}
                        </p>
                      </div>
                      <div className="absolute inset-y-1 right-0 h-[calc(100%-0.5rem)] w-1.5 rounded-lg border bg-[#6571FF]"></div>
                    </div>
                  ) : (
                    <div className="flex h-full justify-start">
                      <h3 className="font-semibold">{event.title}</h3>
                    </div>
                  )}
                </>
              }
            </DraggableDayTooltip>
            <TooltipContent className="w-72 rounded-md border border-slate-400 bg-white p-3">
              {event.type === "appointment" ? (
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{event.title}</h3>

                    <button
                      type="button"
                      className="text- rounded-full bg-[#6571FF] p-2 text-white"
                      onClick={() =>
                        open("UPDATE_APPOINTMENT", {
                          appointment: appointmentsFull.find(
                            (appointment) => appointment.id === event.id,
                          ),
                          employees: companyUsers,
                          customers,
                          vehicles,
                          orders,
                          templates,
                          settings,
                        })
                      }
                    >
                      <FaPen className="mx-auto text-[10px]" />
                    </button>
                  </div>

                  <p>
                    Client:
                    {event.customer &&
                      `${event.customer.firstName} ${event.customer.lastName}`}
                  </p>

                  <p>
                    Assigned To:{" "}
                    {event.assignedUsers
                      .slice(0, 1)
                      .map((user: User) => user.name)}
                  </p>

                  <p>
                    {moment(event.startTime, "HH:mm").format("hh:mm A")} To{" "}
                    {moment(event.endTime, "HH:mm").format("hh:mm A")}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{event.title}</h3>

                    <button
                      type="button"
                      className="text- rounded-full bg-[#6571FF] p-2 text-white"
                      onClick={() =>
                        open("UPDATE_TASK", {
                          task: event,
                          companyUsers,
                        })
                      }
                    >
                      <FaPen className="mx-auto text-[10px]" />
                    </button>
                  </div>

                  {/* @ts-ignore */}
                  <p className="mt-3">{event.description}</p>

                  {/* @ts-ignore */}
                  <p className="mt-3">Task Priority: {event.priority}</p>
                </div>
              )}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
