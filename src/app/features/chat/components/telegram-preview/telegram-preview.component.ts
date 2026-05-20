import {
  Component, Input, OnChanges, SimpleChanges, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  TelegramRichTemplate, TelegramTemplatePayload,
  TelegramInlineButton, TelegramReplyButton
} from '../../models/chat.model';

@Component({
  selector: 'app-telegram-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tg-preview-host">
      <div class="tg-phone-frame">
        <!-- Chat background -->
        <div class="tg-bg">
          <!-- Message bubble area -->
          <div class="tg-message-wrap">

            <!-- ── text ───────────────────────────────────────── -->
            <ng-container *ngIf="mt === 'text'">
              <div class="tg-bubble tg-bubble--out">
                <span class="tg-text" *ngIf="p.parse_mode === 'HTML' || p.parse_mode === 'MarkdownV2' || p.parse_mode === 'Markdown'"
                      [innerHTML]="safeText"></span>
                <span class="tg-text tg-text--plain" *ngIf="!p.parse_mode">{{ p.text }}</span>
              </div>
            </ng-container>

            <!-- ── photo ──────────────────────────────────────── -->
            <ng-container *ngIf="mt === 'photo' || mt === 'animation' || mt === 'sticker'">
              <div class="tg-bubble tg-bubble--media tg-bubble--out">
                <div class="tg-media-wrap">
                  <img *ngIf="p.media_url" [src]="p.media_url" class="tg-img" alt="preview"
                       (error)="onImgError($event)" />
                  <div *ngIf="!p.media_url" class="tg-img-placeholder">
                    <i class="pi pi-image"></i>
                    <span>{{ mt === 'sticker' ? 'Sticker' : mt === 'animation' ? 'GIF' : 'Photo' }}</span>
                  </div>
                </div>
                <div *ngIf="p.caption" class="tg-caption" [innerHTML]="safeCaption"></div>
              </div>
            </ng-container>

            <!-- ── video ──────────────────────────────────────── -->
            <ng-container *ngIf="mt === 'video'">
              <div class="tg-bubble tg-bubble--media tg-bubble--out">
                <div class="tg-media-wrap tg-video-placeholder">
                  <i class="pi pi-play-circle"></i>
                  <span>Video</span>
                </div>
                <div *ngIf="p.caption" class="tg-caption" [innerHTML]="safeCaption"></div>
              </div>
            </ng-container>

            <!-- ── audio / voice ──────────────────────────────── -->
            <ng-container *ngIf="mt === 'audio' || mt === 'voice'">
              <div class="tg-bubble tg-bubble--out tg-audio-bubble">
                <div class="tg-audio-icon"><i class="pi pi-volume-up"></i></div>
                <div class="tg-audio-bar">
                  <div class="tg-waveform"></div>
                  <span class="tg-audio-dur">0:00</span>
                </div>
              </div>
            </ng-container>

            <!-- ── document ───────────────────────────────────── -->
            <ng-container *ngIf="mt === 'document'">
              <div class="tg-bubble tg-bubble--out tg-doc-bubble">
                <div class="tg-doc-icon"><i class="pi pi-file"></i></div>
                <div class="tg-doc-info">
                  <span class="tg-doc-name">{{ p.caption || 'Document' }}</span>
                  <span class="tg-doc-size">File</span>
                </div>
              </div>
            </ng-container>

            <!-- ── location ───────────────────────────────────── -->
            <ng-container *ngIf="mt === 'location'">
              <div class="tg-bubble tg-bubble--media tg-bubble--out">
                <div class="tg-location-card">
                  <div class="tg-map-placeholder"><i class="pi pi-map-marker"></i></div>
                  <div class="tg-location-info">
                    <span class="tg-location-title">📍 Location</span>
                    <span class="tg-location-coords" *ngIf="p.latitude">{{ p.latitude | number:'1.4-4' }}, {{ p.longitude | number:'1.4-4' }}</span>
                  </div>
                </div>
              </div>
            </ng-container>

            <!-- ── venue ──────────────────────────────────────── -->
            <ng-container *ngIf="mt === 'venue'">
              <div class="tg-bubble tg-bubble--media tg-bubble--out">
                <div class="tg-location-card">
                  <div class="tg-map-placeholder"><i class="pi pi-map-marker"></i></div>
                  <div class="tg-location-info">
                    <span class="tg-location-title">📍 {{ p.venue_title || 'Venue' }}</span>
                    <span class="tg-location-coords">{{ p.address }}</span>
                  </div>
                </div>
              </div>
            </ng-container>

            <!-- ── contact ────────────────────────────────────── -->
            <ng-container *ngIf="mt === 'contact'">
              <div class="tg-bubble tg-bubble--out tg-contact-bubble">
                <div class="tg-contact-avatar">{{ (p.first_name || 'C').charAt(0) }}</div>
                <div class="tg-contact-info">
                  <span class="tg-contact-name">{{ p.first_name }} {{ p.last_name }}</span>
                  <span class="tg-contact-phone">{{ p.phone_number }}</span>
                </div>
              </div>
            </ng-container>

            <!-- ── poll ───────────────────────────────────────── -->
            <ng-container *ngIf="mt === 'poll'">
              <div class="tg-bubble tg-bubble--out tg-poll-bubble">
                <div class="tg-poll-question">{{ p.question }}</div>
                <div class="tg-poll-options">
                  <div *ngFor="let opt of (p.poll_options || [])" class="tg-poll-option">
                    <div class="tg-poll-option-radio"></div>
                    <div class="tg-poll-option-content">
                      <span class="tg-poll-option-text">{{ opt.text }}</span>
                      <div class="tg-poll-bar">
                        <div class="tg-poll-bar-fill" style="width:0%"></div>
                      </div>
                      <span class="tg-poll-pct">0%</span>
                    </div>
                  </div>
                </div>
                <div class="tg-poll-footer">
                  {{ p.is_anonymous !== false ? 'Anonymous' : 'Public' }} · {{ p.poll_type === 'quiz' ? 'Quiz' : 'Regular poll' }}
                </div>
              </div>
            </ng-container>

            <!-- ── dice ───────────────────────────────────────── -->
            <ng-container *ngIf="mt === 'dice'">
              <div class="tg-bubble tg-bubble--out tg-dice-bubble">
                <span class="tg-dice-emoji">{{ p.dice_emoji || '🎲' }}</span>
                <span class="tg-dice-label">Random</span>
              </div>
            </ng-container>

            <!-- ── media_group ────────────────────────────────── -->
            <ng-container *ngIf="mt === 'media_group'">
              <div class="tg-media-group">
                <div *ngFor="let item of (p.media_group || [])" class="tg-mg-item">
                  <img *ngIf="item.media" [src]="item.media" class="tg-mg-img" alt=""
                       (error)="onImgError($event)" />
                  <div *ngIf="!item.media" class="tg-mg-placeholder"><i class="pi pi-image"></i></div>
                </div>
              </div>
            </ng-container>

            <!-- ── invoice ────────────────────────────────────── -->
            <ng-container *ngIf="mt === 'invoice'">
              <div class="tg-bubble tg-bubble--out tg-invoice-bubble">
                <img *ngIf="p.invoice_photo_url" [src]="p.invoice_photo_url" class="tg-invoice-img" alt="" />
                <div class="tg-invoice-title">🧾 {{ p.invoice_title }}</div>
                <div *ngIf="p.invoice_description" class="tg-invoice-desc">{{ p.invoice_description }}</div>
                <div class="tg-invoice-prices">
                  <div *ngFor="let price of (p.invoice_prices || [])" class="tg-invoice-price-row">
                    <span>{{ price.label }}</span>
                    <span>{{ price.amount / 100 | number:'1.0-0' }} {{ p.invoice_currency }}</span>
                  </div>
                  <div class="tg-invoice-total" *ngIf="(p.invoice_prices || []).length > 0">
                    <span>Total</span>
                    <span>{{ invoiceTotal | number:'1.0-0' }} {{ p.invoice_currency }}</span>
                  </div>
                </div>
                <button class="tg-pay-btn">💳 Pay {{ invoiceTotal | number:'1.0-0' }} {{ p.invoice_currency }}</button>
              </div>
            </ng-container>

            <!-- ── forward ────────────────────────────────────── -->
            <ng-container *ngIf="mt === 'forward'">
              <div class="tg-bubble tg-bubble--out">
                <div class="tg-forward-label">↩️ Forwarded message</div>
                <span class="tg-text tg-text--plain">From chat {{ p.from_chat_id }}</span>
              </div>
            </ng-container>

            <!-- ── unknown fallback ───────────────────────────── -->
            <ng-container *ngIf="!knownTypes.has(mt)">
              <div class="tg-bubble tg-bubble--out">
                <span class="tg-text tg-text--plain tg-text--muted">{{ mt }} template</span>
              </div>
            </ng-container>

            <!-- ── Inline keyboard (below any bubble) ──────────── -->
            <div *ngIf="p.keyboard?.type === 'inline_keyboard' && p.keyboard?.inline_keyboard?.length" class="tg-inline-kb">
              <div *ngFor="let row of p.keyboard!.inline_keyboard" class="tg-kb-row">
                <button *ngFor="let btn of row" class="tg-kb-btn" type="button">
                  <span class="tg-kb-btn-icon">
                    {{ btn.url ? '🔗' : btn.web_app_url ? '🌐' : '💬' }}
                  </span>
                  {{ btn.text }}
                </button>
              </div>
            </div>

            <!-- ── Reply keyboard ──────────────────────────────── -->
            <div *ngIf="p.keyboard?.type === 'reply_keyboard' && p.keyboard?.keyboard?.length" class="tg-reply-kb">
              <div class="tg-reply-kb-label">⌨️ Reply keyboard</div>
              <div *ngFor="let row of p.keyboard!.keyboard" class="tg-kb-row">
                <button *ngFor="let btn of row" class="tg-reply-btn" type="button">{{ btn.text }}</button>
              </div>
            </div>

            <!-- keyboard remove / force reply -->
            <div *ngIf="p.keyboard?.type === 'reply_keyboard_remove'" class="tg-kb-label">⌨️ Keyboard removed</div>
            <div *ngIf="p.keyboard?.type === 'force_reply'" class="tg-kb-label">↩️ Force reply</div>
          </div>
        </div>
      </div>

      <!-- Template meta below frame -->
      <div class="tg-meta" *ngIf="template">
        <span class="tg-meta-type">{{ template.message_type }}</span>
        <span class="tg-meta-cat">{{ template.category }}</span>
        <span *ngIf="template.is_builtin" class="tg-meta-builtin">🔒 Built-in</span>
      </div>
    </div>
  `,
  styles: [`
    .tg-preview-host {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .tg-phone-frame {
      width: 100%;
      max-width: 340px;
      border-radius: 16px;
      overflow: hidden;
      border: 1.5px solid #e2e8f0;
      box-shadow: 0 2px 12px rgba(0,0,0,.08);
    }

    .tg-bg {
      background: #dfe3f0 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23dfe3f0'/%3E%3C/svg%3E");
      padding: 0.75rem;
      min-height: 120px;
    }

    .tg-message-wrap {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }

    /* Bubble */
    .tg-bubble {
      max-width: 88%;
      background: #effdde;
      border-radius: 16px 4px 16px 16px;
      padding: 8px 12px;
      box-shadow: 0 1px 2px rgba(0,0,0,.12);
      font-size: 0.875rem;
      color: #0f172a;
      line-height: 1.5;
      word-break: break-word;
    }

    .tg-bubble--media {
      padding: 4px;
      border-radius: 12px 4px 12px 12px;
      overflow: hidden;
      background: #effdde;
    }

    /* Text */
    .tg-text { display: block; }
    .tg-text--plain { white-space: pre-wrap; }
    .tg-text--muted { color: #94a3b8; font-style: italic; }

    /* Media */
    .tg-media-wrap { position: relative; }
    .tg-img {
      width: 100%;
      max-height: 200px;
      object-fit: cover;
      border-radius: 10px 2px 10px 10px;
      display: block;
    }
    .tg-img-placeholder {
      width: 100%;
      height: 140px;
      background: #cbd5e1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      color: #64748b;
      gap: 6px;
      font-size: 0.75rem;
      i { font-size: 2rem; }
    }
    .tg-video-placeholder {
      width: 100%;
      height: 140px;
      background: #1e293b;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      color: rgba(255,255,255,.7);
      gap: 6px;
      font-size: 0.75rem;
      i { font-size: 2.5rem; color: white; }
    }
    .tg-caption {
      padding: 6px 8px 4px;
      font-size: 0.82rem;
      color: #0f172a;
      line-height: 1.4;
    }

    /* Audio */
    .tg-audio-bubble {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
    }
    .tg-audio-icon { color: #2563eb; font-size: 1.25rem; }
    .tg-audio-bar { display: flex; align-items: center; gap: 8px; flex: 1; }
    .tg-waveform {
      flex: 1; height: 24px;
      background: repeating-linear-gradient(90deg, #93c5fd 0, #93c5fd 2px, transparent 2px, transparent 4px);
      border-radius: 2px; opacity: 0.6;
    }
    .tg-audio-dur { font-size: 0.7rem; color: #64748b; }

    /* Document */
    .tg-doc-bubble { display: flex; align-items: center; gap: 10px; }
    .tg-doc-icon { width: 36px; height: 36px; background: #dbeafe; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #2563eb; font-size: 1.1rem; flex-shrink: 0; }
    .tg-doc-info { display: flex; flex-direction: column; }
    .tg-doc-name { font-size: 0.82rem; font-weight: 500; }
    .tg-doc-size { font-size: 0.7rem; color: #64748b; }

    /* Location */
    .tg-location-card { display: flex; align-items: center; gap: 10px; }
    .tg-map-placeholder { width: 48px; height: 48px; background: #e0f2fe; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #0284c7; font-size: 1.4rem; flex-shrink: 0; }
    .tg-location-info { display: flex; flex-direction: column; }
    .tg-location-title { font-size: 0.85rem; font-weight: 600; }
    .tg-location-coords { font-size: 0.72rem; color: #64748b; }

    /* Contact */
    .tg-contact-bubble { display: flex; align-items: center; gap: 10px; }
    .tg-contact-avatar { width: 40px; height: 40px; background: #7c3aed; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1rem; flex-shrink: 0; }
    .tg-contact-info { display: flex; flex-direction: column; }
    .tg-contact-name { font-size: 0.85rem; font-weight: 600; }
    .tg-contact-phone { font-size: 0.75rem; color: #2563eb; }

    /* Poll */
    .tg-poll-bubble { min-width: 200px; }
    .tg-poll-question { font-weight: 700; font-size: 0.9rem; margin-bottom: 10px; }
    .tg-poll-options { display: flex; flex-direction: column; gap: 8px; }
    .tg-poll-option { display: flex; align-items: flex-start; gap: 8px; }
    .tg-poll-option-radio { width: 16px; height: 16px; border-radius: 50%; border: 2px solid #94a3b8; flex-shrink: 0; margin-top: 2px; }
    .tg-poll-option-content { flex: 1; display: flex; flex-direction: column; gap: 3px; }
    .tg-poll-option-text { font-size: 0.82rem; }
    .tg-poll-bar { height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden; }
    .tg-poll-bar-fill { height: 100%; background: #3b82f6; border-radius: 2px; transition: width 0.3s; }
    .tg-poll-pct { font-size: 0.68rem; color: #94a3b8; }
    .tg-poll-footer { margin-top: 10px; font-size: 0.7rem; color: #94a3b8; border-top: 1px solid rgba(0,0,0,.07); padding-top: 6px; }

    /* Dice */
    .tg-dice-bubble { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 14px 20px; }
    .tg-dice-emoji { font-size: 2.5rem; }
    .tg-dice-label { font-size: 0.7rem; color: #94a3b8; }

    /* Media group */
    .tg-media-group { display: flex; gap: 3px; max-width: 300px; overflow-x: auto; border-radius: 10px; overflow: hidden; }
    .tg-mg-item { flex-shrink: 0; }
    .tg-mg-img { width: 90px; height: 90px; object-fit: cover; display: block; }
    .tg-mg-placeholder { width: 90px; height: 90px; background: #cbd5e1; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 1.5rem; }

    /* Invoice */
    .tg-invoice-bubble { min-width: 220px; }
    .tg-invoice-img { width: 100%; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 8px; }
    .tg-invoice-title { font-weight: 700; font-size: 0.9rem; margin-bottom: 4px; }
    .tg-invoice-desc { font-size: 0.78rem; color: #64748b; margin-bottom: 10px; line-height: 1.4; }
    .tg-invoice-prices { border-top: 1px solid rgba(0,0,0,.08); padding-top: 8px; display: flex; flex-direction: column; gap: 4px; }
    .tg-invoice-price-row { display: flex; justify-content: space-between; font-size: 0.78rem; color: #475569; }
    .tg-invoice-total { display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 700; border-top: 1px solid rgba(0,0,0,.08); padding-top: 6px; margin-top: 2px; }
    .tg-pay-btn { margin-top: 10px; width: 100%; padding: 8px; background: #2563eb; color: white; border: none; border-radius: 8px; font-size: 0.82rem; font-weight: 600; cursor: pointer; }

    /* Forward */
    .tg-forward-label { font-size: 0.72rem; color: #64748b; border-left: 2px solid #94a3b8; padding-left: 6px; margin-bottom: 4px; }

    /* Inline keyboard */
    .tg-inline-kb { width: 100%; max-width: 300px; display: flex; flex-direction: column; gap: 4px; }
    .tg-kb-row { display: flex; gap: 4px; }
    .tg-kb-btn {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 4px;
      padding: 6px 8px; border-radius: 8px; border: 1px solid #e2e8f0;
      background: #fff; font-size: 0.75rem; color: #334155; cursor: pointer;
      box-shadow: 0 1px 2px rgba(0,0,0,.06); white-space: nowrap;
      &:hover { background: #f8fafc; }
    }
    .tg-kb-btn-icon { font-size: 0.7rem; }

    /* Reply keyboard */
    .tg-reply-kb { width: 100%; max-width: 300px; background: #e8eaf0; border-radius: 10px; padding: 6px; display: flex; flex-direction: column; gap: 4px; }
    .tg-reply-kb-label { font-size: 0.7rem; color: #64748b; padding: 2px 4px; }
    .tg-reply-btn { flex: 1; padding: 7px 10px; border-radius: 6px; border: none; background: #fff; font-size: 0.78rem; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,.06); }

    /* Label */
    .tg-kb-label { font-size: 0.72rem; color: #94a3b8; text-align: center; padding: 4px; }

    /* Meta below frame */
    .tg-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; justify-content: center; }
    .tg-meta-type { background: #dbeafe; color: #1d4ed8; font-size: 0.68rem; font-weight: 600; padding: 2px 8px; border-radius: 9999px; text-transform: uppercase; }
    .tg-meta-cat { background: #f0fdf4; color: #16a34a; font-size: 0.68rem; padding: 2px 8px; border-radius: 9999px; }
    .tg-meta-builtin { font-size: 0.68rem; color: #94a3b8; }

    /* Global html content */
    :host ::ng-deep .tg-text strong, :host ::ng-deep .tg-caption strong { font-weight: 700; }
    :host ::ng-deep .tg-text em, :host ::ng-deep .tg-caption em { font-style: italic; }
    :host ::ng-deep .tg-text a, :host ::ng-deep .tg-caption a { color: #2563eb; text-decoration: underline; }
    :host ::ng-deep .tg-text code, :host ::ng-deep .tg-caption code { font-family: monospace; background: rgba(0,0,0,.06); padding: 1px 4px; border-radius: 3px; font-size: 0.85em; }
    :host ::ng-deep .tg-text u, :host ::ng-deep .tg-caption u { text-decoration: underline; }
    :host ::ng-deep .tg-text s, :host ::ng-deep .tg-caption s { text-decoration: line-through; }
  `]
})
export class TelegramPreviewComponent implements OnChanges {
  private sanitizer = inject(DomSanitizer);

  @Input() template: TelegramRichTemplate | null = null;
  @Input() variables: Record<string, string> = {};

  p: TelegramTemplatePayload = {};
  mt = '';
  safeText: SafeHtml = '';
  safeCaption: SafeHtml = '';
  invoiceTotal = 0;

  readonly knownTypes = new Set([
    'text', 'photo', 'video', 'audio', 'voice', 'document',
    'animation', 'sticker', 'location', 'venue', 'contact',
    'poll', 'dice', 'media_group', 'invoice', 'forward'
  ]);

  ngOnChanges(_changes: SimpleChanges): void {
    if (!this.template) { this.p = {}; this.mt = ''; return; }
    this.mt = this.template.message_type || 'text';
    this.p = this._renderPayload(this.template.payload || {}, this.variables);
    this.safeText = this._safeHtml(this.p.text || '', this.p.parse_mode);
    this.safeCaption = this._safeHtml(this.p.caption || '', this.p.parse_mode || 'HTML');
    this.invoiceTotal = (this.p.invoice_prices || []).reduce((s, i) => s + i.amount, 0) / 100;
  }

  onImgError(e: Event): void {
    const img = e.target as HTMLImageElement;
    img.style.display = 'none';
    const placeholder = img.parentElement?.querySelector('.tg-img-placeholder') as HTMLElement;
    if (placeholder) placeholder.style.display = 'flex';
  }

  private _renderPayload(payload: TelegramTemplatePayload, vars: Record<string, string>): TelegramTemplatePayload {
    const fill = (s?: string) => s ? Object.entries(vars).reduce(
      (t, [k, v]) => t.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), v || `{{${k}}}`), s
    ) : s;
    return {
      ...payload,
      text: fill(payload.text),
      caption: fill(payload.caption),
      question: fill(payload.question),
      venue_title: fill(payload.venue_title),
      address: fill(payload.address),
      invoice_title: fill(payload.invoice_title),
      invoice_description: fill(payload.invoice_description),
      first_name: fill(payload.first_name),
      last_name: fill(payload.last_name),
    };
  }

  private _safeHtml(text: string, parseMode?: string): SafeHtml {
    if (!text) return '';
    let html = text;
    if (parseMode === 'HTML') {
      html = html
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/&lt;b&gt;(.*?)&lt;\/b&gt;/gs, '<strong>$1</strong>')
        .replace(/&lt;i&gt;(.*?)&lt;\/i&gt;/gs, '<em>$1</em>')
        .replace(/&lt;u&gt;(.*?)&lt;\/u&gt;/gs, '<u>$1</u>')
        .replace(/&lt;s&gt;(.*?)&lt;\/s&gt;/gs, '<s>$1</s>')
        .replace(/&lt;code&gt;(.*?)&lt;\/code&gt;/gs, '<code>$1</code>')
        .replace(/&lt;a href="(.*?)"&gt;(.*?)&lt;\/a&gt;/gs, '<a href="$1" target="_blank">$2</a>')
        .replace(/\n/g, '<br>');
    } else if (parseMode === 'Markdown' || parseMode === 'MarkdownV2') {
      html = html
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
        .replace(/__(.*?)__/g, '<u>$1</u>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        .replace(/~~(.*?)~~/g, '<s>$1</s>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
        .replace(/\n/g, '<br>');
    } else {
      html = html.replace(/\n/g, '<br>');
    }
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
