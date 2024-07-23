import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CdkDragEnter, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ApiService } from '../../services/api.service';
import { format, isToday, isTomorrow, isThisWeek, addDays, differenceInCalendarDays, formatDistanceToNow, parseISO, compareAsc, isPast  } from 'date-fns';
import Modal from 'bootstrap/js/dist/modal';
import { AuthService } from '../../services/auth.service';
import { DateService } from '../../services/date.service';


interface Task {
  id: number;
  title: string;
  status: string;
  description: string;
  due_date: string;
  user_id: number;
  order?: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DragDropModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  @ViewChild('closeModalButton') closeModalButton!: ElementRef;

  @ViewChild('closeEditButton') closeEditButton!: ElementRef;


  @ViewChild('editTaskModal') editTaskModal!: ElementRef;


  currentContainer: string = '';

  username: any[] = [];
  taskForm: FormGroup;
  userId: number = 0;
  donetable: any;
  inProgress: any;
  todoTable: any;
  donelength: number = 0;
  todoLength: number = 0;
  ipr: number = 0;
  curentTaskId: number = 0;
  selectedTasks: Set<number> = new Set<number>();
  currentDate: string = '';
  nearestDeadlineTask: Task | null = null;
  totalTasks: Task[] = [];



  constructor(private taskService: ApiService, private fb: FormBuilder, private cdr: ChangeDetectorRef, private auth: AuthService, private date: DateService) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      status: ['', Validators.required],
      description: ['', Validators.required],
      due_date: ['', Validators.required]
    });
  }
  

  ngOnInit(): void {
    this.auth.getCurrentUser().subscribe(user => {
      if (user) {
        this.userId = user.id;
        this.retrieveUsername(this.userId);
        console.log('User ID:', this.userId);
      } else {
        console.log('No user logged in.');
      }
    });
  
    this.retrieveLahat();
    this.updateDate();
  }

  retrieveLahat(){
    this.retrieveDone();
    this.retrieveInProgress();
    this.retrieveTodo();
    this.retrieveMoNga();
    this.getDoneLength();
    this.getToDolenght();
    this.getinProgress();

  }

  retrieveUsername(userId: number) {
    this.taskService.username(userId).subscribe((resp: any) => {
  
      if (resp.data && resp.data.length > 0) {
        this.username = resp.data[0].name;
        console.log('Your username:', this.username);
      } else {
        console.error('No username found for the given user ID');
      }
    }, (error) => {
      console.error('Error fetching username', error);
    });
  }
  
  
  


  retrieveMoNga() {
    this.taskService.getTasks().subscribe((resp: any) => {
      const currentUserId = this.userId;
      this.totalTasks = resp.data.filter((task: Task) => task.user_id === currentUserId);

      const pendingTasks = this.totalTasks.filter(task => task.status !== 'done');
      console.log('Pending tasks:', pendingTasks);
  
      if (pendingTasks.length > 0) {
        let nearestDeadlineTask = pendingTasks[0];
        let nearestDeadlineDate = parseISO(nearestDeadlineTask.due_date);
  
        pendingTasks.forEach(task => {
          const taskDueDate = parseISO(task.due_date);
          if (compareAsc(taskDueDate, nearestDeadlineDate) < 0) {
            nearestDeadlineTask = task;
            nearestDeadlineDate = taskDueDate;
          }
        });
  
        this.nearestDeadlineTask = nearestDeadlineTask;
        console.log('Task nearest to the deadline:', this.nearestDeadlineTask);
      } else {
        this.nearestDeadlineTask = null; 
        console.log('No pending tasks found.');
      }
    }, (error) => {
      console.error('Error fetching tasks', error);
    });
  }
  
  retrieveDone() {
    const currentUserId = this.userId;
    this.taskService.getStatus('done').subscribe(
        (resp: any) => {
            let tasks = resp.data.filter((task: Task) => task.user_id === currentUserId);
            tasks = this.sortTasksByOrder(tasks);
            this.donetable = tasks;
            console.log('You are done with your task:', this.donetable);
            this.getDoneLength();
        },
        (error: any) => {
            if (error.status === 404) {
                this.donetable = [];
                this.getDoneLength();
                console.log('No Done tasks found.');
            } else {
                console.error('Error fetching Done tasks', error);
            }
        }
    );
}

retrieveInProgress() {
  const currentUserId = this.userId;
  this.taskService.getStatus('inprogress').subscribe(
      (resp: any) => {
          let tasks = resp.data.filter((task: Task) => task.user_id === currentUserId);
          tasks = this.sortTasksByOrder(tasks);
          this.inProgress = tasks;
          console.log('In Progress tasks:', this.inProgress);
          this.getinProgress();
      },
      (error: any) => {
          if (error.status === 404) {
              this.inProgress = [];
              this.getinProgress();
              console.log('No In Progress tasks found.');
          } else {
              console.error('Error fetching In Progress tasks', error);
          }
      }
  );
}

