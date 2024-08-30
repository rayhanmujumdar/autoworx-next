/* eslint-disable @next/next/no-img-element */
"use client";
import { User } from "@prisma/client";
import React, { SetStateAction, useState } from "react";
import { IoAddCircleOutline } from "react-icons/io5";
import { PiWechatLogoLight } from "react-icons/pi";
import { CiCalendar } from "react-icons/ci";
import { EmployeeSelector } from "./EmployeeSelector";

import Link from "next/link";
import { Tag } from "@prisma/client";
import { EmployeeTagSelector } from "./EmployeeTagSelector";
import TaskForm from "./TaskForm";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import ServiceSelector from "./ServiceSelector";

//dummy services

const services = [
  {
    id: 1,
    name: "Service 1",
    completed: true,
  },
  {
    id: 2,
    name: "Service 2",
    completed: true,
  },
  {
    id: 3,
    name: "Service 3",
    completed: true,
  },
  {
    id: 4,
    name: "Service 4",
    completed: false,
  },
  {
    id: 5,
    name: "Service 5",
    completed: true,
  },
  {
    id: 6,
    name: "Service 6",
    completed: false,
  },
];

//interfaces
interface Service {
  id: number;
  name: string;
  completed: boolean;
}
interface Employee {
  id: number;
  firstName: string;
  lastName: string;
}
interface pipelinesProps {
  pipelinesTitle: string;
  salesData?: {
    title: string;
    leads: { name: string; email: string; phone: string }[];
  }[];
  shopData?: {
    title: string;
    leads: { name: string; email: string; phone: string }[];
  }[];
}

const users: User[] = [];

