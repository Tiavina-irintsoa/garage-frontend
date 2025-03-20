import { Component } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

interface Appointment {
  id: number;
  client: string;
  car: string;
  serviceType: string;
  status: 'todo' | 'in-progress' | 'done';
  description?: string;
  photos?: string[];
  tickets?: string[];
  assignees?: string[];
  parts?: { name: string; model: string; quantity: number }[];
}

@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.css'],
})
export class KanbanComponent {
  appointments: Appointment[] = [
    {
      id: 1,
      client: 'John Doe',
      car: 'Toyota Camry',
      serviceType: 'Oil Change',
      status: 'todo',
    },
    {
      id: 2,
      client: 'Jane Smith',
      car: 'Honda Accord',
      serviceType: 'Brake Inspection',
      status: 'in-progress',
    },
    {
      id: 3,
      client: 'Alice Johnson',
      car: 'Ford Focus',
      serviceType: 'Tire Rotation',
      status: 'done',
    },
  ];  

  drop(event: CdkDragDrop<Appointment[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      // Update the status of the appointment based on the new container
      const appointment = event.container.data[event.currentIndex];
      appointment.status = event.container.id as 'todo' | 'in-progress' | 'done';
    }
  }
} 