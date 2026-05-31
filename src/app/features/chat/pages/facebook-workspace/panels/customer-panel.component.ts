import {
  Component, Input, Output, EventEmitter, OnDestroy, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { ChatService } from '../../../services/chat.service';
import {
  TelegramConversation, CustomerSummary, CustomerOrder, TelegramMessage,
  CustomerCreatePayload, OrderItem, OrderCreatePayload, SendEmailPayload, ProductSearchResult,
  OrderConfirmationResult,
} from '../../../models/chat.model';
import { OrderConfirmationDialogComponent } from './order-confirmation-dialog.component';
import { TemplateSendPanelComponent } from './template-send-panel.component';

@Component({
  selector: 'app-customer-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonModule, TagModule, ProgressSpinnerModule, DropdownModule, InputNumberModule, OrderConfirmationDialogComponent, TemplateSendPanelComponent],
  styles: [`
    :host { display:flex; flex-direction:column; flex:1; min-height:0; overflow:hidden; }

    /* ── shared ── */
    .cp { display:flex; flex-direction:column; flex:1; min-height:0; overflow:hidden; font-size:.8rem; }
    .cp-scroll { flex:1; min-height:0; overflow-y:auto; padding:.6rem .75rem; }
    .cp-btn {
      display:inline-flex; align-items:center; gap:.3rem;
      padding:.3rem .7rem; border-radius:6px; font:inherit; font-size:.72rem; font-weight:600;
      border:none; cursor:pointer; transition:background .12s;
    }
    .cp-btn--primary { background:#2563eb; color:#fff; }
    .cp-btn--primary:hover:not(:disabled) { background:#1d4ed8; }
    .cp-btn--ghost { background:none; border:1px solid #e2e8f0; color:#64748b; }
    .cp-btn--ghost:hover:not(:disabled) { background:#f1f5f9; }
    .cp-btn--danger { background:none; border:none; color:#ef4444; padding:.2rem .4rem; font-size:.68rem; }
    .cp-btn:disabled { opacity:.55; cursor:not-allowed; }
    .cp-card-cta { width:100%; justify-content:center; margin-top:.6rem; padding:.5rem; font-size:.78rem; }
    .cp-staffbar { display:flex; align-items:center; justify-content:space-between; gap:.5rem;
      padding:.45rem .75rem; background:#eef2ff; border-bottom:1px solid #e0e7ff; flex-shrink:0; }
    .cp-staffbar-label { font-size:.68rem; font-weight:700; color:#6366f1; text-transform:uppercase; letter-spacing:.03em; display:flex; align-items:center; gap:.35rem; }
    .cp-staffbar-label i { font-size:.8rem; }
    .cp-staffbar-name { font-size:.78rem; font-weight:700; color:#312e81; }
    .cp-staffbar-name.unassigned { color:#94a3b8; font-weight:600; font-style:italic; }

    /* ── CRM single-scroll layout ── */
    .cp-crm { flex:1; min-height:0; overflow-y:auto; padding:.75rem; display:flex; flex-direction:column; gap:.75rem; }
    .cp-hero { background:linear-gradient(135deg,#6366f1,#8b5cf6); border-radius:14px; padding:.85rem; color:#fff; box-shadow:0 8px 20px rgba(99,102,241,.28); }
    .cp-hero-top { display:flex; align-items:center; gap:.6rem; }
    .cp-hero-av { width:2.6rem; height:2.6rem; border-radius:14px; background:rgba(255,255,255,.22); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.1rem; flex-shrink:0; }
    .cp-hero-id { flex:1; min-width:0; }
    .cp-hero-name { font-size:1rem; font-weight:800; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .cp-hero-badges { display:flex; gap:.3rem; margin-top:.25rem; flex-wrap:wrap; }
    .cp-chip { font-size:.62rem; font-weight:700; text-transform:uppercase; letter-spacing:.03em; padding:.1rem .45rem; border-radius:999px; background:rgba(255,255,255,.22); color:#fff; }
    .cp-chip--ok { background:rgba(255,255,255,.9); color:#16a34a; }
    .cp-chip--off { background:rgba(0,0,0,.2); color:#fee2e2; }
    .cp-hero-x { margin-left:auto; border:none; background:rgba(255,255,255,.18); color:#fff; width:1.7rem; height:1.7rem; border-radius:8px; cursor:pointer; flex-shrink:0; }
    .cp-hero-x:hover { background:rgba(255,255,255,.32); }
    .cp-hero-cta { width:100%; margin-top:.75rem; padding:.6rem; border:none; border-radius:10px; background:#fff; color:#4f46e5; font-weight:800; font-size:.85rem; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:.45rem; box-shadow:0 2px 6px rgba(0,0,0,.12); }
    .cp-hero-cta:hover { background:#f5f3ff; }

    .cp-sec { background:#fff; border:1px solid #eceef4; border-radius:12px; padding:.7rem .8rem; }
    .cp-sec-title { font-size:.68rem; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:.04em; margin-bottom:.5rem; display:flex; align-items:center; gap:.4rem; }
    .cp-count { background:#eef2ff; color:#4f46e5; border-radius:999px; padding:0 .4rem; font-size:.66rem; font-weight:800; }
    .cp-kv { display:flex; align-items:center; gap:.5rem; font-size:.8rem; color:#1e293b; padding:.2rem 0; }
    .cp-kv i { color:#94a3b8; font-size:.78rem; width:1rem; text-align:center; flex-shrink:0; }
    .cp-kv--muted span { font-size:.66rem; color:#94a3b8; }
    .cp-kv-warn { color:#d97706; font-style:italic; }
    .cp-sec-actions { display:flex; gap:.4rem; margin-top:.5rem; flex-wrap:wrap; }
    .cp-relink { margin-top:.5rem; padding-top:.5rem; border-top:1px solid #f1f5f9; }

    /* ── Pinned customer card ── */
    .cp-pin { flex:0 0 auto; padding:.7rem .75rem; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; }
    .cp-pin-row { display:flex; align-items:flex-start; gap:.6rem; }
    .cp-pin-av { width:2.6rem; height:2.6rem; border-radius:13px; background:rgba(255,255,255,.22); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.05rem; flex-shrink:0; }
    .cp-pin-id { flex:1; min-width:0; }
    .cp-pin-name { font-size:.98rem; font-weight:800; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .cp-pin-contact { display:flex; flex-direction:column; gap:.05rem; margin-top:.15rem; }
    .cp-pin-contact span { font-size:.7rem; opacity:.92; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .cp-pin-contact i { font-size:.66rem; opacity:.8; margin-right:.25rem; }
    .cp-pin-badges { display:flex; gap:.3rem; margin-top:.35rem; flex-wrap:wrap; }
    .cp-pin-x { border:none; background:rgba(255,255,255,.18); color:#fff; width:1.6rem; height:1.6rem; border-radius:8px; cursor:pointer; flex-shrink:0; }
    .cp-pin-x:hover:not(:disabled) { background:rgba(255,255,255,.34); }
    .cp-pin-info { margin-top:.55rem; padding-top:.5rem; border-top:1px solid rgba(255,255,255,.2); display:flex; flex-direction:column; gap:.2rem; }
    .cp-pin-kv { font-size:.74rem; opacity:.95; display:flex; align-items:center; gap:.4rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .cp-pin-kv i { font-size:.7rem; opacity:.8; width:.9rem; text-align:center; flex-shrink:0; }
    .cp-chip { font-size:.6rem; font-weight:700; text-transform:uppercase; letter-spacing:.03em; padding:.08rem .42rem; border-radius:999px; background:rgba(255,255,255,.22); color:#fff; }
    .cp-chip--ok { background:rgba(255,255,255,.92); color:#16a34a; }
    .cp-chip--off { background:rgba(0,0,0,.22); color:#fee2e2; }
    .cp-kv-warn { color:#fde68a !important; }

    /* ── Helper menu ── */
    .cp-helper { flex:0 0 auto; display:flex; gap:.25rem; padding:.4rem .5rem; background:#f4f5fb; border-bottom:1px solid #eceef4; }
    .cp-helper-btn { flex:1; display:flex; align-items:center; justify-content:center; gap:.3rem; padding:.45rem .3rem; border:none; border-radius:8px; background:transparent; color:#64748b; font:inherit; font-size:.72rem; font-weight:700; cursor:pointer; }
    .cp-helper-btn i { font-size:.78rem; }
    .cp-helper-btn:hover { color:#4f46e5; }
    .cp-helper-btn.active { background:#fff; color:#4f46e5; box-shadow:0 1px 3px rgba(17,24,39,.1); }
    .cp-helper-body { flex:1; min-height:0; overflow-y:auto; padding:.6rem .7rem; display:flex; flex-direction:column; gap:.6rem; }

    /* ── Inline order checkout ── */
    .cp-order-add { display:flex; gap:.4rem; align-items:center; margin-bottom:.5rem; }
    .cp-order-add ::ng-deep .cp-prod-dd { flex:1; }
    .cp-cart-row { display:flex; align-items:center; gap:.4rem; padding:.3rem 0; border-bottom:1px solid #f4f5fb; }
    .cp-cart-name { flex:1; min-width:0; font-size:.76rem; color:#1e293b; }
    .cp-cart-sku { display:block; font-size:.64rem; color:#94a3b8; }
    .cp-cart-amt { font-size:.74rem; font-weight:700; color:#0f172a; white-space:nowrap; }
    .cp-cart-rm { border:none; background:transparent; color:#94a3b8; cursor:pointer; }
    .cp-cart-rm:hover { color:#ef4444; }
    .cp-cart-total { display:flex; justify-content:space-between; font-weight:800; color:#4f46e5; font-size:.95rem; margin-top:.5rem; padding-top:.5rem; border-top:1px solid #eceef4; }
    .cp-order-submit { width:100%; margin-top:.6rem; padding:.6rem; border:none; border-radius:10px; background:#16a34a; color:#fff; font-weight:800; font-size:.85rem; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:.4rem; }
    .cp-order-submit:hover:not(:disabled) { background:#15803d; }
    .cp-order-submit:disabled { opacity:.55; cursor:not-allowed; }
    .cp-order-hint { font-size:.68rem; color:#d97706; margin-top:.4rem; display:flex; align-items:flex-start; gap:.3rem; }
    .cp-order-hint--info { color:#6366f1; margin-top:0; margin-bottom:.5rem; }
    ::ng-deep .cp-qty { width:3rem; text-align:center; }

    .cp-input {
      width:100%; padding:.35rem .6rem; border:1px solid #e2e8f0; border-radius:6px;
      font:inherit; font-size:.78rem; outline:none; box-sizing:border-box;
      transition:border .12s;
    }
    .cp-input:focus { border-color:#2563eb; }
    .cp-input--search { padding-left:2rem; }

    .cp-search-wrap { position:relative; }
    .cp-search-icon { position:absolute; left:.55rem; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:.75rem; }

    /* ── linked customer card (sticky so the agent always sees who they're acting on) ── */
    .cp-card {
      background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px;
      padding:.6rem .75rem; margin-bottom:.6rem; flex-shrink:0;
      position:sticky; top:0; z-index:2;
    }
    .cp-card-head { display:flex; align-items:center; gap:.55rem; }
    .cp-avatar {
      width:2rem; height:2rem; border-radius:50%; background:#2563eb; color:#fff;
      display:flex; align-items:center; justify-content:center;
      font-size:.8rem; font-weight:700; flex-shrink:0;
    }
    .cp-card-info { flex:1; min-width:0; }
    .cp-card-name { font-size:.82rem; font-weight:700; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .cp-card-phone { font-size:.72rem; color:#64748b; }
    .cp-card-tags { display:flex; gap:.3rem; flex-wrap:wrap; margin-top:.35rem; }
    .cp-unlink { font:inherit; font-size:.65rem; color:#94a3b8; background:none; border:none; cursor:pointer; padding:0; }
    .cp-unlink:hover { color:#ef4444; }

    /* ── tabs (sticky under the customer card so they always remain reachable) ── */
    .cp-tabs {
      display:flex; gap:.2rem; padding:.4rem .75rem 0;
      border-bottom:1px solid #e2e8f0; flex-shrink:0;
      background:#fff; position:sticky; top:0; z-index:1;
    }
    .cp-tab {
      font:inherit; font-size:.72rem; font-weight:600; background:none; border:none;
      padding:.3rem .55rem; cursor:pointer; color:#64748b; border-bottom:2px solid transparent;
      margin-bottom:-1px; transition:color .12s, border-color .12s;
    }
    .cp-tab.active { color:#2563eb; border-bottom-color:#2563eb; }

    /* ── tab content ── */
    .cp-tab-body { flex:1; min-height:0; overflow-y:auto; padding:.6rem .75rem; }
    .cp-info-row { display:flex; justify-content:space-between; gap:.5rem; padding:.25rem 0; border-bottom:1px solid #f1f5f9; font-size:.75rem; }
    .cp-info-label { color:#94a3b8; flex-shrink:0; }
    .cp-info-val { color:#0f172a; font-weight:600; text-align:right; }

    .cp-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.35rem; padding:1.5rem .5rem; color:#94a3b8; }
    .cp-empty i { font-size:1.25rem; }
    .cp-empty p { margin:0; font-size:.75rem; }

    /* ── order rows ── */
    .cp-order-row { padding:.5rem 0; border-bottom:1px solid #f1f5f9; font-size:.75rem; }
    .cp-order-row:last-child { border-bottom:none; }
    .cp-order-row-head { display:flex; justify-content:space-between; align-items:center; gap:.4rem; }
    .cp-order-num { font-weight:700; color:#0f172a; }
    .cp-order-meta { display:flex; justify-content:space-between; color:#64748b; margin-top:.15rem; }
    .cp-order-amount { font-weight:700; color:#0f172a; }
    .cp-order-foot { display:flex; justify-content:space-between; align-items:center; gap:.4rem; margin-top:.35rem; }
    .cp-order-confirmed {
      display:inline-flex; align-items:center; gap:.25rem;
      font-size:.66rem; font-weight:600; color:#16a34a;
      background:#dcfce7; padding:.1rem .35rem; border-radius:999px;
    }
    .cp-order-confirmed i { font-size:.66rem; }
    .cp-btn--sm { padding:.2rem .5rem; font-size:.66rem; }

    /* ── history rows ── */
    .cp-hist-row { padding:.4rem 0; border-bottom:1px solid #f1f5f9; font-size:.75rem; }
    .cp-hist-row:last-child { border-bottom:none; }
    .cp-hist-preview { color:#64748b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:.1rem; }
    .cp-hist-time { color:#94a3b8; font-size:.68rem; }

    /* ── email compose ── */
    .cp-compose { background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:.6rem; margin-top:.5rem; display:flex; flex-direction:column; gap:.4rem; }
    .cp-compose-row { display:flex; gap:.4rem; justify-content:flex-end; }

    /* ── unlinked search state ── */
    .cp-section-title { font-size:.68rem; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:.04em; padding:.5rem .75rem .3rem; flex-shrink:0; }

    .cp-results { flex-shrink:0; margin:.4rem .75rem 0; border:1px solid #e2e8f0; border-radius:8px; overflow:hidden; }
    .cp-result-row {
      display:flex; align-items:center; gap:.5rem;
      padding:.5rem .65rem; background:#fff; border-bottom:1px solid #f8fafc;
      cursor:pointer; transition:background .12s; font-size:.75rem; width:100%; text-align:left; border:none;
    }
    .cp-result-row:last-child { border-bottom:none; }
    .cp-result-row:hover:not(:disabled) { background:#f8fafc; }
    .cp-result-row:disabled { opacity:.6; cursor:not-allowed; }
    .cp-result-av {
      width:1.6rem; height:1.6rem; border-radius:50%; background:#64748b; color:#fff;
      display:flex; align-items:center; justify-content:center; font-size:.65rem; font-weight:700; flex-shrink:0;
    }
    .cp-result-name { font-weight:600; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .cp-result-phone { color:#94a3b8; font-size:.68rem; }
    .cp-result-link { margin-left:auto; flex-shrink:0; font-size:.65rem; font-weight:700; color:#2563eb; }

    /* ── create form ── */
    .cp-create-form { margin:.5rem .75rem 0; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:.6rem; display:flex; flex-direction:column; gap:.4rem; }
    .cp-create-title { font-size:.72rem; font-weight:700; color:#0f172a; }
    .cp-create-actions { display:flex; gap:.4rem; }

    .cp-footer { padding:.5rem .75rem; border-top:1px solid #f1f5f9; flex-shrink:0; }
    .cp-error { font-size:.7rem; color:#ef4444; padding:.3rem .75rem; }
  `],
  template: `
<div class="cp">

  <!-- ══ Supporting staff bar (shown while no customer is linked) ══ -->
  <div class="cp-staffbar" *ngIf="conversation && !linkedCustomer">
    <span class="cp-staffbar-label"><i class="pi pi-headphones"></i> Support Agent</span>
    <span class="cp-staffbar-name" [class.unassigned]="!conversation.agent">{{ conversation.agent || 'Unassigned' }}</span>
  </div>

  <!-- ══ LINKED: omni order-support panel (pinned card + helper menu) ═══════ -->
  <ng-container *ngIf="linkedCustomer">

    <!-- Pinned customer card -->
    <div class="cp-pin">
      <div class="cp-pin-row">
        <div class="cp-pin-av">{{ (linkedCustomer.name || '?').charAt(0).toUpperCase() }}</div>
        <div class="cp-pin-id">
          <div class="cp-pin-name">{{ linkedCustomer.name }}</div>
          <div class="cp-pin-badges">
            <span class="cp-chip cp-chip--type">{{ customerTypeLabel(linkedCustomer.customer_type) }}</span>
            <span class="cp-chip" [class.cp-chip--ok]="linkedCustomer.is_active" [class.cp-chip--off]="!linkedCustomer.is_active">{{ linkedCustomer.is_active ? 'Active' : 'Inactive' }}</span>
          </div>
        </div>
        <button type="button" class="cp-pin-x" (click)="unlink()" [disabled]="linking" title="Change/Unlink customer"><i class="pi pi-times"></i></button>
      </div>
      <div class="cp-pin-info">
        <div class="cp-pin-kv"><i class="pi pi-phone"></i>{{ linkedCustomer.phone || '—' }}</div>
        <div class="cp-pin-kv"><i class="pi pi-envelope"></i>{{ linkedCustomer.email || 'No email' }}</div>
        <div class="cp-pin-kv"><i class="pi pi-hashtag"></i>{{ linkedCustomer.id }}</div>
      </div>
    </div>

    <!-- Supporting staff (below the customer card) -->
    <div class="cp-staffbar">
      <span class="cp-staffbar-label"><i class="pi pi-headphones"></i> Support Agent</span>
      <span class="cp-staffbar-name" [class.unassigned]="!conversation?.agent">{{ conversation?.agent || 'Unassigned' }}</span>
    </div>

    <!-- Helper menu -->
    <div class="cp-helper">
      <button type="button" class="cp-helper-btn" [class.active]="helperView()==='info'" (click)="setHelper('info')"><i class="pi pi-id-card"></i> Info</button>
      <button type="button" class="cp-helper-btn" [class.active]="helperView()==='order'" (click)="setHelper('order')"><i class="pi pi-shopping-cart"></i> New Order</button>
      <button type="button" class="cp-helper-btn" [class.active]="helperView()==='template'" (click)="setHelper('template')"><i class="pi pi-file"></i> Template</button>
    </div>

    <!-- Helper content -->
    <div class="cp-helper-body">

      <!-- ░ INFO: lookup customer + orders + history ░ -->
      <ng-container *ngIf="helperView()==='info'">
        <section class="cp-sec">
          <div class="cp-sec-title">Customer Profile</div>
          <div class="cp-kv cp-kv--muted"><i class="pi pi-hashtag"></i><span>{{ linkedCustomer.id }}</span></div>
          <div class="cp-kv"><i class="pi pi-tag"></i><span>{{ customerTypeLabel(linkedCustomer.customer_type) }}</span></div>
          <div class="cp-sec-actions">
            <button type="button" class="cp-btn cp-btn--ghost cp-btn--sm" *ngIf="linkedCustomer.email && !showEmailForm()" (click)="showEmailForm.set(true)"><i class="pi pi-envelope"></i> Send Email</button>
            <button type="button" class="cp-btn cp-btn--ghost cp-btn--sm" (click)="showRelink.set(!showRelink())"><i class="pi pi-sync"></i> Change Customer</button>
          </div>
          <div *ngIf="showEmailForm()" class="cp-compose">
            <span style="font-size:.72rem;font-weight:700;color:#0f172a">Send email to {{ linkedCustomer.email }}</span>
            <input type="text" class="cp-input" [(ngModel)]="emailSubject" placeholder="Subject *" />
            <textarea class="cp-input" rows="3" [(ngModel)]="emailContent" placeholder="Content *" style="resize:none"></textarea>
            <div class="cp-compose-row">
              <button type="button" class="cp-btn cp-btn--ghost" (click)="cancelEmail()">Cancel</button>
              <button type="button" class="cp-btn cp-btn--primary" (click)="sendEmail()" [disabled]="sendingEmail() || !emailSubject.trim() || !emailContent.trim()">
                <i [class]="sendingEmail() ? 'pi pi-spin pi-spinner' : 'pi pi-send'"></i> {{ sendingEmail() ? 'Sending...' : 'Send' }}
              </button>
            </div>
            <span *ngIf="emailError" style="font-size:.7rem;color:#ef4444">{{ emailError }}</span>
          </div>
          <div *ngIf="showRelink()" class="cp-relink">
            <div class="cp-search-wrap"><i class="pi pi-search cp-search-icon"></i>
              <input type="text" class="cp-input cp-input--search" [(ngModel)]="searchKeyword" (ngModelChange)="onSearch($event)" placeholder="Search another customer..." /></div>
            <div *ngIf="searching" class="cp-empty"><i class="pi pi-spin pi-spinner"></i></div>
            <button *ngFor="let c of searchResults" type="button" class="cp-result-row" [disabled]="linking" (click)="selectCustomer(c)">
              <div class="cp-result-av">{{ (c.name||'?').charAt(0).toUpperCase() }}</div>
              <div style="flex:1;min-width:0"><div class="cp-result-name">{{ c.name }}</div><div class="cp-result-phone">{{ c.phone }}</div></div>
              <span class="cp-result-link">Link</span>
            </button>
            <span *ngIf="linkError" class="cp-error">{{ linkError }}</span>
          </div>
        </section>

        <section class="cp-sec">
          <div class="cp-sec-title">Orders <span class="cp-count">{{ orders().length }}</span></div>
          <div *ngIf="ordersLoading()" class="cp-empty"><i class="pi pi-spin pi-spinner"></i></div>
          <div *ngIf="!ordersLoading() && orders().length === 0" class="cp-empty"><i class="pi pi-shopping-bag"></i><p>No orders yet</p></div>
          <div *ngFor="let order of orders()" class="cp-order-row">
            <div class="cp-order-row-head">
              <div class="cp-order-num">{{ order.order_number }}</div>
              <span *ngIf="(order.confirmation_emails?.length || 0) > 0" class="cp-order-confirmed"><i class="pi pi-check-circle"></i> Emailed<ng-container *ngIf="(order.confirmation_emails?.length || 0) > 1"> ({{ order.confirmation_emails!.length }}x)</ng-container></span>
            </div>
            <div class="cp-order-meta"><span>{{ order.status }}</span><span class="cp-order-amount">{{ order.total_amount | currency:'VND':'symbol':'1.0-0' }}</span></div>
            <div class="cp-order-foot">
              <span style="font-size:.68rem;color:#94a3b8">{{ order.created_at | date:'dd/MM/yy HH:mm' }}</span>
              <button type="button" class="cp-btn cp-btn--ghost cp-btn--sm" [disabled]="!linkedCustomer?.email" [title]="linkedCustomer?.email ? '' : 'Customer has no email'" (click)="openConfirmationDialog(order)"><i class="pi pi-envelope"></i> Email</button>
            </div>
          </div>
        </section>

        <section class="cp-sec">
          <div class="cp-sec-title">Conversation History</div>
          <div *ngIf="historyLoading()" class="cp-empty"><i class="pi pi-spin pi-spinner"></i></div>
          <div *ngIf="!historyLoading() && chatHistory().length === 0" class="cp-empty"><i class="pi pi-comments"></i><p>No history</p></div>
          <div *ngFor="let conv of chatHistory()" class="cp-hist-row">
            <div style="display:flex;align-items:center;gap:.3rem"><i [class]="'pi pi-' + (conv.platform === 'telegram' ? 'send' : 'envelope')" style="font-size:.65rem;color:#94a3b8"></i><span style="font-weight:600;font-size:.72rem">{{ conv.platform }}</span></div>
            <div class="cp-hist-preview">{{ conv.last_message }}</div>
            <div class="cp-hist-time">{{ conv.last_message_time | date:'dd/MM HH:mm' }}</div>
          </div>
        </section>
      </ng-container>

      <!-- ░ ORDER: inline quick checkout ░ -->
      <ng-container *ngIf="helperView()==='order'">
        <section class="cp-sec">
          <div class="cp-sec-title">New order for {{ linkedCustomer.name }}</div>
          <p class="cp-order-hint cp-order-hint--info"><i class="pi pi-info-circle"></i> Send a product for the customer to preview; add it to the order once they agree.</p>
          <div class="cp-order-add">
            <p-dropdown [options]="productOptions" [(ngModel)]="addProductId" [filter]="true" optionLabel="label" optionValue="value"
                        placeholder="Search a product…" appendTo="body" styleClass="cp-prod-dd"></p-dropdown>
            <button type="button" class="cp-btn cp-btn--ghost cp-btn--sm" [disabled]="!addProductId || sendingProduct()" (click)="sendSelectedProduct()" title="Send to customer for preview"><i [class]="sendingProduct() ? 'pi pi-spin pi-spinner' : 'pi pi-send'"></i></button>
            <button type="button" class="cp-btn cp-btn--primary cp-btn--sm" [disabled]="!addProductId" (click)="addOrderItem()" title="Add to order"><i class="pi pi-plus"></i> Add</button>
          </div>
          <div *ngIf="!orderCart.length" class="cp-empty"><i class="pi pi-shopping-cart"></i><p>No items</p></div>
          <div *ngFor="let line of orderCart; let i = index" class="cp-cart-row">
            <div class="cp-cart-name">{{ line.product.name }}<span class="cp-cart-sku">{{ line.product.sku }}</span></div>
            <p-inputNumber [(ngModel)]="line.quantity" [min]="1" [showButtons]="true" inputStyleClass="cp-qty"></p-inputNumber>
            <div class="cp-cart-amt">{{ (line.product.selling_price * line.quantity) | number:'1.0-0' }}₫</div>
            <button type="button" class="cp-cart-rm" (click)="removeOrderItem(i)"><i class="pi pi-times"></i></button>
          </div>
          <div class="cp-cart-total"><span>Total</span><span>{{ cartTotal() | number:'1.0-0' }}₫</span></div>
          <button type="button" class="cp-order-submit" [disabled]="!orderCart.length || placingOrder()" (click)="createOrderInline()">
            <i [class]="placingOrder() ? 'pi pi-spin pi-spinner' : 'pi pi-check-circle'"></i>
            {{ placingOrder() ? 'Processing…' : 'Create order & email' }}
          </button>
          <p class="cp-order-hint" *ngIf="!linkedCustomer.email"><i class="pi pi-exclamation-triangle"></i> Customer has no email — the order is still created but no email is sent.</p>
        </section>
      </ng-container>

      <!-- ░ TEMPLATE ░ -->
      <ng-container *ngIf="helperView()==='template'">
        <app-template-send-panel [conversation]="conversation" [linkedCustomer]="linkedCustomer"></app-template-send-panel>
      </ng-container>

    </div>
  </ng-container>

  <!-- ══ UNLINKED: search → results → create ════════════════════════════════ -->
  <ng-container *ngIf="!linkedCustomer">

    <div class="cp-section-title">Link a customer</div>

    <!-- Search -->
    <div style="padding:0 .75rem .4rem">
      <div class="cp-search-wrap">
        <i class="pi pi-search cp-search-icon"></i>
        <input type="text" class="cp-input cp-input--search"
               [(ngModel)]="searchKeyword" (ngModelChange)="onSearch($event)"
               placeholder="Name, phone, email..." />
      </div>
    </div>

    <!-- Loading skeleton -->
    <div *ngIf="searching" style="padding:0 .75rem">
      <p-skeleton height="2.2rem" styleClass="mb-1" borderRadius="6px"></p-skeleton>
      <p-skeleton height="2.2rem" styleClass="mb-1" borderRadius="6px"></p-skeleton>
      <p-skeleton height="2.2rem" borderRadius="6px"></p-skeleton>
    </div>

    <!-- Results list -->
    <div *ngIf="!searching && searchResults.length > 0" class="cp-results">
      <button *ngFor="let c of searchResults" type="button" class="cp-result-row"
              [disabled]="linking" (click)="selectCustomer(c)">
        <div class="cp-result-av">{{ (c.name||'?').charAt(0).toUpperCase() }}</div>
        <div style="flex:1;min-width:0">
          <div class="cp-result-name">{{ c.name }}</div>
          <div class="cp-result-phone">{{ c.phone }}</div>
        </div>
        <p-tag [value]="customerTypeLabel(c.customer_type)" severity="info"></p-tag>
        <span class="cp-result-link"><i class="pi pi-link"></i></span>
      </button>
    </div>

    <!-- No results -->
    <div *ngIf="!searching && searchKeyword.trim() && searchResults.length === 0 && !showCreateForm()" class="cp-empty">
      <i class="pi pi-user-minus"></i>
      <p>No customer found</p>
    </div>

    <!-- Create form -->
    <div *ngIf="showCreateForm()" class="cp-create-form">
      <div class="cp-create-title">New customer</div>
      <input type="text" class="cp-input" [(ngModel)]="newCustomer.name" placeholder="Name *" />
      <input type="text" class="cp-input" [(ngModel)]="newCustomer.phone" placeholder="Phone" />
      <input type="email" class="cp-input" [(ngModel)]="newCustomer.email" placeholder="Email" />
      <input type="text" class="cp-input" [(ngModel)]="newCustomer.address" placeholder="Address" />
      <div class="cp-create-actions">
        <button type="button" class="cp-btn cp-btn--ghost" (click)="cancelCreate()">Cancel</button>
        <button type="button" class="cp-btn cp-btn--primary" (click)="createCustomer()"
                [disabled]="creatingCustomer() || !newCustomer.name.trim()">
          <i [class]="creatingCustomer() ? 'pi pi-spin pi-spinner' : 'pi pi-check'"></i>
          {{ creatingCustomer() ? 'Creating...' : 'Create & link' }}
        </button>
      </div>
      <span *ngIf="createError" style="font-size:.7rem;color:#ef4444">{{ createError }}</span>
    </div>

    <!-- Footer actions -->
    <div class="cp-footer">
      <button *ngIf="!showCreateForm()" type="button" class="cp-btn cp-btn--primary" style="width:100%;justify-content:center"
              (click)="showCreateForm.set(true)">
        <i class="pi pi-user-plus"></i> New customer
      </button>
    </div>

    <span *ngIf="linkError" class="cp-error">{{ linkError }}</span>
  </ng-container>

</div>

<!-- Order-confirmation dialog (mounted lazily when agent clicks "Gửi mail xác nhận") -->
<app-order-confirmation-dialog
    *ngIf="dialogOrder && linkedCustomer"
    [customer]="linkedCustomer"
    [order]="dialogOrder"
    [conversationId]="conversation?.id || undefined"
    [agentName]="conversation?.agent || undefined"
    (sent)="onConfirmationSent($event)"
    (cancelled)="dialogOrder = null">
</app-order-confirmation-dialog>
  `
})
export class CustomerPanelComponent implements OnDestroy {
  private chatService = inject(ChatService);
  private messageService = inject(MessageService);

  @Input() set conversation(value: TelegramConversation | null) {
    this._conversation = value;
    this.loadLinkedCustomer();
    this._resetAllForms();
  }
  get conversation(): TelegramConversation | null { return this._conversation; }
  private _conversation: TelegramConversation | null = null;

  @Output() customerLinked = new EventEmitter<CustomerSummary | null>();
  /** Fired when an order-confirmation email is dispatched; parent appends a
   *  system message into the conversation thread. */
  @Output() messageSent = new EventEmitter<TelegramMessage>();

  /** Order being confirmed in the dialog — null when dialog is closed. */
  dialogOrder: CustomerOrder | null = null;

  // ── Search / link
  searchKeyword = '';
  searchResults: CustomerSummary[] = [];
  linkedCustomer: CustomerSummary | null = null;
  searching = false;
  linking = false;
  linkError = '';

  // ── Tabs
  activeTab = signal<'profile' | 'orders' | 'history' | 'relink'>('profile');
  orders = signal<CustomerOrder[]>([]);
  chatHistory = signal<any[]>([]);
  ordersLoaded = signal(false);
  historyLoaded = signal(false);
  ordersLoading = signal(false);
  historyLoading = signal(false);

  // ── Helper menu + inline order checkout
  helperView = signal<'info' | 'order' | 'template'>('info');
  showRelink = signal(false);
  products: ProductSearchResult[] = [];
  addProductId: string | null = null;
  orderCart: { product: ProductSearchResult; quantity: number }[] = [];
  placingOrder = signal(false);
  sendingProduct = signal(false);

  get productOptions() {
    return this.products.map(p => ({ label: p.name + ' (' + p.sku + ') — ' + (p.selling_price || 0).toLocaleString('vi-VN') + '₫', value: p.id }));
  }

  customerTypeLabel(t?: string): string {
    const map: Record<string, string> = {
      regular: 'Regular', vip: 'VIP', wholesale: 'Wholesale',
      corporate: 'Corporate', new: 'New',
    };
    return map[(t || 'regular').toLowerCase()] || (t || 'Regular');
  }

  // ── Email
  showEmailForm = signal(false);
  sendingEmail = signal(false);
  emailSubject = '';
  emailContent = '';
  emailError = '';

  // ── Create customer
  showCreateForm = signal(false);
  creatingCustomer = signal(false);
  createError = '';
  newCustomer: CustomerCreatePayload = { name: '', phone: '', email: '', address: '' };

  private searchSubject = new Subject<string>();
  private subs = new Subscription();

  constructor() {
    this.subs.add(
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(keyword => {
          if (!keyword.trim()) { this.searchResults = []; this.searching = false; return of(null); }
          this.searching = true;
          return this.chatService.searchRetailCustomers(keyword, 10).pipe(catchError(() => of(null)));
        })
      ).subscribe(res => { this.searching = false; this.searchResults = res?.data || []; })
    );
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  loadTab(tab: 'profile' | 'orders' | 'history' | 'relink'): void {
    this.activeTab.set(tab);
    if (tab === 'orders' && !this.ordersLoaded() && this.linkedCustomer) {
      this.ordersLoading.set(true);
      this.chatService.getCustomerOrders(this.linkedCustomer.id).subscribe({
        next: res => { this.orders.set((res.data as CustomerOrder[]) || []); this.ordersLoaded.set(true); this.ordersLoading.set(false); },
        error: () => this.ordersLoading.set(false)
      });
    }
    if (tab === 'history' && !this.historyLoaded() && this.linkedCustomer) {
      this.historyLoading.set(true);
      this.chatService.getCustomerChatHistory(this.linkedCustomer.id).subscribe({
        next: res => { this.chatHistory.set((res.data as any[]) || []); this.historyLoaded.set(true); this.historyLoading.set(false); },
        error: () => this.historyLoading.set(false)
      });
    }
  }

  /** Single-scroll layout: load orders + chat history together once linked. */
  loadCustomerData(): void {
    const c = this.linkedCustomer;
    if (!c) return;
    this.ordersLoading.set(true);
    this.chatService.getCustomerOrders(c.id).subscribe({
      next: res => { this.orders.set((res.data as CustomerOrder[]) || []); this.ordersLoaded.set(true); this.ordersLoading.set(false); },
      error: () => this.ordersLoading.set(false),
    });
    this.historyLoading.set(true);
    this.chatService.getCustomerChatHistory(c.id).subscribe({
      next: res => { this.chatHistory.set((res.data as any[]) || []); this.historyLoaded.set(true); this.historyLoading.set(false); },
      error: () => this.historyLoading.set(false),
    });
  }

  onSearch(keyword: string): void { this.searchSubject.next(keyword); }

  selectCustomer(customer: CustomerSummary): void {
    if (!this._conversation?.id) return;
    this.linking = true; this.linkError = '';
    this.chatService.linkConversationToCustomer(this._conversation.id, customer.id).subscribe({
      next: () => {
        this.linkedCustomer = customer;
        this.searchKeyword = ''; this.searchResults = [];
        this.linking = false;
        this.showRelink.set(false);
        this.customerLinked.emit(customer);
        this._resetTabState();
        this.loadCustomerData();
      },
      error: () => { this.linking = false; this.linkError = 'Link failed. Please try again.'; }
    });
  }

  unlink(): void {
    if (!this._conversation?.id) return;
    this.linking = true; this.linkError = '';
    this.chatService.linkConversationToCustomer(this._conversation.id, null).subscribe({
      next: () => { this.linkedCustomer = null; this.linking = false; this.customerLinked.emit(null); },
      error: () => { this.linking = false; this.linkError = 'Unlink failed.'; }
    });
  }

  /** Open the order-confirmation dialog for a specific order row. */
  openConfirmationDialog(order: CustomerOrder): void {
    if (!this.linkedCustomer?.email) return;
    this.dialogOrder = order;
  }

  // ── Helper menu + inline order checkout ──────────────────────────────────
  setHelper(view: 'info' | 'order' | 'template'): void {
    this.helperView.set(view);
    if (view === 'order' && !this.products.length) {
      this.chatService.getProductsForChat(0, 100).subscribe({
        next: (res: any) => { this.products = (res.data || []).map((p: any) => ({ ...p, id: p.id || p._id })); },
        error: () => {},
      });
    }
  }

  addOrderItem(): void {
    const p = this.products.find(x => x.id === this.addProductId);
    if (!p) return;
    if (this.orderCart.some(l => l.product.id === p.id)) { this.addProductId = null; return; }
    this.orderCart.push({ product: p, quantity: 1 });
    this.addProductId = null;
  }
  /** Send the selected product to the customer (Telegram) so they can preview it
   *  before it's added to the order. */
  sendSelectedProduct(): void {
    const p = this.products.find(x => x.id === this.addProductId);
    const chatId = (this.conversation as any)?.chat_id;
    if (!p || !chatId) {
      this.messageService.add({ severity: 'warn', summary: 'Send', detail: 'No Telegram chat for this conversation' });
      return;
    }
    this.sendingProduct.set(true);
    const priceStr = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(p.selling_price || 0);
    let caption = `🛍️ *${p.name}*`;
    if (p.category) caption += `\n🏷️ ${p.category}`;
    caption += `\n💰 ${priceStr}`;
    if (p.description) caption += `\n\n${p.description}`;
    const keyboard = { inline_keyboard: [[{ text: '🛒 Order now', callback_data: `order:${p.id}` }]] };

    const done = (ok: boolean) => {
      this.sendingProduct.set(false);
      if (ok) {
        this.messageSent.emit({
          id: `product_${Date.now()}`, sender: 'agent', sender_name: 'Agent',
          content: caption, timestamp: new Date().toISOString(),
          message_type: p.image_url ? 'photo' : 'text', delivery_status: 'sent',
          media_url: p.image_url, caption,
        } as TelegramMessage);
        this.messageService.add({ severity: 'success', summary: 'Sent to customer', detail: p.name });
      } else {
        this.messageService.add({ severity: 'error', summary: 'Send failed', detail: 'Could not send product' });
      }
    };

    const req = p.image_url
      ? this.chatService.sendTelegramPhoto({ chat_id: chatId, photo: p.image_url, caption, parse_mode: 'Markdown', reply_markup: keyboard } as any)
      : this.chatService.sendTelegramMessage({ chat_id: chatId, text: caption, disable_notification: false, parse_mode: 'Markdown', reply_markup: keyboard } as any);
    req.subscribe({ next: () => done(true), error: () => done(false) });
  }

  removeOrderItem(i: number): void { this.orderCart.splice(i, 1); }
  cartTotal(): number {
    return this.orderCart.reduce((s, l) => s + (Number(l.product.selling_price) || 0) * (Number(l.quantity) || 0), 0);
  }

  /** Create the order inline, then auto-email the customer a success confirmation. */
  createOrderInline(): void {
    const c = this.linkedCustomer;
    if (!c || !this.orderCart.length || this.placingOrder()) return;
    const total = this.cartTotal();
    const items: OrderItem[] = this.orderCart.map(l => ({
      product_id: l.product.id, sku: l.product.sku, product_name: l.product.name,
      quantity: Number(l.quantity) || 0, unit_price: Number(l.product.selling_price) || 0,
      total_price: (Number(l.product.selling_price) || 0) * (Number(l.quantity) || 0),
    }));
    this.placingOrder.set(true);
    const orderNumber = 'TG-' + Date.now().toString().slice(-9);
    this.chatService.createOrder({ order_number: orderNumber, customer_id: c.id, items, total_amount: total, net_amount: total, source: 'telegram' }).subscribe({
      next: (res: any) => {
        const d = res?.data || res || {};
        const order: CustomerOrder = {
          id: d.id || d._id, order_number: d.order_number, created_at: d.created_at || new Date().toISOString(),
          total_amount: d.total_amount ?? total, status: d.order_status || d.status || 'pending', item_count: items.length,
        };
        this.orders.update(list => [order, ...list]);
        this.ordersLoaded.set(true);
        this.orderCart = [];
        this.placingOrder.set(false);
        this.helperView.set('info');
        this.messageSent.emit({
          id: `order-created-${order.id}-${Date.now()}`, sender: 'system', sender_name: 'System',
          content: `🛒 Created order #${order.order_number} (${total.toLocaleString('vi-VN')}₫) for ${c.name}`,
          timestamp: new Date().toISOString(), message_type: 'text', delivery_status: 'sent',
        } as TelegramMessage);
        this.messageService.add({ severity: 'success', summary: 'Order', detail: `Created order #${order.order_number}` });

        // Also confirm the order to the customer over Telegram (customer-facing, Vietnamese).
        const chatId = (this.conversation as any)?.chat_id;
        if (chatId) {
          const lines = items.map(it => `• ${it.product_name} x${it.quantity} — ${(it.total_price).toLocaleString('vi-VN')}₫`).join('\n');
          const tgText = `✅ *Đơn hàng #${order.order_number} đã được tạo*\n${lines}\n\n💰 *Tổng cộng: ${total.toLocaleString('vi-VN')}₫*\nCảm ơn quý khách! Chúng tôi sẽ xử lý đơn sớm nhất.`;
          this.chatService.sendTelegramMessage({ chat_id: chatId, text: tgText, disable_notification: false, parse_mode: 'Markdown' } as any).subscribe({
            next: () => {
              this.messageSent.emit({
                id: `order-tg-${order.id}-${Date.now()}`, sender: 'agent', sender_name: 'Agent',
                content: tgText, timestamp: new Date().toISOString(), message_type: 'text', delivery_status: 'sent',
              } as TelegramMessage);
              this.messageService.add({ severity: 'success', summary: 'Telegram', detail: 'Order confirmation sent to customer' });
            },
            error: () => {},
          });
        }

        // Also email the confirmation when the customer has an address.
        if (c.email && order.id) {
          this.chatService.sendOrderConfirmationEmail({
            order_id: order.id, customer_id: c.id,
            agent_name: this.conversation?.agent || undefined,
            conversation_id: this.conversation?.id || undefined,
          } as any).subscribe({
            next: (er: any) => {
              const r = er?.data || {};
              this.orders.update(list => list.map(o => o.id === order.id
                ? { ...o, confirmation_emails: [...(o.confirmation_emails || []), { batch_id: r.batch_id || '', sent_at: r.sent_at || new Date().toISOString(), recipient_email: c.email! }] }
                : o));
              this.messageService.add({ severity: 'success', summary: 'Email', detail: `Confirmation email sent to ${c.email}` });
              this.messageSent.emit({
                id: `order-mail-${order.id}-${Date.now()}`, sender: 'system', sender_name: 'System',
                content: `📧 Sent order confirmation #${order.order_number} to ${c.email}`,
                timestamp: new Date().toISOString(), message_type: 'text', delivery_status: 'sent',
              } as TelegramMessage);
            },
            error: () => this.messageService.add({ severity: 'warn', summary: 'Email', detail: 'Order created but email failed' }),
          });
        }
      },
      error: (err: any) => {
        this.placingOrder.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.detail || 'Could not create order' });
      },
    });
  }

  /** Dialog reports a successful send. Append a system message into the
   *  thread (via parent) and refresh the order's confirmation badge. */
  onConfirmationSent(result: OrderConfirmationResult): void {
    const order = this.dialogOrder;
    this.dialogOrder = null;
    if (!order) return;

    // Update local badge count without round-tripping the list.
    this.orders.update(list => list.map(o => o.id === order.id
      ? {
          ...o,
          confirmation_emails: [
            ...(o.confirmation_emails || []),
            {
              batch_id: result.batch_id || '',
              sent_at: result.sent_at || new Date().toISOString(),
              recipient_email: result.recipient_email,
            },
          ],
        }
      : o,
    ));

    // Build a thread system message (sender='system' so it doesn't count
    // against agent response-time metrics).
    const when = result.sent_at || new Date().toISOString();
    const summary = `📧 Sent order confirmation #${order.order_number} to ${result.recipient_email}`;
    this.messageSent.emit({
      id: `order-confirm-${order.id}-${Date.now()}`,
      sender: 'system',
      sender_name: 'System',
      content: summary,
      timestamp: when,
      message_type: 'text',
      delivery_status: 'sent',
    });
  }

  cancelEmail(): void { this.showEmailForm.set(false); this.emailSubject = ''; this.emailContent = ''; this.emailError = ''; }

  sendEmail(): void {
    if (!this.linkedCustomer?.email || !this.emailSubject.trim() || !this.emailContent.trim()) return;
    this.sendingEmail.set(true); this.emailError = '';
    const payload: SendEmailPayload = {
      to_email: this.linkedCustomer.email, to_name: this.linkedCustomer.name,
      subject: this.emailSubject.trim(), content: this.emailContent.trim()
    };
    this.chatService.sendEmailToCustomer(payload).subscribe({
      next: () => { this.sendingEmail.set(false); this.cancelEmail(); },
      error: () => { this.sendingEmail.set(false); this.emailError = 'Failed to send email.'; }
    });
  }

  cancelCreate(): void { this.showCreateForm.set(false); this.createError = ''; this.newCustomer = { name: '', phone: '', email: '', address: '' }; }

  createCustomer(): void {
    if (!this.newCustomer.name.trim() || !this._conversation?.id) return;
    this.creatingCustomer.set(true); this.createError = '';
    this.chatService.createRetailCustomer({ ...this.newCustomer, name: this.newCustomer.name.trim() }).subscribe({
      next: (res) => {
        const created = res.data;
        this.chatService.linkConversationToCustomer(this._conversation!.id!, created.id).subscribe({
          next: () => {
            this.linkedCustomer = created;
            this.creatingCustomer.set(false);
            this.cancelCreate();
            this.searchKeyword = ''; this.searchResults = [];
            this.customerLinked.emit(created);
            this._resetTabState();
          },
          error: () => { this.creatingCustomer.set(false); this.createError = 'Created but linking failed. Please search and link.'; }
        });
      },
      error: () => { this.creatingCustomer.set(false); this.createError = 'Failed to create customer.'; }
    });
  }

  private loadLinkedCustomer(): void {
    const customerId = this._conversation?.customer_id;
    if (!customerId) { this.linkedCustomer = null; return; }
    this.chatService.getRetailCustomer(customerId).pipe(catchError(() => of(null))).subscribe(res => {
      this.linkedCustomer = res?.data ?? null;
      if (this.linkedCustomer) this.loadCustomerData();
    });
  }

  private _resetTabState(): void {
    this.activeTab.set('profile');
    this.ordersLoaded.set(false); this.historyLoaded.set(false);
    this.orders.set([]); this.chatHistory.set([]);
  }

  private _resetAllForms(): void {
    this.showEmailForm.set(false); this.emailSubject = ''; this.emailContent = ''; this.emailError = '';
    this.showCreateForm.set(false); this.createError = ''; this.newCustomer = { name: '', phone: '', email: '', address: '' };
    this.linkError = ''; this.searchKeyword = ''; this.searchResults = [];
    this._resetTabState();
  }
}
