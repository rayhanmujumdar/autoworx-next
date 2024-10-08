import Title from "@/components/Title";
import { Metadata } from "next";
import { db } from "@/lib/db";
import { CalendarSettings, User } from "@prisma/client";
import { AuthSession } from "@/types/auth";
import { auth } from "@/app/auth";
import { CalendarType } from "@/types/calendar";
import TaskPage from "./TaskPage";
import { AppointmentFull } from "@/types/db";
import { SyncLists } from "@/components/SyncLists";

export const metadata: Metadata = {
  title: "Task and Activity Management",
};

export default async function Page({ params }: { params: { type: string } }) {
  const session = (await auth()) as AuthSession;
  const companyId = session.user.companyId;

  const calendarAppointments = [];

  // Get all appointments
  const appointments = await db.appointment.findMany({
    where: {
      companyId,
    },
  });

  for (const appointment of appointments) {
    const appointmentUsers = await db.appointmentUser.findMany({
      where: { appointmentId: appointment.id },
    });

    const users = await db.user.findMany({
      where: {
        id: {
          in: appointmentUsers.map((appointmentUser) => appointmentUser.userId),
        },
      },
    });

    const client = appointment.clientId
      ? await db.client.findUnique({
          where: { id: appointment.clientId },
        })
      : null;

    calendarAppointments.push({
      ...appointment,
      assignedUsers: users,
      client,
    });
  }

  // Tasks with assigned users
  // Here we will store both the task and the assigned users
  const taskWithAssignedUsers = [];

  // Get all the tasks for the company
  // where startTime, endTime, and date are not null
  const tasks = await db.task.findMany({
    where: {
      companyId,
    },
  });

  // Loop through all the tasks
  for (const task of tasks) {
    let assignedUsers: User[] = [];

    // Get the assigned users for the task
    const taskUsers = (await db.taskUser.findMany({
      where: {
        taskId: task.id,
      },
    })) as any;

    // Get the user details for the assigned users
    for (const taskUser of taskUsers) {
      const user = (await db.user.findUnique({
        where: {
          id: taskUser.userId,
        },
      })) as User;

      // Add the user to the assigned users array
      assignedUsers.push(user);
    }

    // Add the task and the assigned users to the array
    taskWithAssignedUsers.push({
      ...task,
      assignedUsers,
    });
  }

  // Get all the users for the company
  const companyUsers = await db.user.findMany({
    where: {
      companyId,
    },
  });

  const usersWithTasks = [];

  const users = await db.user.findMany({
    where: {
      companyId,
      role: "employee",
    },
  });

  for (const user of users) {
    const taskUsers = await db.taskUser.findMany({
      where: { userId: user.id },
    });

    const tasks = await db.task.findMany({
      where: {
        id: {
          in: taskUsers.map((taskUser) => taskUser.taskId),
        },
        companyId,
      },
    });

    usersWithTasks.push({
      ...user,
      tasks,
    });
  }

  const customers = await db.client.findMany({
    where: { companyId },
  });

  const vehicles = await db.vehicle.findMany({
    where: { companyId },
  });

  const settings = (await db.calendarSettings.findFirst({
    where: {
      companyId,
    },
  })) as CalendarSettings;

  const emailTemplates = await db.emailTemplate.findMany({
    where: {
      companyId,
    },
  });

  let appointmentsFull: AppointmentFull[] = [];

  for (const appointment of appointments) {
    const client = appointment.clientId
      ? await db.client.findUnique({
          where: { id: appointment.clientId },
        })
      : null;

    const vehicle = appointment.vehicleId
      ? await db.vehicle.findUnique({
          where: { id: appointment.vehicleId },
        })
      : null;

    const confirmationEmailTemplate = appointment.confirmationEmailTemplateId
      ? await db.emailTemplate.findUnique({
          where: { id: appointment.confirmationEmailTemplateId },
        })
      : null;

    const reminderEmailTemplate = appointment.reminderEmailTemplateId
      ? await db.emailTemplate.findUnique({
          where: { id: appointment.reminderEmailTemplateId },
        })
      : null;

    const appointmentUsers = await db.appointmentUser.findMany({
      where: { appointmentId: appointment.id },
    });

    const assignedUsers = await db.user.findMany({
      where: {
        id: {
          in: appointmentUsers.map((appointmentUser) => appointmentUser.userId),
        },
      },
    });

    appointmentsFull.push({
      ...appointment,
      times: appointment.times as string[],
      client,
      vehicle,
      confirmationEmailTemplate: confirmationEmailTemplate as any,
      reminderEmailTemplate: reminderEmailTemplate as any,
      assignedUsers,
    });
  }
  const estimates = await db.invoice.findMany({
    where: {
      type: "Estimate",
    },
  });

  return (
    <>
      <Title>Task and Activity Management</Title>

      <div className="relative flex h-[81vh] gap-4 pt-4">
        <SyncLists
          customers={customers}
          vehicles={vehicles}
          employees={companyUsers}
          templates={emailTemplates}
          estimates={estimates}
        />
        <TaskPage
          type={params.type as CalendarType}
          taskWithAssignedUsers={taskWithAssignedUsers}
          companyUsers={companyUsers}
          usersWithTasks={usersWithTasks}
          tasks={tasks}
          customers={customers}
          vehicles={vehicles}
          settings={settings}
          appointments={calendarAppointments!}
          templates={emailTemplates}
          appointmentsFull={appointmentsFull}
        />
      </div>
    </>
  );
}
