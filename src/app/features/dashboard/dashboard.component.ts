import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/component/breadcrumb/breadcrumb.component';
import { BlogService, BlogItem, Announcement } from './services/blog.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, BreadcrumbComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', url: '/' },
    { label: 'Dashboard', active: true }
  ];

  // Blogs & announcements loaded from mock BlogService
  blogs: BlogItem[] = [];
  announcements: Announcement[] = [];

  // Hot blogs slideshow
  hotBlogs: BlogItem[] = [];
  currentHotIndex = 0;
  hotInterval: any;

  constructor(private blogService: BlogService) { }

  ngOnInit(): void {
    this.blogService.getBlogs().subscribe(b => {
      this.blogs = b;
      // determine hot blogs (simple: first 3)
      this.hotBlogs = this.blogs.slice(0, 3);
    });

    this.blogService.getAnnouncements().subscribe(a => this.announcements = a);

    // auto-rotate hot blog slideshow
    this.hotInterval = setInterval(() => this.nextHot(), 5000);
  }

  ngOnDestroy(): void {
    if (this.hotInterval) { clearInterval(this.hotInterval); }
  }

  prevHot() {
    if (!this.hotBlogs.length) return;
    this.currentHotIndex = (this.currentHotIndex - 1 + this.hotBlogs.length) % this.hotBlogs.length;
  }

  nextHot() {
    if (!this.hotBlogs.length) return;
    this.currentHotIndex = (this.currentHotIndex + 1) % this.hotBlogs.length;
  }

  goToBlog(id: string) {
    // navigate logic placeholder - could route to /blogs/:id
    console.log('Open blog', id);
  }
}
