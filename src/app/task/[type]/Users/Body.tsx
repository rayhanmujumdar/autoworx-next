"use client";

import { useCalendarUserTypeStore } from "../../../../stores/calendarUserType";
import Users from "./Users";
import { Task } from "@prisma/client";
import Tasks from "./Tasks";

export default function Body({
  usersWithTasks,
  tasks,
}: {
  usersWithTasks: any;
  tasks: Task[];
}) {
  const { calendarUserType } = useCalendarUserTypeStore();

  if (calendarUserType === "USERS")
    return <Users users={usersWithTasks} tasks={tasks} />;
  if (calendarUserType === "TASKS")
    return <Tasks tasks={tasks} users={usersWithTasks} />;
}
