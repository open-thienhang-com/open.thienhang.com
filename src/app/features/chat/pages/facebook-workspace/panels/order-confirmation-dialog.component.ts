import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
    Component, EventEmitter, Input, OnInit, Output, inject, signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
// PrimeNG v18+ exports `InputTextarea` (was `InputTextareaModule`); we only
// use the styling via `class="ocd-input"` so no module import is required.
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { ChatService } from '../../../services/chat.service';
import {
    CustomerOrder,
    CustomerSummary,
    OrderConfirmationResult,
} from '../../../models/chat.model';

/**
 * Modal that previews and dispatches the order-confirmation email for one
 * (customer, order) pair. Backend renders the HTML; we show it in an iframe
 * to keep the email's inline CSS isolated from the workspace styles.
 *
 * Inputs:
 *   - customer: linked retail customer (must have `email`)
 *   - order: the order row the agent clicked "Gửi mail xác nhận" on
 *   - conversationId / agentName: optional audit metadata
 *
 * Outputs:
 *   - sent: fires with the backend result once dispatch succeeds
 *   - cancelled: agent dismissed the dialog without sending
 */
@Component({
    selector: 'app-order-confirmation-dialog',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, DialogModule],
    template: `
<p-dialog
    [(visible)]="visible"
    [modal]="true"
    [closable]="!sending()"
    (onHide)="cancel()"
    [style]="{ width: '640px', maxWidth: '95vw' }"
    header="Gửi email xác nhận đơn hàng">

    <div class="ocd-section">
        <div class="ocd-row">
            <span class="ocd-label">Đơn hàng</span>
            <span class="ocd-val"><strong>#{{ order.order_number }}</strong> · {{ order.item_count }} sản phẩm · {{ order.total_amount | currency:'VND':'symbol':'1.0-0' }}</span>
        </div>
        <div class="ocd-row">
            <span class="ocd-label">Tới</span>
            <span class="ocd-val">{{ customer.email }}</span>
        </div>
    </div>

    <div class="ocd-section">
        <label class="ocd-label-block" for="ocd-subject">Tiêu đề</label>
        <input id="ocd-subject" type="text" class="ocd-input" [(ngModel)]="subject" name="ocdSubject" />

        <label class="ocd-label-block" for="ocd-note" style="margin-top:.65rem">Lời nhắn từ bạn (tuỳ chọn)</label>
        <textarea id="ocd-note" rows="3" class="ocd-input"
                  [(ngModel)]="agentNote"
                  (ngModelChange)="noteChanged$.next($event)"
                  name="ocdNote"
                  placeholder="Ví dụ: Đơn của bạn sẽ được giao trong 2-3 ngày tới…"></textarea>
    </div>

    <div class="ocd-section">
        <div class="ocd-label-block" style="display:flex;align-items:center;gap:.4rem">
            Xem trước email
            <span *ngIf="previewLoading()" style="color:#94a3b8;font-size:.7rem">
                <i class="pi pi-spin pi-spinner"></i> đang cập nhật…
            </span>
        </div>
        <iframe
            class="ocd-preview"
            [srcdoc]="previewHtml() || previewPlaceholder"
            sandbox="allow-same-origin"></iframe>
    </div>

    <span *ngIf="cooldownRemaining() > 0" class="ocd-cooldown">
        <i class="pi pi-clock"></i>
        Vui lòng chờ {{ cooldownRemaining() }}s trước khi gửi lại.
    </span>
    <span *ngIf="errorMessage()" class="ocd-error">{{ errorMessage() }}</span>

    <ng-template pTemplate="footer">
        <button type="button" pButton class="p-button-text" label="Hủy"
                [disabled]="sending()" (click)="cancel()"></button>
        <button type="button" pButton class="p-button-primary"
                [label]="sending() ? 'Đang gửi…' : 'Gửi'"
                [icon]="sending() ? 'pi pi-spin pi-spinner' : 'pi pi-send'"
                [disabled]="sending() || cooldownRemaining() > 0 || !customer.email"
                (click)="send()"></button>
    </ng-template>
</p-dialog>
`,
    styles: [`
.ocd-section { margin-bottom: 1rem; }
.ocd-row { display: flex; gap: .5rem; font-size: .85rem; padding: .25rem 0; }
.ocd-label { color: #64748b; min-width: 80px; font-weight: 500; }
.ocd-val { color: #0f172a; flex: 1; }
.ocd-label-block { display: block; font-size: .75rem; color: #64748b; font-weight: 600; margin-bottom: .3rem; text-transform: uppercase; letter-spacing: .04em; }
.ocd-input { width: 100%; padding: .5rem .65rem; border: 1px solid #e2e8f0; border-radius: 6px; font: inherit; font-size: .85rem; outline: none; box-sizing: border-box; resize: vertical; }
.ocd-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.12); }
.ocd-preview { width: 100%; height: 360px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; }
.ocd-cooldown { display: inline-flex; align-items: center; gap: .35rem; color: #d97706; font-size: .8rem; margin-right: auto; }
.ocd-error { display: block; color: #ef4444; font-size: .8rem; margin-top: .25rem; }
`],
})
export class OrderConfirmationDialogComponent implements OnInit {
    @Input({ required: true }) customer!: CustomerSummary;
    @Input({ required: true }) order!: CustomerOrder;
    @Input() conversationId?: string;
    @Input() agentName?: string;