retrieveTodo() {
  const currentUserId = this.userId;
  this.taskService.getStatus('todo').subscribe(
      (resp: any) => {
          let tasks = resp.data.filter((task: Task) => task.user_id === currentUserId);
          tasks = this.sortTasksByOrder(tasks);
          this.todoTable = tasks;
          console.log('Todo tasks:', this.todoTable);
          this.getToDolenght();
      },
      (error: any) => {
          if (error.status === 404) {
              this.todoTable = [];
              this.getToDolenght();
              console.log('No Todo tasks found.');
          } else {
              console.error('Error fetching Todo tasks', error);
          }
      }
  );
}
  
  sortTasksByOrder(tasks: Task[]): Task[] {
    return tasks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }


  getDoneLength(){
    this.donelength = this.donetable?.length;
    console.log('this is the length of done tasks', this.donelength);
    return this.donelength;
  }

  getinProgress(){
    this.ipr = this.inProgress?.length;
    console.log('this is the length of done tasks', this.donelength);
    return this.ipr;
  }

  getToDolenght(){
    this.todoLength = this.todoTable?.length;
    console.log('this is the length of done tasks', this.donelength);
    return this.donelength;
  }

  sortTasksByDueDate(tasks: Task[]): Task[] {
    return tasks.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  }
  


  deleteTask(id: number) {
    const confirmation = confirm('Are you sure you want to delete this task?');
    if (confirmation) {
      this.taskService.deleteTask(id).subscribe(
        (resp: any) => {
          console.log('Task deleted successfully', resp);
          this.retrieveDone();
          this.retrieveTodo();
          this.retrieveInProgress();
          this.retrieveMoNga();
        },
        (error: any) => {
          console.error('Error deleting task', error);
        }
      );
    }
  }

  deleteSelectedTasks() {
    const confirmation = confirm('Are you sure you want to delete the selected tasks?');
    if (confirmation) {
      this.selectedTasks.forEach(taskId => {
        this.taskService.deleteTask(taskId).subscribe(
          (resp: any) => {
            this.retrieveDone();
            this.retrieveTodo();
            this.retrieveInProgress();
          },
          (error: any) => {
            console.error('Error deleting task', error);
          }
        );
      });
      this.selectedTasks.clear();
    }
  }



  editTask(id: number) {
    this.curentTaskId = id;
    this.retrieveOneTask(id);
    const modal = new Modal(this.editTaskModal.nativeElement);
    modal.show();
}


  updateTask() {
    if (this.curentTaskId !== 0 && this.taskForm.valid) {
      const updatedTask = {
        title: this.taskForm.value.title,
        status: this.taskForm.value.status,
        description: this.taskForm.value.description,
        due_date: this.taskForm.value.due_date
      };

      this.taskService.editTask(this.curentTaskId, updatedTask).subscribe(
        (resp: any) => {
          console.log('Task updated successfully', resp);
          this.retrieveDone();
          this.retrieveInProgress();
          this.retrieveTodo();
          this.curentTaskId = 0;
          this.closeEdit();
          this.retrieveMoNga();
        },
        (error: any) => {
          console.error('Error updating task', error);
        }
      );
    }
  }

  retrieveOneTask(id: number) {
    this.taskService.getOneTask(id).subscribe((resp: any) => {
      this.taskForm.patchValue(resp.data);

      if(resp && resp.data) {
        this.taskForm.patchValue({
          title: resp.data.title,
          description: resp.data.description,
          status: resp.data.status,
          due_date: resp.data.due_date
        })
      }

    });
  }


  drop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer.id === event.container.id) {
      console.log('Moving item within the same container');
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.saveOrder(event.container.id, event.container.data);
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      console.log(`Moving task ${task.id} to new container with ID ${event.container.id}`);
  
      let newStatus: string;
  
      switch (event.container.id) {
        case 'todo':
          newStatus = 'todo';
          break;
        case 'inprogress':
          newStatus = 'inprogress';
          break;
        case 'done':
          newStatus = 'done';
          break;
        default:
          console.error('Unknown container ID', event.container.id);
          return;
      }
  
      this.taskService.updateStatus(task.id, newStatus).subscribe(
        () => {
          console.log('Task status updated successfully on drop');
          task.status = newStatus;
          transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
          this.saveOrder(event.previousContainer.id, event.previousContainer.data);
          this.saveOrder(event.container.id, event.container.data);
          this.retrieveMoNga();
          this.updateContainerStatus();
          this.cdr.detectChanges();
        },
        error => {
          console.error('Error updating task status on drop', error);
        }
      );
    }
  }
  

  saveOrder(status: string, tasks: Task[]): void {
    localStorage.setItem(status, JSON.stringify(tasks.map((task, index) => ({ ...task, order: index }))));
    const updatedTasks = tasks.map((task, index) => ({
      ...task,
      order: index,
    }));
    this.taskService.updateTaskOrder(updatedTasks).subscribe(
      () => {
        console.log('Task order updated successfully');
      },
      (error) => {
        console.error('Error updating task order', error);
      }
    );
  }
  
  
  retrieveOrder(status: string): Task[] {
    const tasks = localStorage.getItem(status);
    return tasks ? JSON.parse(tasks) : [];
  }
  
  applyStoredOrder(tasks: Task[], storedOrder: Task[]): Task[] {
    const taskMap = new Map(tasks.map(task => [task.id, task]));
    return storedOrder.map(storedTask => taskMap.get(storedTask.id) || storedTask);
  }
  
  
  
  addTask() {
    if (this.taskForm.valid) {
      const newTask = {
        title: this.taskForm.get('title')?.value,
        status: this.taskForm.get('status')?.value,
        description: this.taskForm.get('description')?.value,
        due_date: this.taskForm.get('due_date')?.value
      };

      console.log('New Task:', newTask);
      console.log('User ID:', this.userId);

      this.taskService.addTask(this.userId, newTask).subscribe(response => {
        console.log('Task added successfully', response);
        this.retrieveDone();
        this.retrieveInProgress();
        this.retrieveTodo();
        this.taskForm.reset();
        this.closeModal();
        this.cdr.detectChanges();
        this.retrieveMoNga();
      }, error => {
        console.error('Error adding task', error);
      });
    }
  }

  closeModal() {
    this.closeModalButton.nativeElement.click();
  }

  closeEdit() {
    this.closeEditButton.nativeElement.click();
  }

  formatDueDate(dueDate: string, status: string): { formattedDate: string, color: string } {
    const date = new Date(dueDate);
    const now = new Date();
    let formattedDate = '';
    let color = '';
  
    if (status !== 'done' && isPast(date) && !isToday(date)) {
      const daysOverdue = differenceInCalendarDays(now, date);
      formattedDate = daysOverdue > 1 ? `Overdue ${daysOverdue} days` : `Overdue ${daysOverdue} day`;
      color = '#c33c3c';
      // color = '#c06050';

    } else if (isToday(date)) {
      formattedDate = 'Due today';
      color = '#ffcc66';
    } else if (isTomorrow(date)) {
      formattedDate = 'Due tomorrow';
      color = '#ffa500';
    } else if (isThisWeek(date)) {
      formattedDate = `Due this week (${format(date, 'EEEE')})`;
      color = '#4682b4';
    } else {
      formattedDate = `Due in ${formatDistanceToNow(date, { addSuffix: true })}`;
      color = '#6495ed';
    }
  
    return { formattedDate, color };
  }

  updateDate(): void {
    this.currentDate = this.date.getCurrentDate();
  }

  moveSelectedTasks(newStatus: string) {
    const tasksToMove = Array.from(this.selectedTasks);

    tasksToMove.forEach(taskId => {
        this.taskService.updateStatus(taskId, newStatus).subscribe(
            () => {
                console.log(`Task ${taskId} status updated to ${newStatus}`);
                this.selectedTasks.delete(taskId);

                this.moveTaskLocally(taskId, newStatus);


                this.cdr.detectChanges();
                this.retrieveMoNga();
            },
            (error) => {
                console.error('Error updating task status', error);
            }
        );
    });
}

