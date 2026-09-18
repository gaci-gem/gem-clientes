import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiCard } from '../../components/ui-card';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { GemClientesTicket, validateTicketAttachments, TICKET_ATTACHMENT_ACCEPT } from '../../core/models/gem-clientes-ticket.model';
import { GemClientesTicketFilters, GemClientesTicketsService } from '../../core/services/gem-clientes-tickets.service';
import { DrawerTicketComponent } from './drawer-ticket/drawer-ticket.component';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [
    ButtonModule,
    CommonModule,
    DialogModule,
    DrawerTicketComponent,
    FormsModule,
    InputTextModule,
    TableModule,
    TagModule,
    ToolbarModule,
    UiCard,
  ],
  templateUrl: './tickets.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketsComponent implements OnInit {
  private readonly ticketsService = inject(GemClientesTicketsService);
  private cdr = inject(ChangeDetectorRef);
  @ViewChild('dt') table?: Table;

  readonly tickets = signal<GemClientesTicket[]>([]);
  readonly total = signal(0);
  page = 1;
  limit = 10;
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly filterError = signal<string | null>(null);
  readonly selectedTicketId = signal<number | null>(null);
  readonly createDialogVisible = signal(false);
  readonly createLoading = signal(false);
  readonly createError = signal<string | null>(null);
  readonly newSubject = signal('');
  readonly newDescription = signal('');
  readonly newExternalReference = signal('');
  readonly newFiles = signal<File[]>([]);
  searchValue = signal('');
  statusFilter = signal('');
  createdFrom = signal('');
  createdTo = signal('');
  readonly attachmentAccept = TICKET_ATTACHMENT_ACCEPT;

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.loading.set(true);
    this.error.set(null);
    this.ticketsService.listTickets({ ...this.filters(), page: this.page, limit: this.limit }).pipe(
      finalize(() => {
        this.loading.set(false);
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: (result) => {
        const page = Array.isArray(result) ? { data: result, total: result.length } : result;
        this.tickets.set(page.data);
        this.total.set(page.total);
      },
      error: () => this.error.set('No pudimos cargar tus tickets. Intentá nuevamente.'),
    });
  }

  filters(): GemClientesTicketFilters {
    return {
      ...(this.searchValue().trim() ? { search: this.searchValue().trim() } : {}),
      ...(this.statusFilter() ? { estado: this.statusFilter() } : {}),
      ...(this.createdFrom() ? { createdFrom: this.createdFrom() } : {}),
      ...(this.createdTo() ? { createdTo: this.createdTo() } : {}),
    };
  }

  hasActiveFilters(): boolean { return Object.keys(this.filters()).length > 0; }

  applyFilters(): void {
    if (this.createdFrom() && this.createdTo() && this.createdFrom() > this.createdTo()) {
      this.filterError.set('La fecha desde debe ser anterior o igual a la fecha hasta.');
      return;
    }
    this.filterError.set(null);
    this.page = 1;
    if (this.table) this.table.first = 0;
    this.loadTickets();
  }

  onPageChange(event: { first?: number; rows?: number }): void {
    this.limit = event.rows ?? this.limit;
    this.page = Math.floor((event.first ?? 0) / this.limit) + 1;
    this.loadTickets();
  }

  openCreateDialog(): void {
    this.newSubject.set('');
    this.newDescription.set('');
    this.newExternalReference.set('');
    this.newFiles.set([]);
    this.createError.set(null);
    this.createDialogVisible.set(true);
  }

  createTicket(): void {
    const subject = this.newSubject().trim();
    const description = this.newDescription().trim();
    const externalReference = this.newExternalReference().trim();
    if (!subject || !description) {
      this.createError.set('Completá el asunto y la descripción.');
      return;
    }
    const attachmentError = validateTicketAttachments(this.newFiles());
    if (attachmentError) {
      this.createError.set(attachmentError);
      return;
    }

    this.createLoading.set(true);
    this.createError.set(null);
    this.ticketsService.createTicket({
      subject,
      description,
      ...(externalReference ? { externalReference } : {}),
      ...(this.newFiles().length ? { files: this.newFiles() } : {}),
    }).pipe(
      finalize(() => {
        this.createLoading.set(false)
      }),
    ).subscribe({
      next: () => {
        this.createDialogVisible.set(false);
        this.page = 1;
        if (this.table) this.table.first = 0;
        this.loadTickets();
      },
      error: () => this.createError.set('No pudimos crear el ticket. Intentá nuevamente.'),
    });
  }

  onNewFiles(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    const error = validateTicketAttachments(files);
    this.createError.set(error);
    if (!error) this.newFiles.set(files);
  }

  descriptionExcerpt(description: string): string {
    const normalized = description.trim().replace(/\s+/g, ' ');
    return normalized.length > 160 ? `${normalized.slice(0, 157)}...` : normalized;
  }

  statusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      INGRESADO: 'info',
      EN_REVISION: 'info',
      EN_DESARROLLO: 'warn',
      RESUELTO: 'success',
      CERRADO: 'secondary',
      RECHAZADO: 'danger',
    };
    return severities[status] ?? 'secondary';
  }

  statusLabel(status: string): string {
    return ({
      INGRESADO: 'Ingresado',
      EN_REVISION: 'En revisión',
      EN_DESARROLLO: 'En desarrollo',
      RESUELTO: 'Resuelto',
      CERRADO: 'Cerrado',
      RECHAZADO: 'Rechazado',
    } as Record<string, string>)[status] ?? status;
  }

  openTicket(ticket: GemClientesTicket): void {
    this.selectedTicketId.set(ticket.id);
  }

  closeTicket(): void {
    this.selectedTicketId.set(null);
  }

  updateTicketReference(reference: string | null): void {
    const id = this.selectedTicketId();
    if (id === null) return;
    this.tickets.update((tickets) => tickets.map((ticket) =>
      ticket.id === id ? { ...ticket, externalReference: reference } : ticket,
    ));
  }
  
  clear(table?: Table) {
    table?.clear();
    this.searchValue.set('');
    this.statusFilter.set('');
    this.createdFrom.set('');
    this.createdTo.set('');
    this.filterError.set(null);
    this.page = 1;
    if (this.table) this.table.first = 0;
    this.loadTickets();
    this.cdr.detectChanges();
  }
}
