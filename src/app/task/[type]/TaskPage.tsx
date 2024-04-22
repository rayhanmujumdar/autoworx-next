"use client";

import Calendar from "./Calendar/Calendar";
import CalendarUser from "./Users/CalendarUser";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Task, User } from "@prisma/client";
import { CalendarType } from "@/types/calendar";
import { CalendarTask } from "@/types/db";

export default function TaskPage({
  type,
  taskWithAssignedUsers,
  companyUsers,
  usersWithTasks,
  tasks,
}: {
  type: CalendarType;
  taskWithAssignedUsers: (Task & { assignedUsers: User[] })[];
  companyUsers: User[];
  usersWithTasks: any; // TODO: Fix this type
  tasks: Task[];
}) {
  // Filter the tasks where startTime, endTime, and date are not null
  const calendarTasks = taskWithAssignedUsers.filter(
    (task) => task.startTime && task.endTime && task.date,
  );
  // Filter the tasks without startTime, endTime, and date
  const tasksWithoutTime = taskWithAssignedUsers.filter(
    (task) => !task.startTime && !task.endTime && !task.date,
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <Calendar
        type={type}
        tasks={calendarTasks as any}
        tasksWithoutTime={tasksWithoutTime}
        companyUsers={companyUsers}
      />
      <CalendarUser usersWithTasks={usersWithTasks} tasks={tasks} />
    </DndProvider>
  );
}
