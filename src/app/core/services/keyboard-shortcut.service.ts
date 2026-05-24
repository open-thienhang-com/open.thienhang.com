import { DestroyRef, Injectable, inject } from '@angular/core';
import { BehaviorSubject, fromEvent, Subscription } from 'rxjs';

export interface ShortcutBinding {
    /** Key combo, e.g. "j", "Shift+J", "Mod+Enter", "g f" (sequence). "Mod" maps to Cmd on macOS, Ctrl elsewhere. */
    key: string;
    /** Short human-readable description shown in help overlay. */
    description: string;
    /** Category for grouping in help overlay. */
    category?: string;
    /** Handler invoked when the shortcut fires. Returning false re-enables default. */
    handler: (event: KeyboardEvent) => void | boolean;
    /** When true, shortcut also fires while focus is inside an input/textarea/contenteditable. */
    allowInInput?: boolean;
}

interface RegisteredShortcut extends ShortcutBinding {
    scope: string;
    id: number;
}

const MOD = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform) ? 'Meta' : 'Control';
const SEQUENCE_TIMEOUT_MS = 1500;

function normaliseKey(combo: string): string {
    return combo
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/mod\+/gi, `${MOD.toLowerCase()}+`);
}

function buildEventKey(event: KeyboardEvent): string {
    const parts: string[] = [];
    if (event.ctrlKey) parts.push('control');
    if (event.metaKey) parts.push('meta');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');
    const key = event.key === ' ' ? 'space' : event.key.toLowerCase();
    if (!['control', 'meta', 'alt', 'shift'].includes(key)) parts.push(key);
    return parts.join('+');
}

function isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (target.isContentEditable) return true;
    return false;
}

@Injectable({ providedIn: 'root' })
export class KeyboardShortcutService {
    private nextId = 1;
    private shortcuts: RegisteredShortcut[] = [];
    private scopeStack: string[] = ['global'];
    private sequenceBuffer = '';
    private sequenceTimer: ReturnType<typeof setTimeout> | null = null;
    private subscription: Subscription | null = null;

    readonly shortcuts$ = new BehaviorSubject<RegisteredShortcut[]>([]);

    constructor() {
        if (typeof document !== 'undefined') {
            this.subscription = fromEvent<KeyboardEvent>(document, 'keydown').subscribe(e =>
                this.handle(e)
            );
        }
    }

    /**
     * Register a shortcut bound to a scope. Call the returned function to unregister.
     * Bindings: register('workspace', { key: 'j', ... })
     */
    register(scope: string, binding: ShortcutBinding): () => void {
        const id = this.nextId++;
        this.shortcuts.push({ ...binding, scope, id });
        this.shortcuts$.next([...this.shortcuts]);
        return () => this.unregister(id);
    }

    /**
     * Register many; unregister all in one call.
     */
    registerMany(scope: string, bindings: ShortcutBinding[]): () => void {
        const dispose = bindings.map(b => this.register(scope, b));
        return () => dispose.forEach(d => d());
    }

    /**
     * Auto-cleanup via DestroyRef from the injection context of the caller.
     */
    registerScoped(scope: string, bindings: ShortcutBinding[]): void {
        const ref = inject(DestroyRef);
        const dispose = this.registerMany(scope, bindings);
        ref.onDestroy(dispose);
    }

    pushScope(scope: string): void {
        this.scopeStack.push(scope);
    }

    popScope(scope: string): void {
        const i = this.scopeStack.lastIndexOf(scope);
        if (i > 0) this.scopeStack.splice(i, 1);
    }

    listForHelp(): RegisteredShortcut[] {
        const active = new Set(this.scopeStack);
        return this.shortcuts.filter(s => s.scope === 'global' || active.has(s.scope));
    }

    private unregister(id: number): void {
        this.shortcuts = this.shortcuts.filter(s => s.id !== id);
        this.shortcuts$.next([...this.shortcuts]);
    }

    private handle(event: KeyboardEvent): void {
        if (event.defaultPrevented) return;

        const eventKey = buildEventKey(event);
        const typing = isTypingTarget(event.target);
        const activeScopes = new Set(this.scopeStack);

        // Sequence buffer (e.g. "g f")
        const isPlainLetter = !event.ctrlKey && !event.metaKey && !event.altKey && /^[a-z]$/.test(eventKey);
        if (isPlainLetter) {
            if (this.sequenceBuffer) {
                const candidate = `${this.sequenceBuffer} ${eventKey}`;
                this.clearSequenceTimer();
                this.sequenceBuffer = '';
                if (this.tryMatch(candidate, typing, activeScopes, event)) return;
            }
        }

        // Direct match
        if (this.tryMatch(eventKey, typing, activeScopes, event)) return;

        // Start sequence buffer on plain letter that *could* lead to a chord
        if (isPlainLetter && !typing) {
            const hasChordStarting = this.shortcuts.some(s =>
                (s.scope === 'global' || activeScopes.has(s.scope)) &&
                normaliseKey(s.key).startsWith(`${eventKey} `)
            );
            if (hasChordStarting) {
                this.sequenceBuffer = eventKey;
                this.startSequenceTimer();
                event.preventDefault();
            }
        }
    }

    private tryMatch(
        key: string,
        typing: boolean,
        activeScopes: Set<string>,
        event: KeyboardEvent
    ): boolean {
        const match = this.shortcuts.find(s => {
            if (s.scope !== 'global' && !activeScopes.has(s.scope)) return false;
            if (typing && !s.allowInInput) return false;
            return normaliseKey(s.key) === key;
        });
        if (!match) return false;
        const result = match.handler(event);
        if (result !== false) event.preventDefault();
        return true;
    }

    private startSequenceTimer(): void {
        this.clearSequenceTimer();
        this.sequenceTimer = setTimeout(() => {
            this.sequenceBuffer = '';
            this.sequenceTimer = null;
        }, SEQUENCE_TIMEOUT_MS);
    }

    private clearSequenceTimer(): void {
        if (this.sequenceTimer) {
            clearTimeout(this.sequenceTimer);
            this.sequenceTimer = null;
        }
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
    }
}