toggleSelection(taskId: number, container: string) {
    this.currentContainer = container;
    if (this.selectedTasks.has(taskId)) {
        this.selectedTasks.delete(taskId);
    } else {
        this.selectedTasks.add(taskId);
    }
}

private moveTaskLocally(taskId: number, newStatus: string) {
    let task: Task | undefined;

    switch (this.currentContainer) {
        case 'todo':
            task = this.removeFromList(this.todoTable, taskId);
            break;
        case 'inprogress':
            task = this.removeFromList(this.inProgress, taskId);
            break;
        case 'done':
            task = this.removeFromList(this.donetable, taskId);
            break;
    }

    if (task) {
        task.status = newStatus;
        switch (newStatus) {
            case 'todo':
                this.todoTable.push(task);
                break;
            case 'inprogress':
                this.inProgress.push(task);
                break;
            case 'done':
                this.donetable.push(task);
                break;
        }
    }
    this.updateContainerStatus();
}

private removeFromList(list: Task[], taskId: number): Task | undefined {
    const index = list.findIndex(task => task.id === taskId);
    if (index !== -1) {
        return list.splice(index, 1)[0];
    }
    return undefined;
}

private updateContainerStatus() {
    this.todoLength = this.todoTable.length;
    this.ipr = this.inProgress.length;
    this.donelength = this.donetable.length;
    this.cdr.detectChanges();
}



  logout(){
    this.auth.logout();
  }
  


  
}