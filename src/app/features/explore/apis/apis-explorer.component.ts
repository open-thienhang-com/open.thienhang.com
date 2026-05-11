import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-apis-explorer',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">APIs Explorer</h1>
      
      <div class="mb-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Available APIs</h2>
          <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
            Add New API
          </button>
        </div>
        
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Endpoint
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let api of apis; let i = index">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ api.name }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">{{ api.endpoint }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">{{ api.method }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          [ngClass]="{'bg-green-100 text-green-800': api.status === 'Active',
                                    'bg-red-100 text-red-800': api.status === 'Inactive',
                                    'bg-yellow-100 text-yellow-800': api.status === 'Pending'}">
                      {{ api.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
                    <button class="text-green-600 hover:text-green-900 mr-3">Edit</button>
                    <button class="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
                
                <!-- Empty state -->
                <tr *ngIf="apis.length === 0">
                  <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
                    No APIs found. Click "Add New API" to create one.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .container {
      max-width: 1200px;
    }
    
    table {
      border-collapse: collapse;
      width: 100%;
    }
    
    th, td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    
    th {
      background-color: #f8fafc;
      font-weight: 600;
    }
    
    tr:hover {
      background-color: #f1f5f9;
    }
  `]
})
export class ApisExplorerComponent implements OnInit {
    apis: any[] = [
        {
            name: 'User Authentication API',
            endpoint: '/api/auth',
            method: 'POST',
            status: 'Active'
        },
        {
            name: 'Product Data API',
            endpoint: '/api/products',
            method: 'GET',
            status: 'Active'
        },
        {
            name: 'Analytics API',
            endpoint: '/api/analytics',
            method: 'GET',
            status: 'Pending'
        },
        {
            name: 'Legacy Data Access',
            endpoint: '/api/legacy/data',
            method: 'GET',
            status: 'Inactive'
        }
    ];

    constructor() { }

    ngOnInit(): void {
        // Initialize component
    }
}
