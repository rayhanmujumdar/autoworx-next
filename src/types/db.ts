// NOTE: these properties are optional for prisma's select statement. But they aren't optional in the db.

import { User, TaskType as PrismaTaskType } from "@prisma/client";

export interface UserType {
  id?: string;
  name?: string;
  country?: string;
  email?: string;
  createdAt?: Date;
}

export interface EmployeeType {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  employee_type: "Salary" | "Hourly" | "Contract Based";
  employee_department: "Sales" | "Management" | "Workshop";
}

export interface InvoiceType {}

export interface CustomerType {
  id?: number;
  name: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  created_at?: string;
}

export interface VehicleType {
  make: string;
  model: string;
  year: string;
  vin: string;
  license: string;
}

export interface ServiceType {
  id: number;
  name: string;
  price: number;
  description: string;
  quantity: number;
  discount: number;
  total: number;
}

export interface Pricing {
  subtotal: number;
  discount: number;
  tax: number;
  grand_total: number;
  deposit: number;
  due: number;
}

export interface AdditionalInfo {
  notes: string;
  terms: string;
}

export type Status =
  | "Delivered"
  | "Consultations"
  | "Confirmed"
  | "In Progress"
  | "Follow Up"
  | "Scheduled"
  | "Pending"
  | "No show"
  | "Cancelled";

export interface Payment {
  tnx?: string;
  method: "Cash" | "Card" | "Zelle";
  date?: Date;
  name?: string;
  email?: string;
  mobile?: string;
  type?: "Payment" | "Deposit" | "Refund"; // ??
  address?: string;
  note?: string;
  amount: number;
  status?: "Success"; // ??
}

export interface TaskType {
  id?: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "task" | "appointment" | "event";
  assignedUsers: number[];
}

export interface CalendarTask {
  id: number;
  userId: number;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: PrismaTaskType;
  companyId: number;
  assignedUsers: User[];
}
