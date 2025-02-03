import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from '../../services/api.service';
import { Group } from '../../interfaces/group.interface';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit {
  groups: Group[] = [];
  groupForm: FormGroup;
  displayedColumns: string[] = ['text', 'created', 'actions'];
  expandedGroups = new Set<string>();

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService
  ) {
    console.log('GroupsComponent initialized');
    this.groupForm = this.formBuilder.group({
      text: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit(): void {
    console.log('GroupsComponent.ngOnInit()');
    this.loadGroups();
  }

  loadGroups(): void {
    console.log('Loading groups...');
    this.apiService.getGroups().subscribe({
      next: (groups: Group[]) => {
        console.log('Groups loaded:', groups);
        this.groups = groups;
      },
      error: (error: Error) => {
        console.error('Error loading groups:', error);
        alert('Error loading groups: ' + JSON.stringify(error));
      }
    });
  }

  toggleExpandedGroup(group: Group): void {
    if (this.expandedGroups.has(group.id)) {
      this.expandedGroups.delete(group.id);
    } else {
      this.expandedGroups.add(group.id);
    }
  }

  isExpanded(group: Group): boolean {
    return this.expandedGroups.has(group.id);
  }

  addGroup(): void {
    console.log('Adding group...');
    
    if (this.groupForm.valid) {
      const text = this.groupForm.get('text')?.value;
      console.log('Group text:', text);
      
      this.apiService.addGroup(text).subscribe({
        next: (newGroup: Group) => {
          console.log('Group added:', newGroup);
          this.groups = [...this.groups, newGroup];
          this.groupForm.reset();
        },
        error: (error: Error) => {
          console.error('Error adding group:', error);
          alert('Error adding group: ' + JSON.stringify(error));
        }
      });
    }
  }

  deleteGroup(group: Group): void {
    console.log('Deleting group:', group);
    
    this.apiService.deleteGroup(group.id).subscribe({
      next: () => {
        console.log('Group deleted:', group.id);
        this.groups = this.groups.filter(g => g.id !== group.id);
      },
      error: (error: Error) => {
        console.error('Error deleting group:', error);
        alert('Error deleting group: ' + JSON.stringify(error));
      }
    });
  }
}
