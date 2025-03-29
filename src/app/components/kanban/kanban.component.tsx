import React from 'react';

const KanbanComponent: React.FC = () => {
  return (
    <div className="kanban-container p-4">
      <h1 className="text-2xl font-bold mb-4">Kanban Board</h1>
      <div className="kanban-board grid grid-cols-3 gap-4">
        <div className="kanban-column bg-gray-100 p-2 rounded">
          <h2 className="text-xl font-semibold">To Do</h2>
          {/* Add tasks here */}
        </div>
        <div className="kanban-column bg-gray-100 p-2 rounded">
          <h2 className="text-xl font-semibold">In Progress</h2>
          {/* Add tasks here */}
        </div>
        <div className="kanban-column bg-gray-100 p-2 rounded">
          <h2 className="text-xl font-semibold">Done</h2>
          {/* Add tasks here */}
        </div>
      </div>
    </div>
  );
};

export { KanbanComponent }; 