    @Output() sent = new EventEmitter<OrderConfirmationResult>();
    @Output() cancelled = new EventEmitter<void>();

    private chatService = inject(ChatService);

    visible = true;
    subject = '';
    agentNote = '';

    readonly previewHtml = signal<string>('');
    readonly previewLoading = signal(false);
    readonly previewPlaceholder =
        '<div style="font-family:sans-serif;padding:24px;color:#94a3b8">Đang tải xem trước…</div>';
    readonly previewErrorHtml =
        '<div style="font-family:sans-serif;padding:24px;color:#ef4444">Không thể tải xem trước.</div>';
    readonly sending = signal(false);
    readonly errorMessage = signal<string>('');
    readonly cooldownRemaining = signal(0);

    readonly noteChanged$ = new Subject<string>();
    private noteSub?: Subscription;
    private cooldownTimer: ReturnType<typeof setInterval> | null = null;

    ngOnInit(): void {
        this.subject = `Xác nhận đơn hàng #${this.order.order_number} — Thienhang`;
        this.loadPreview();
        this.noteSub = this.noteChanged$.pipe(debounceTime(500)).subscribe(() => this.loadPreview());
    }

    cancel(): void {
        if (this.sending()) return;
        this.visible = false;
        this.cleanup();
        this.cancelled.emit();
    }

    send(): void {
        if (this.sending() || this.cooldownRemaining() > 0) return;
        this.sending.set(true);
        this.errorMessage.set('');

        this.chatService.sendOrderConfirmationEmail({
            order_id: this.order.id || (this.order as any)._id,
            customer_id: this.customer.id,
            subject_override: this.subject.trim() || undefined,
            agent_note: this.agentNote.trim() || undefined,
            agent_name: this.agentName,
            conversation_id: this.conversationId,
        }).subscribe({
            next: (res) => {
                this.sending.set(false);
                if (res?.data) {
                    this.visible = false;
                    this.cleanup();
                    this.sent.emit(res.data);
                }
            },
            error: (err: HttpErrorResponse) => {
                this.sending.set(false);
                if (err.status === 429) {
                    const retry = Number(err.headers?.get?.('Retry-After')) || 60;
                    this.startCooldown(retry);
                    this.errorMessage.set('');
                    return;
                }
                const detail = (err.error as { detail?: string; message?: string } | undefined);
                this.errorMessage.set(detail?.detail || detail?.message || 'Không gửi được email. Thử lại sau.');
            },
        });
    }

    private loadPreview(): void {
        if (!this.customer?.id || !this.order?.id) return;
        this.previewLoading.set(true);
        this.chatService.sendOrderConfirmationEmail({
            order_id: this.order.id || (this.order as any)._id,
            customer_id: this.customer.id,
            subject_override: this.subject.trim() || undefined,
            agent_note: this.agentNote.trim() || undefined,
            agent_name: this.agentName,
            conversation_id: this.conversationId,
            preview_only: true,
        }).subscribe({
            next: (res) => {
                this.previewLoading.set(false);
                this.previewHtml.set(res?.data?.html_preview || '');
            },
            error: () => {
                this.previewLoading.set(false);
                this.previewHtml.set(this.previewErrorHtml);
            },
        });
    }

    private startCooldown(seconds: number): void {
        this.cooldownRemaining.set(seconds);
        if (this.cooldownTimer) clearInterval(this.cooldownTimer);
        this.cooldownTimer = setInterval(() => {
            const next = this.cooldownRemaining() - 1;
            if (next <= 0) {
                this.cooldownRemaining.set(0);
                if (this.cooldownTimer) { clearInterval(this.cooldownTimer); this.cooldownTimer = null; }
            } else {
                this.cooldownRemaining.set(next);
            }
        }, 1000);
    }

    private cleanup(): void {
        this.noteSub?.unsubscribe();
        if (this.cooldownTimer) { clearInterval(this.cooldownTimer); this.cooldownTimer = null; }
    }
}