export default function Pipelines({
  pipelinesTitle: pipelineType,
  salesData,
  shopData,
}: pipelinesProps) {
  const [selectedEmployees, setSelectedEmployees] = useState<{
    [key: string]: Employee | null;
  }>({});
  const [openDropdownIndex, setOpenDropdownIndex] = useState<{
    category: number;
    index: number;
  } | null>(null);

  // const [tagOpenDropdown, setTagOpenDropdown] = useState(false);
  const [tag, setTag] = useState<Tag>();
  const [tagDropdownStates, setTagDropdownStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [leadTags, setLeadTags] = useState<{ [key: string]: Tag[] }>({});

  // Track selected services per item
  const [selectedServices, setSelectedServices] = useState<{
    [key: string]: Service | null;
  }>({});
  const [showAllServices, setShowAllServices] = useState<{
    [key: string]: boolean;
  }>({});
  const [openServiceDropdown, setOpenServiceDropdown] = useState<{
    [key: string]: boolean;
  }>({});
  const initialData = pipelineType === "Sales Pipelines" ? salesData : shopData;
  const [pipelineData, setPipelineData] = useState(initialData || []);
  const handleDropdownToggle = (categoryIndex: number, leadIndex: number) => {
    if (
      openDropdownIndex?.category === categoryIndex &&
      openDropdownIndex.index === leadIndex
    ) {
      setOpenDropdownIndex(null);
    } else {
      setOpenDropdownIndex({ category: categoryIndex, index: leadIndex });
    }
  };

  const getInitials = (employee: Employee | null) => {
    if (employee) {
      const firstNameInitial = employee.firstName.charAt(0).toUpperCase();
      const lastNameInitial = employee.lastName.charAt(0).toUpperCase();
      return `${firstNameInitial}${lastNameInitial}`;
    }
    return "";
  };

  const createEmployeeSelectHandler =
    (categoryIndex: number, leadIndex: number) =>
    (value: SetStateAction<Employee | null>) => {
      const key = `${categoryIndex}-${leadIndex}`;
      setSelectedEmployees((prevState) => ({
        ...prevState,
        [key]: typeof value === "function" ? value(prevState[key]) : value,
      }));
      setOpenDropdownIndex(null);
    };

  const handleTagDropdownToggle = (
    categoryIndex: number,
    leadIndex: number,
  ) => {
    const key = `${categoryIndex}-${leadIndex}`;
    setTagDropdownStates((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };
  //for tag handling
  const handleTagSelect = (
    categoryIndex: number,
    leadIndex: number,
    selectedTag: Tag | undefined,
  ) => {
    if (selectedTag) {
      const key = `${categoryIndex}-${leadIndex}`;
      setLeadTags((prevState) => {
        const existingTags = prevState[key] || [];
        const tagExists = existingTags.find((tag) => tag.id === selectedTag.id);
        //deleting each tag
        if (tagExists) {
          return {
            ...prevState,
            [key]: existingTags.filter((tag) => tag.id !== selectedTag.id),
          };
        } else {
          return {
            ...prevState,
            [key]: [...existingTags, selectedTag],
          };
        }
      });
    }
  };

  //service

  const handleServiceSelect = (
    categoryIndex: number,
    leadIndex: number,
    service: Service,
  ) => {
    const key = `${categoryIndex}-${leadIndex}`;
    setSelectedServices((prevState) => ({
      ...prevState,
      [key]: service,
    }));
    setShowAllServices((prevState) => ({
      ...prevState,
      [key]: false,
    }));
    setOpenServiceDropdown((prevState) => ({
      ...prevState,
      [key]: false, // Close dropdown after selection
    }));
  };

  const handleServiceDropdownToggle = (
    categoryIndex: number,
    leadIndex: number,
  ) => {
    const key = `${categoryIndex}-${leadIndex}`;
    setOpenServiceDropdown((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  const handleDragEnd = (result: any) => {
    const { destination, source } = result;

    if (!destination) return;

    const sourceColumn = pipelineData[source.droppableId];
    const destinationColumn = pipelineData[destination.droppableId];

    const sourceItems = [...sourceColumn.leads];
    const destinationItems = [...destinationColumn.leads];

    const [removed] = sourceItems.splice(source.index, 1);
    destinationItems.splice(destination.index, 0, removed);

    const updatedData = pipelineData.map((column, index) => {
      if (index === parseInt(source.droppableId)) {
        return { ...column, leads: sourceItems };
      } else if (index === parseInt(destination.droppableId)) {
        return { ...column, leads: destinationItems };
      }
      return column;
    });

    setPipelineData(updatedData);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="h-full overflow-hidden">
        <div className="flex justify-between">
          {pipelineData.map((item, categoryIndex) => (
            <Droppable droppableId={`${categoryIndex}`} key={categoryIndex}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="w-[16%] rounded-md border"
                  style={{
                    backgroundColor: "rgba(101, 113, 255, 0.15)",
                    padding: "0",
                  }}
                >
                  <h2 className="rounded-lg bg-[#6571FF] px-4 py-3 text-center text-white">
                    <p className="text-base font-bold">{item.title}</p>
                  </h2>

                  <ul
                    className="mt-3 flex flex-col gap-1 overflow-auto p-1"
                    style={{ maxHeight: "70vh" }}
                  >
                    {item.leads.map((lead, leadIndex) => {
                      const key = `${categoryIndex}-${leadIndex}`;
                      const selectedEmployee = selectedEmployees[key];
                      const isDropdownOpen =
                        openDropdownIndex?.category === categoryIndex &&
                        openDropdownIndex.index === leadIndex;

                      const isTagDropdownOpen = tagDropdownStates[key];
                      const tagsForLead = leadTags[key] || [];

                      const selectedService = selectedServices[key];

                      const isServiceDropdownOpen =
                        openServiceDropdown[key] || false;

                      return (
                        <Draggable
                          key={leadIndex}
                          draggableId={`${categoryIndex}-${leadIndex}`}
                          index={leadIndex}
                        >
                          {(provided) => (
                            <li
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              ref={provided.innerRef}
                              key={leadIndex}
                              className="relative mx-1 my-1 rounded-xl border bg-white p-1"
                            >
                              <div className="flex items-center justify-between">
                                <h3 className="font-inter overflow-auto pb-2 font-semibold text-black">
                                  {lead.name}
                                </h3>
                                {!isDropdownOpen && (
                                  <div
                                    role="button"
                                    onClick={() =>
                                      handleDropdownToggle(
                                        categoryIndex,
                                        leadIndex,
                                      )
                                    }
                                  >
                                    {selectedEmployee ? (
                                      <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-600 bg-white text-xs text-black">
                                        {getInitials(selectedEmployee)}
                                      </div>
                                    ) : (
                                      <IoAddCircleOutline size={26} />
                                    )}
                                  </div>
                                )}
                                {isDropdownOpen && (
                                  <div className="absolute right-0 top-8 z-10">
                                    <EmployeeSelector
                                      name="employeeId"
                                      value={selectedEmployee}
                                      setValue={createEmployeeSelectHandler(
                                        categoryIndex,
                                        leadIndex,
                                      )}
                                      openDropdown={true}
                                      setOpenDropdown={() =>
                                        setOpenDropdownIndex(null)
                                      }
                                    />
                                  </div>
                                )}
                              </div>

                              <div className="mb-1 flex items-center">
                                {tagsForLead.slice(0, 2).map((tag) => (
                                  <span
                                    key={tag.id}
                                    className="mr-2 inline-flex h-[20px] items-center rounded bg-gray-300 px-1 py-1 text-xs font-semibold text-white"
                                    style={{
                                      backgroundColor: tag?.bgColor,
                                    }}
                                  >
                                    {tag.name}
                                    <div
                                      className="ml-1 text-xs text-white"
                                      onClick={() =>
                                        handleTagSelect(
                                          categoryIndex,
                                          leadIndex,
                                          tag,
                                        )
                                      }
                                    >
                                      ✕
                                    </div>
                                  </span>
                                ))}
                                
                                  <button
                                    onClick={() =>
                                      handleTagDropdownToggle(
                                        categoryIndex,
                                        leadIndex,
                                      )
                                    }
                                    className="inline-flex h-[20px] items-center justify-center rounded bg-[#6571FF] px-1 py-1 text-xs font-semibold text-white"
                                  >
                                    + Add
                                  </button>

                                  
                               
                              </div>
                              {isTagDropdownOpen && (
                                <div className="-left-100 absolute top-12 z-20">
                                  <EmployeeTagSelector
                                    value={tag}
                                    setValue={(selectedTag) =>
                                      handleTagSelect(
                                        categoryIndex,
                                        leadIndex,
                                        selectedTag,
                                      )
                                    }
                                    open={isTagDropdownOpen}
                                    setOpen={() =>
                                      handleTagDropdownToggle(
                                        categoryIndex,
                                        leadIndex,
                                      )
                                    }
                                  />
                                </div>
                              )}
                              <div>
                                <p className="mb-2 overflow-auto text-xs">
                                  Vehicle Year Make Model
                                </p>
                              </div>
                              {/* service code */}
                              <ServiceSelector
                                services={services}
                                selectedService={selectedService}
                                isServiceDropdownOpen={isServiceDropdownOpen}
                                handleServiceDropdownToggle={() =>
                                  handleServiceDropdownToggle(
                                    categoryIndex,
                                    leadIndex,
                                  )
                                }
                                handleServiceSelect={(service) =>
                                  handleServiceSelect(
                                    categoryIndex,
                                    leadIndex,
                                    service,
                                  )
                                }
                                type={pipelineType}
                              />
                              <div>
                                <p className="overflow-auto pb-2 text-xs">
                                  Lead Source
                                </p>
                              </div>
                              <div className="flex justify-between">
                                <div className="flex items-center gap-2">
                                  <Link href="/" className="group relative">
                                    <PiWechatLogoLight size={18} />
                                    <span className="absolute bottom-full left-1/2 mb-2 -translate-x-1/4 transform rounded bg-[#66738C] px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                      Communications
                                    </span>
                                  </Link>
                                  <Link href="/" className="group relative">
                                    <img
                                      src="/icons/invoice.png"
                                      alt=""
                                      width={12}
                                      height={12}
                                      style={{ marginBottom: "0px" }}
                                    />
                                    <span className="-translate-x-1/5 absolute bottom-full left-1/2 mb-2 w-auto transform whitespace-nowrap rounded bg-[#66738C] px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                      Create Draft Estimate
                                    </span>
                                  </Link>
                                  <Link href="/" className="group relative">
                                    <CiCalendar size={18} />
                                    <span className="translate-x-1/6 absolute bottom-full left-1/2 mb-2 transform whitespace-nowrap rounded bg-[#66738C] px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                      Create Appointment
                                    </span>
                                  </Link>
                                </div>
                                <div className="relative group">

                                <TaskForm companyUsers={users} />
                                
                                </div>
                              </div>
                            </li>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </ul>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </div>
    </DragDropContext>
  );
}