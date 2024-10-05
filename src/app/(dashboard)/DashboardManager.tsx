"use client";
import Title from "@/components/Title";
import { usePopupStore } from "@/stores/popup";
import { Task as TaskType, User } from "@prisma/client";
import moment from "moment";
import Link from "next/link";
import { FaExternalLinkAlt } from "react-icons/fa";
import NewTask from "../task/[type]/components/task/NewTask";
import AppointmentDetails from "./AppointmentDetails";
import ChartData from "./ChartData";
import EmployeeLeaveRequest from "./EmployeeLeaveRequest";
import Task from "./Task";

const DashboardManager = ({
  tasks,
  companyUsers,
  appointments,
}: {
  tasks: TaskType[];
  companyUsers: User[];
  appointments: any;
}) => {
  const { open } = usePopupStore();

  return (
    <div className="p-8">
      <Title>Dashboard</Title>
      <div className="flex items-start gap-x-2 2xl:gap-x-8">
        {/* col 1 */}
        <div className="w-[20%] space-y-12">
          {/* sales pipeline */}
          <div className="rounded-md p-4 shadow-lg 2xl:p-8">
            <div className="mb-8 flex items-center justify-between">
              <span className="text-2xl font-bold 2xl:text-3xl">
                Sales Pipeline
              </span>{" "}
              <span>
                <FaExternalLinkAlt />
              </span>
            </div>
            <div className="#px-4">
              <ChartData
                heading="Leads coming in"
                subHeading="/month"
                number={567}
              />
              <ChartData heading="Leads Converted" number={767} />
              <ChartData
                heading="Conversion Rate"
                subHeading="Leads Converted/Total Leads"
                number={435}
              />
            </div>
          </div>
          {/* Shop pipeline */}
          <div className="rounded-md p-4 shadow-lg 2xl:p-8">
            <div className="mb-8 flex items-center justify-between">
              <span className="text-2xl font-bold 2xl:text-3xl">
                Shop Pipeline
              </span>{" "}
              <span>
                <FaExternalLinkAlt />
              </span>
            </div>
            <div className="#px-4">
              <ChartData
                heading="Leads coming in"
                subHeading="/month"
                number={567}
              />
              <ChartData heading="Leads Converted" number={767} />
              <ChartData
                heading="Conversion Rate"
                subHeading="Leads Converted/Total Leads"
                number={435}
              />
            </div>
          </div>
        </div>
        {/* col 2 */}
        <div className="w-[20%] space-y-12">
          {/* task list */}
          <div className="rounded-md p-4 shadow-lg 2xl:p-8">
            <div className="mb-8 flex items-center justify-between">
              <span className="text-2xl font-bold 2xl:text-3xl">Task List</span>{" "}
              <Link href="/task/day">
                <FaExternalLinkAlt />
              </Link>
            </div>
            <div className="space-y-2">
              {tasks.map((task, idx) => (
                <Task key={idx} task={task} companyUsers={companyUsers} />
              ))}
              <div className="mt-4 w-20 rounded-full">
                <NewTask companyUsers={companyUsers} />
              </div>
            </div>
          </div>
        </div>

        {/* col 3 */}
        <div className="w-[20%] space-y-12">
          {/* appointments */}
          <div className="rounded-md p-4 shadow-lg 2xl:p-8">
            <div className="mb-8 flex items-center justify-between">
              <span className="text-2xl font-bold 2xl:text-3xl">
                Appointments
              </span>{" "}
              <span>
                <FaExternalLinkAlt />
              </span>
            </div>
            <div className="space-y-4">
              {appointments.map((appointment: any, idx: any) => (
                <AppointmentDetails appointment={appointment} key={idx} />
              ))}
            </div>
          </div>
        </div>
        {/* col 4*/}
        <div className="w-[40%] space-y-12">
          <div className="flex items-start gap-4">
            {/* Revenue */}
            <div className="w-1/2 rounded-md p-4 shadow-lg 2xl:p-8">
              <div className="mb-8 flex items-center justify-between">
                <span className="text-2xl font-bold 2xl:text-3xl">Revenue</span>{" "}
                <span>
                  <FaExternalLinkAlt />
                </span>
              </div>
              <div className="#px-4">
                <ChartData
                  heading="Current Value"
                  number={567}
                  dollarSign={true}
                />
                <ChartData
                  heading="Current Monthly Total"
                  number={767}
                  dollarSign={true}
                />
              </div>
            </div>
            {/* Inventory */}
            <div className="w-1/2 rounded-md p-4 shadow-lg 2xl:p-8">
              <div className="mb-8 flex items-center justify-between">
                <span className="text-2xl font-bold 2xl:text-3xl">
                  Inventory
                </span>{" "}
                <span>
                  <FaExternalLinkAlt />
                </span>
              </div>
              <div className="#px-4">
                <ChartData
                  heading="Current Value"
                  number={567}
                  dollarSign={true}
                />
                <ChartData
                  heading="Current Monthly Total"
                  number={767}
                  dollarSign={true}
                />
              </div>
            </div>
          </div>
          {/* Employee Payout */}
          <div className="rounded-md p-4 shadow-lg 2xl:p-8">
            <div className="mb-8 flex items-center justify-between">
              <span className="text-2xl font-bold 2xl:text-3xl">
                Employee Payout
              </span>{" "}
              <span>
                <FaExternalLinkAlt />
              </span>
            </div>
            <div className="#px-4">
              <ChartData
                heading="Previous Month Payout"
                number={567}
                dollarSign
              />
              <ChartData
                heading="Current Month Payout"
                number={767}
                dollarSign
              />
              <ChartData heading="YTD Payout" number={435} dollarSign />
            </div>
          </div>
          {/* employee leave request */}
          <div className="rounded-md p-4 shadow-lg 2xl:p-8">
            <div className="mb-8 flex items-center justify-between">
              <span className="text-2xl font-bold 2xl:text-3xl">
                Employee Leave Request
              </span>{" "}
              <span>
                <FaExternalLinkAlt />
              </span>
            </div>
            <div className="space-y-4">
              <EmployeeLeaveRequest />
              <EmployeeLeaveRequest />
              <EmployeeLeaveRequest />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



export default DashboardManager;
