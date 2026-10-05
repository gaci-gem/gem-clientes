import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TimeAgoComponent } from '../../../components/time-ago/time-ago';
import { GemClientesTicketAttachment, GemClientesTicketComment, GemClientesTicketDetail, validateTicketAttachments, TICKET_ATTACHMENT_ACCEPT } from '../../../core/models/gem-clientes-ticket.model';
import { GemClientesTicketsService } from '../../../core/services/gem-clientes-tickets.service';
import { environment } from '../../../../environments/environment';

interface AttachmentPresentation {
  icon: string;
  type: string;
  size: string;
  href: string;
}

@Component({
  selector: 'app-drawer-ticket',
  standalone: true,
  imports: [ButtonModule, CommonModule, DatePipe, DrawerModule, FormsModule, InputTextModule, TagModule, TimeAgoComponent],
  templateUrl: './drawer-ticket.component.html',
  styles: `
    :host { display: block; height: 100%; min-height: 0; }
    ::ng-deep .ticket-drawer .p-drawer-content { height: 100%; min-height: 0; overflow: hidden; padding: 0 !important; }
    .ticket-drawer-shell { height: 100%; min-height: 0; overflow: hidden; }
    .ticket-drawer-content { min-height: 0; overflow-y: auto; overscroll-behavior: contain; }
    .ticket-description-content { margin-bottom: 0; overflow-wrap: anywhere; word-break: break-word; }
    .comment-item p { overflow-wrap: anywhere; word-break: break-word; }
    .ticket-details-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; margin-top: 0; font-size: .875rem; }
    .ticket-detail-item { min-width: 0; padding: .75rem; border: 1px solid var(--ins-border-color); border-radius: var(--ins-border-radius, .375rem); display: flex; flex-direction: column; justify-content: center; }
    .ticket-detail-item dt { color: var(--ins-secondary-color); font-size: .875rem; font-weight: 600; margin-bottom: .25rem; }
    .ticket-detail-item dd { margin-bottom: 0; overflow-wrap: anywhere; }
    .ticket-reference-editor { min-width: 0; width: 100%; }
    .ticket-reference-editor input { min-width: 0; flex: 1 1 auto; font-size: inherit; }
    .comment-footer { display: flex; align-items: center; gap: .25rem; flex-wrap: wrap; }
    .comment-origin { flex: 0 0 4rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .comment-footer app-time-ago { cursor: pointer; }
    .comment-composer { display: flex; align-items: center; gap: .5rem; }
    .comment-composer input[pInputText] { min-width: 0; flex: 1 1 auto; }
    .attachment-card { display: flex; align-items: center; gap: .75rem; min-width: 0; padding: .625rem .75rem; border: 1px solid var(--ins-border-color); border-radius: var(--ins-border-radius, .375rem); color: inherit; text-decoration: none; }
    .attachment-card:hover, .attachment-card:focus-visible { border-color: var(--ins-primary); background-color: var(--ins-light, rgba(0, 0, 0, .03)); }
    .attachment-icon { flex: 0 0 auto; font-size: 1.25rem; color: var(--ins-primary); }
    .attachment-details { min-width: 0; flex: 1 1 auto; }
    .attachment-name { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .attachment-meta { display: block; color: var(--ins-secondary-color); font-size: .75rem; }
    .attachment-action { flex: 0 0 auto; color: var(--ins-secondary-color); }
    .attachment-list { display: grid; gap: .5rem; }
    .ticket-event { border-left: 3px solid var(--ins-primary); }
    ::ng-deep .ticket-drawer { width: min(72vw, 1100px) !important; }
    @media screen and (max-width: 960px) {
      .ticket-details-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      ::ng-deep .ticket-drawer { width: 90vw !important; }
    }
    @media screen and (max-width: 640px) {
      .ticket-details-grid { grid-template-columns: 1fr; }
      ::ng-deep .ticket-drawer { width: 100vw !important; }
    }
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
  commentsExpanded = false;
  externalReferenceDraft = '';
  externalReferenceEditing = false;
  externalReferenceLoading = false;
  externalReferenceError: string | null = null;
  private loadedKey: number | null = null;
  readonly attachmentAccept = TICKET_ATTACHMENT_ACCEPT;
  @ViewChild('commentFileInput') private commentFileInput?: ElementRef<HTMLInputElement>;

  ngOnChanges(): void {
    if (!this.visible || this.ticketId === null || this.loadedKey === this.ticketId) return;
    this.loadedKey = this.ticketId;
    this.ticket = null;
    this.commentsExpanded = false;
    this.error = null;
    this.loading = true;
    this.service.getTicket(this.ticketId).pipe(finalize(() => {
      this.loading = false;
      this.cdr.detectChanges();
    })).subscribe({
      next: (ticket) => { this.ticket = ticket; this.externalReferenceDraft = ticket.externalReference ?? ''; this.externalReferenceEditing = false; this.cdr.detectChanges(); },
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
        this.externalReferenceEditing = false;
        this.externalReferenceChanged.emit(this.ticket.externalReference);
        this.cdr.detectChanges();
      },
      error: () => { this.externalReferenceError = 'No pudimos actualizar la referencia. Intentá nuevamente.'; this.cdr.detectChanges(); },
    });
  }

  statusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
     return ({ INGRESADO: 'info', EN_REVISION: 'info', EN_DESARROLLO: 'warn', ESPERANDO_RESPUESTA_CLIENTE: 'warn', CERRADO: 'secondary', RECHAZADO: 'danger' } as Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'>)[status] ?? 'secondary';
  }

  retry(): void {
    this.loadedKey = null;
    this.ngOnChanges();
  }

  editExternalReference(): void {
    if (!this.ticket || this.externalReferenceLoading) return;
    this.externalReferenceError = null;
    this.externalReferenceEditing = true;
    this.cdr.detectChanges();
  }

  cancelExternalReference(): void {
    if (!this.ticket || this.externalReferenceLoading) return;
    this.externalReferenceDraft = this.ticket.externalReference ?? '';
    this.externalReferenceError = null;
    this.externalReferenceEditing = false;
    this.cdr.detectChanges();
  }

  statusLabel(status: string): string {
     return ({ INGRESADO: 'Ingresado', EN_REVISION: 'En revisión', EN_DESARROLLO: 'En desarrollo', ESPERANDO_RESPUESTA_CLIENTE: 'Esperando respuesta del cliente', CERRADO: 'Cerrado', RECHAZADO: 'Rechazado' } as Record<string, string>)[status] ?? status.replaceAll('_', ' ');
  }

  eventIdentifier(event: { type: string; code: string; title: string }): string {
    const type = event.type.trim().toUpperCase();
    const code = event.code.trim();
    return `${type}-${/^\d+$/.test(code) ? code.padStart(3, '0') : code} | ${event.title}`;
  }

  eventStateLabel(state: string): string {
    return ({ OPEN: 'Abierto', CLOSED: 'Cerrado' } as Record<string, string>)[state] ?? state;
  }

  provenanceLabel(comment: { source?: string; displayName?: string | null }): string {
    const source = ({ GEM_CLIENTES: 'GEM Clientes', GEM_WEB: 'GEM Web', EMAIL: 'Email', SYSTEM: 'System' } as Record<string, string>)[comment.source ?? 'SYSTEM'] ?? 'Unknown source';
    return comment.displayName ? `${comment.displayName} · ${source}` : source;
  }

  attachmentPresentation(attachment: GemClientesTicketAttachment): AttachmentPresentation {
    const mimeType = attachment.mimeType.toLowerCase();
    const type = this.attachmentType(mimeType);
    return {
      icon: this.attachmentIcon(mimeType),
      type,
      size: this.formatAttachmentSize(attachment.size),
      href: this.apiBaseUrl + attachment.downloadUrl,
    };
  }

  private attachmentIcon(mimeType: string): string {
    if (mimeType === 'application/pdf') return 'pi pi-file-pdf';
    if (mimeType.includes('word') || mimeType === 'application/msword') return 'pi pi-file-word';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'pi pi-file-excel';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'pi pi-file';
    if (mimeType.startsWith('image/')) return 'pi pi-image';
    if (mimeType.startsWith('video/')) return 'pi pi-video';
    if (mimeType.startsWith('audio/')) return 'pi pi-volume-up';
    if (mimeType.includes('zip') || mimeType.includes('compressed') || mimeType.includes('rar')) return 'pi pi-folder';
    return 'pi pi-file';
  }

  private attachmentType(mimeType: string): string {
    const labels: Record<string, string> = {
      'application/pdf': 'PDF',
      'application/msword': 'Word',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
      'application/vnd.ms-excel': 'Excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
      'application/zip': 'ZIP',
      'application/x-rar-compressed': 'RAR',
      'text/plain': 'Texto',
    };
    if (labels[mimeType]) return labels[mimeType];
    if (mimeType.startsWith('image/')) return 'Imagen';
    if (mimeType.startsWith('video/')) return 'Video';
    if (mimeType.startsWith('audio/')) return 'Audio';
    const subtype = mimeType.split('/')[1] ?? 'archivo';
    return subtype.replace(/^x-/, '').replace(/^vnd\./, '').replace(/[+.-]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  private formatAttachmentSize(size: number): string {
    if (!Number.isFinite(size) || size < 0) return 'Tamaño desconocido';
    if (size === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const unitIndex = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
    const value = size / 1024 ** unitIndex;
    return `${Number(value.toFixed(unitIndex === 0 ? 0 : 1))} ${units[unitIndex]}`;
  }

  get sortedComments(): GemClientesTicketComment[] {
    return [...(this.ticket?.comments ?? [])].sort((a, b) => this.commentTimestamp(b) - this.commentTimestamp(a));
  }

  get displayedComments(): GemClientesTicketComment[] {
    return this.commentsExpanded ? this.sortedComments : this.sortedComments.slice(0, 7);
  }

  get hasMoreComments(): boolean {
    return (this.ticket?.comments.length ?? 0) > 7;
  }

  toggleComments(): void {
    this.commentsExpanded = !this.commentsExpanded;
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
        this.ticket = { ...this.ticket!, comments: [comment, ...this.ticket!.comments] };
        this.commentDraft = '';
        this.commentFiles = [];
        if (this.commentFileInput) this.commentFileInput.nativeElement.value = '';
        this.cdr.detectChanges();
      },
      error: () => { this.commentError = 'No pudimos enviar el comentario. Intentá nuevamente.'; this.cdr.detectChanges(); },
    });
  }

  openCommentFilePicker(input: HTMLInputElement): void { input.click(); }

  onCommentFiles(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    const next = [...this.commentFiles, ...files];
    const error = validateTicketAttachments(next);
    this.commentError = error;
    if (!error) this.commentFiles = next;
  }

  private commentTimestamp(comment: GemClientesTicketComment): number {
    const timestamp = new Date(comment.createdAt).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  close(): void { this.closed.emit(); }
}
