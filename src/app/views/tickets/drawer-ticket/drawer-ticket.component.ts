import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { TagModule } from 'primeng/tag';
import { GemClientesTicketDetail } from '../../../core/models/gem-clientes-ticket.model';
import { GemClientesTicketsService } from '../../../core/services/gem-clientes-tickets.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-drawer-ticket',
  standalone: true,
  imports: [ButtonModule, CommonModule, DatePipe, DrawerModule, FormsModule, TagModule],
  templateUrl: './drawer-ticket.component.html',
  styles: `
    .ticket-drawer-content { min-height: 100%; }
    .ticket-event { border-left: 3px solid var(--bs-primary); }
    @media screen and (max-width: 640px) { ::ng-deep .ticket-drawer { width: 100vw !important; } }
    @media screen and (max-width: 960px) { ::ng-deep .ticket-drawer { width: 80vw !important; } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawerTicketComponent {
  readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly service = inject(GemClientesTicketsService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() visible = false;
  @Input() ticketId: number | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() externalReferenceChanged = new EventEmitter<string | null>();

  ticket: GemClientesTicketDetail | null = null;
  loading = false;
  error: string | null = null;
  commentDraft = '';
  commentLoading = false;
  commentError: string | null = null;
  commentFiles: File[] = [];
  externalReferenceDraft = '';
  externalReferenceLoading = false;
  externalReferenceError: string | null = null;
  private loadedKey: number | null = null;
  @ViewChild('commentFileInput') private commentFileInput?: ElementRef<HTMLInputElement>;

  ngOnChanges(): void {
    if (!this.visible || this.ticketId === null || this.loadedKey === this.ticketId) return;
    this.loadedKey = this.ticketId;
    this.ticket = null;
    this.error = null;
    this.loading = true;
    this.service.getTicket(this.ticketId).pipe(finalize(() => {
      this.loading = false;
      this.cdr.detectChanges();
    })).subscribe({
      next: (ticket) => { this.ticket = ticket; this.externalReferenceDraft = ticket.externalReference ?? ''; this.cdr.detectChanges(); },
      error: () => { this.error = 'No pudimos cargar el detalle del ticket. Intentá nuevamente.'; this.cdr.detectChanges(); },
    });
  }

  updateExternalReference(): void {
    if (!this.ticket || this.externalReferenceLoading) return;
    const reference = this.externalReferenceDraft.trim() || null;
    this.externalReferenceLoading = true;
    this.externalReferenceError = null;
    this.service.updateExternalReference(this.ticket.id, reference).pipe(finalize(() => {
      this.externalReferenceLoading = false;
      this.cdr.detectChanges();
    })).subscribe({
      next: (updated) => {
        this.ticket = { ...this.ticket!, externalReference: updated.externalReference ?? reference };
        this.externalReferenceDraft = this.ticket.externalReference ?? '';
        this.externalReferenceChanged.emit(this.ticket.externalReference);
        this.cdr.detectChanges();
      },
      error: () => { this.externalReferenceError = 'No pudimos actualizar la referencia. Intentá nuevamente.'; this.cdr.detectChanges(); },
    });
  }

  statusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    return ({ INGRESADO: 'info', EN_REVISION: 'info', EN_DESARROLLO: 'warn', RESUELTO: 'success', CERRADO: 'secondary', RECHAZADO: 'danger' } as Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'>)[status] ?? 'secondary';
  }

  addComment(): void {
    const text = this.commentDraft.trim();
    if (!this.ticket || !text || this.commentLoading) return;
    this.commentLoading = true;
    this.commentError = null;
    const request = this.commentFiles.length
      ? this.service.addComment(this.ticket.id, text, this.commentFiles)
      : this.service.addComment(this.ticket.id, text);
    request.pipe(finalize(() => {
      this.commentLoading = false;
      this.cdr.detectChanges();
    })).subscribe({
      next: (comment) => {
        this.ticket = { ...this.ticket!, comments: [...this.ticket!.comments, comment] };
        this.commentDraft = '';
        this.commentFiles = [];
        if (this.commentFileInput) this.commentFileInput.nativeElement.value = '';
        this.cdr.detectChanges();
      },
      error: () => { this.commentError = 'No pudimos enviar el comentario. Intentá nuevamente.'; this.cdr.detectChanges(); },
    });
  }

  onCommentFiles(event: Event): void { this.commentFiles = Array.from((event.target as HTMLInputElement).files ?? []); }

  close(): void { this.closed.emit(); }
}
