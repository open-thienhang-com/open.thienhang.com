import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { BloggerService, Author, AuthorsResponse } from '../../services/blogger.service';

@Component({
    selector: 'app-blogger-authors',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        HttpClientModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        DialogModule,
        CardModule,
        ToastModule,
        TooltipModule,
        ConfirmDialogModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './authors.component.html',
    styleUrls: ['./authors.component.scss']
})
export class BloggerAuthorsComponent implements OnInit {
    private bloggerService = inject(BloggerService);
    private messageService = inject(MessageService);

    authors: Author[] = [];
    loading = false;
    error: string | null = null;
    displayDialog = false;
    selectedAuthor: Author | null = null;
    total = 0;
    offset = 0;
    limit = 10;

    ngOnInit() {
        this.loadAuthors();
    }

    loadAuthors() {
        this.loading = true;
        this.error = null;

        this.bloggerService.getAuthors(this.limit, this.offset).subscribe({
            next: (response: AuthorsResponse) => {
                this.authors = response.data;
                this.total = response.total;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading authors:', error);
                this.error = 'Failed to load authors. Please try again.';
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load authors'
                });
            }
        });
    }

    viewAuthor(author: Author) {
        this.selectedAuthor = author;
        this.displayDialog = true;
    }
}
