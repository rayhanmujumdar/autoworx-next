import React, { useState } from "react";
import ManagePipelines from "./components/ManagePipelines";

interface HeaderProps {
  activeView: string;
  onToggleView: (view: string) => void;
}



export default function Header({ activeView, onToggleView }: HeaderProps) {

const [isPipelineManaged, setPipelineManaged] = useState(false);
  const [columns, setColumns] = useState([
    { id: "1", name: "New Leads" },
    { id: "2", name: "Leads Generated" },
    { id: "3", name: "Follow-up" },
    { id: "4", name: "Estimated Created" },
    { id: "5", name: "Archived" },
    { id: "6", name: "Converted" },
  ]);
 const handleSaveColumns = (updatedColumns:{id:string,name:string}[]) => {
    setColumns(updatedColumns);
 }
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center">
        <h1 className="mr-4 text-2xl font-bold text-gray-600">Sales Pipelines</h1>
        <div className="flex">
          <button
            onClick={() => onToggleView("workOrders")}
            className={`mr-2 rounded border px-4 py-2 ${activeView === "workOrders" ? "bg-[#6571FF] text-white" : "border-[#6571FF] bg-white text-[#6571FF]"}`}
          >
            Work Orders
          </button>
          <button
            onClick={() => onToggleView("pipelines")}
            className={`rounded border px-4 py-2 ${activeView === "pipelines" ? "bg-[#6571FF] text-white" : "border-[#6571FF] bg-white text-[#6571FF]"}`}
          >
            Pipelines
          </button>
        </div>
      </div>

      {/* Conditionally rendering the "Manage Pipelines" button */}
      {activeView === "pipelines" && (
        <div>
          <button
            onClick={() => {setPipelineManaged(true)}}
            className={`rounded border px-4 py-2  bg-[#6571FF] text-white"  text-white`}
          >
            Manage Pipelines
          </button>
        </div>
      )}

      {isPipelineManaged&&
      <ManagePipelines 
      columns={columns} 
      onSave={handleSaveColumns} 
      onClose={() => setPipelineManaged(false)}/>
      }
    </div>
  );
}
