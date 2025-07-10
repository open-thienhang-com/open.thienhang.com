import {Component, Injector, OnInit} from '@angular/core';
import {TeamComponent} from '../teams/team/team.component';
import {Button} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {AppBaseComponent} from '../../../core/base/app-base.component';
import {GovernanceServices} from '../../../core/services/governance.services';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { BadgeModule } from 'primeng/badge';
import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-teams',
  imports: [
    CommonModule,
    FormsModule,
    TeamComponent,
    Button,
    TableModule,
    InputTextModule,
    DropdownModule,
    BadgeModule,
    PaginatorModule,
    TooltipModule
  ],
  templateUrl: './teams.component.html',
})
export class TeamsComponent extends AppBaseComponent implements OnInit {
  teams: any[] = [];
  filteredTeams: any[] = [];
  
  // Stats
  totalTeams: number = 0;
  activeTeams: number = 0;
  totalMembers: number = 0;
  projectTeams: number = 0;
  
  // Filters
  searchTerm: string = '';
  selectedType: any = null;
  selectedStatus: any = null;
  selectedOwner: any = null;
  
  // Options for dropdowns
  typeOptions = [
    { label: 'Project Team', value: 'project' },
    { label: 'Department', value: 'department' },
    { label: 'Working Group', value: 'working_group' },
    { label: 'Committee', value: 'committee' }
  ];
  
  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Archived', value: 'archived' }
  ];
  
  ownerOptions: any[] = [];
  
  // Pagination
  totalRecords: number = 0;
  itemsPerPage: number = 12;

  constructor(
    private injector: Injector,
    private governanceServices: GovernanceServices
  ) {
    super(injector)
  }

  ngOnInit() {
    this.getTeams();
    this.loadOwnerOptions();
  }

  getTeams = (page = 0) => {
    this.isTableLoading = true;
    this.governanceServices.getTeams({offset: page, size: this.itemsPerPage}).subscribe(res => {
      this.teams = res.data;
      this.filteredTeams = [...this.teams];
      this.totalRecords = res.total || this.teams.length;
      this.calculateStats();
      this.isTableLoading = false;
    })
  }

  loadOwnerOptions() {
    // Load users for owner filter dropdown
    this.governanceServices.getUsers({}).subscribe(res => {
      this.ownerOptions = res.data.map(user => ({
        label: `${user.first_name} ${user.last_name}`,
        value: user._id
      }));
    });
  }

  calculateStats() {
    this.totalTeams = this.teams.length;
    this.activeTeams = this.teams.filter(t => t.status === 'active' || !t.status).length;
    this.totalMembers = this.teams.reduce((sum, team) => sum + (team.members?.length || 0), 0);
    this.projectTeams = this.teams.filter(t => t.type === 'project').length;
  }

  filterTeams() {
    this.filteredTeams = this.teams.filter(team => {
      const matchesSearch = !this.searchTerm || 
        team.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        team.description?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesType = !this.selectedType || team.type === this.selectedType;
      const matchesStatus = !this.selectedStatus || team.status === this.selectedStatus;
      const matchesOwner = !this.selectedOwner || team.owner === this.selectedOwner;
      
      return matchesSearch && matchesType && matchesStatus && matchesOwner;
    });
  }

  refreshTeams() {
    this.getTeams();
  }

  showAnalytics() {
    console.log('Showing team analytics...');
    // Implement analytics view
  }

  viewTeam(team: any) {
    console.log('Viewing team:', team);
    // Implement team detail view
  }

  manageMembers(team: any) {
    console.log('Managing members for team:', team);
    // Implement member management
  }

  managePermissions(team: any) {
    console.log('Managing permissions for team:', team);
    // Implement permissions management
  }

  deleteTeam(team: any) {
    this.confirmOnDelete(event, this.governanceServices.deleteTeam(team._id), this.getTeams);
  }

  onDeleteTeam(event: Event, id) {
    this.confirmOnDelete(event, this.governanceServices.deleteTeam(id), this.getTeams);
  }

  onPageChange(event: any) {
    this.getTeams(event.page);
  }

  getStatusSeverity(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'archived': return 'secondary';
      default: return 'success';
    }
  }

  getMemberInitials(member: any): string {
    if (typeof member === 'string') return member.substring(0, 2).toUpperCase();
    if (member.first_name && member.last_name) {
      return (member.first_name[0] + member.last_name[0]).toUpperCase();
    }
    return member.name ? member.name.substring(0, 2).toUpperCase() : 'UN';
  }
}
