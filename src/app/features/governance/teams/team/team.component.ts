import { Component, EventEmitter, Injector, Output } from '@angular/core';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Textarea } from 'primeng/textarea';
import { AppBaseComponent } from '../../../../core/base/app-base.component';
import { GovernanceServices } from '../../../../core/services/governance.services';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';
import { ListboxModule } from 'primeng/listbox';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ChipsModule } from 'primeng/chips';

@Component({
  selector: 'app-team',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    Button,
    Dialog,
    FloatLabel,
    InputText,
    Textarea,
    ListboxModule,
    MultiSelectModule,
    TagModule,
    TableModule,
    TooltipModule,
    DividerModule,
    ToastModule,
    ChipsModule
  ],
  providers: [MessageService],
  templateUrl: './team.component.html',
})
export class TeamComponent extends AppBaseComponent {
  @Output() onSave = new EventEmitter<void>();

  team: any = {};
  title = 'Create Team';
  visible = false;
  loading = false;
  isEditMode = false;
  isViewMode = false;
  members: any[] = [];

  constructor(
    private injector: Injector,
    private governanceServices: GovernanceServices,
    public messageService: MessageService
  ) {
    super(injector);
  }

  save() {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    const teamId = this.team.kid || this.team._id || this.team.id;
    const saveObservable = teamId ?
      this.governanceServices.updateTeam(teamId, this.team) :
      this.governanceServices.createTeam(this.team);

    saveObservable.subscribe({
      next: (res) => {
        if (!res) {
          return;
        }
        this.showSuccess(teamId ? 'Updated successfully' : 'Created successfully');
        this.visible = false;
        this.team = {};
        this.loading = false;
        this.onSave.emit();
      },
      error: (error) => {
        console.error('Error saving team:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${teamId ? 'update' : 'create'} team`
        });
        this.loading = false;
      }
    });
  }

  show(id?) {
    this.visible = true;
    this.team = {};
    this.isEditMode = false;
    this.isViewMode = false;
    this.loadMembers();

    if (id) {
      this.title = 'Edit Team';
      this.isEditMode = true;
      this.loadTeam(id);
    } else {
      this.title = 'Create Team';
    }
  }

  // View team in read-only mode
  view(team: any) {
    this.visible = true;
    this.isViewMode = true;
    this.isEditMode = true;
    this.title = 'Team Details';
    const id = team.kid || team._id || team.id;
    this.loadTeam(id);
  }

  // Edit team
  edit(team: any) {
    this.visible = true;
    this.isEditMode = true;
    this.isViewMode = false;
    this.title = 'Edit Team';
    const id = team.kid || team._id || team.id;
    this.loadTeam(id);
    this.loadMembers();
  }

  // Load team details
  loadTeam(id: string) {
    this.loading = true;
    console.log('Loading team with ID:', id);
    this.governanceServices.getTeam(id).subscribe({
      next: (res) => {
        console.log('Team API response:', res);
        if (!res) {
          console.warn('Empty response from API');
          return;
        }
        if (res.data) {
          console.log('Using res.data:', res.data);
          this.team = res.data;
        } else {
          console.log('Using res directly:', res);
          this.team = res;
        }
        console.log('Final team object:', this.team);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading team:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load team details'
        });
        this.loading = false;
        this.visible = false;
      }
    });
  }

  loadMembers() {
    this.governanceServices.getUsers({}).subscribe(res => {
      this.members = res.data.map(item => ({
        ...item,
        name: `${item.first_name} ${item.last_name}`
      }));
    });
  }

  // Delete team with confirmation
  delete() {
    const teamId = this.team.kid || this.team._id || this.team.id;
    if (!teamId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Team ID not found'
      });
      return;
    }

    this.confirmOnDelete(
      new Event('click'),
      this.governanceServices.deleteTeam(teamId),
      () => {
        this.onSave.emit();
        this.visible = false;
      }
    );
  }

  // Switch from view mode to edit mode
  switchToEditMode() {
    this.isViewMode = false;
    this.title = 'Edit Team';
    this.loadMembers();
  }

  // Validate form
  validateForm(): boolean {
    if (!this.team.name?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Team name is required'
      });
      return false;
    }

    return true;
  }

  // Copy to clipboard
  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Copied',
        detail: 'Text copied to clipboard'
      });
    });
  }

  // Get member display name
  getMemberName(member: any): string {
    if (member.first_name || member.last_name) {
      return `${member.first_name || ''} ${member.last_name || ''}`.trim();
    }
    return member.email || member.kid || 'Unknown';
  }
}