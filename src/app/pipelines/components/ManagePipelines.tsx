import React, { useState } from "react";
import Draggable from "react-draggable";
import { IoReorderThreeOutline } from "react-icons/io5";

interface Column {
  id: string;
  name: string;
}

interface ManagePipelinesModalProps {
  columns: Column[];
  onSave: (updatedColumns: Column[]) => void;
  onClose: () => void;
}

export default function ManagePipelines({
  columns,
  onSave,
  onClose,
}: ManagePipelinesModalProps) {
  const [localColumns, setLocalColumns] = useState<Column[]>(columns);

  const handleColumnChange = (index: number, newName: string) => {
    const updatedColumns = [...localColumns];
    updatedColumns[index].name = newName;
    setLocalColumns(updatedColumns);
  };

  const handleDrag = (e: any, data: any) => {
    const dragIndex = parseInt(data.node.dataset.index, 10);
    const hoverIndex = Math.round(data.y / 50); // Assuming each item has a height of about 50px
    const updatedColumns = [...localColumns];

    if (hoverIndex >= 0 && hoverIndex < updatedColumns.length) {
      const [draggedColumn] = updatedColumns.splice(dragIndex, 1);
      updatedColumns.splice(hoverIndex, 0, draggedColumn);
      setLocalColumns(updatedColumns);
    }
  };

  const handleAddColumn = () => {
    const newColumn = { id: `column-${Date.now()}`, name: "New Column" };
    setLocalColumns([...localColumns, newColumn]);
  };

  const handleSave = () => {
    onSave(localColumns);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg p-6 w-80">
        <h2 className="text-lg font-semibold mb-4">Edit Pipeline</h2>
        <div>
          {localColumns.map((column, index) => (
            <Draggable
              key={column.id}
              axis="y"
              position={{ x: 0, y: 0 }}
              onStop={handleDrag}
            >
              <div
                data-index={index}
                className="flex items-center mb-2 bg-gray-100 p-2 rounded-md cursor-move"
              >
                <IoReorderThreeOutline className="mr-2 text-gray-600" size={20} />
                <input
                  type="text"
                  value={column.name}
                  onChange={(e) => handleColumnChange(index, e.target.value)}
                  className="border border-gray-300 rounded-md p-1 flex-grow"
                />
              </div>
            </Draggable>
          ))}
          <button onClick={handleAddColumn} className="text-blue-500 text-sm mt-2">
            + Add New Column
          </button>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="mr-2 px-4 py-2 bg-gray-200 rounded-md">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded-md">
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
