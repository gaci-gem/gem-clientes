import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiCard } from '../../components/ui-card';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { GemClientesTicket } from '../../core/models/gem-clientes-ticket.model';
import { GemClientesTicketsService } from '../../core/services/gem-clientes-tickets.service';
import { DrawerTicketComponent } from './drawer-ticket/drawer-ticket.component';
import { NgIcon } from '@ng-icons/core';

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
    UiCard,
    NgIcon,
  ],
  templateUrl: './tickets.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketsComponent implements OnInit {
  private readonly ticketsService = inject(GemClientesTicketsService);
  private cdr = inject(ChangeDetectorRef);

  readonly tickets = signal<GemClientesTicket[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly selectedTicketId = signal<number | null>(null);
  readonly createDialogVisible = signal(false);
  readonly createLoading = signal(false);
  readonly createError = signal<string | null>(null);
  readonly newSubject = signal('');
  readonly newDescription = signal('');
  readonly newExternalReference = signal('');
  readonly newFiles = signal<File[]>([]);
  searchValue = signal('');

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.loading.set(true);
    this.error.set(null);
    this.ticketsService.listTickets().pipe(
      finalize(() => {
        this.loading.set(false);
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: (tickets) => this.tickets.set(tickets),
      error: () => this.error.set('No pudimos cargar tus tickets. Intentá nuevamente.'),
    });
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
        this.loadTickets();
      },
      error: () => this.createError.set('No pudimos crear el ticket. Intentá nuevamente.'),
    });
  }

  onNewFiles(event: Event): void { this.newFiles.set(Array.from((event.target as HTMLInputElement).files ?? [])); }

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
  
  clear(table: Table) {
    table.clear();
    this.searchValue.set('');
    this.cdr.detectChanges();
  }
  getEventValue($event:any) :string {
    return $event.target.value;
  } 
}
