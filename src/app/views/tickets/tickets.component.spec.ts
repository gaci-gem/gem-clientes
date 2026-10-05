import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { GemClientesTicketsService } from '../../core/services/gem-clientes-tickets.service';
import { TicketsComponent } from './tickets.component';
import { DrawerTicketComponent } from './drawer-ticket/drawer-ticket.component';

describe('TicketsComponent', () => {
  let fixture: ComponentFixture<TicketsComponent>;
  let service: jasmine.SpyObj<GemClientesTicketsService> & { listTickets: jasmine.Spy };

  beforeEach(() => {
    service = jasmine.createSpyObj('GemClientesTicketsService', ['listTickets', 'getTicket', 'createTicket', 'addComment', 'updateExternalReference']) as typeof service;
    TestBed.configureTestingModule({
      imports: [TicketsComponent],
      providers: [{ provide: GemClientesTicketsService, useValue: service }],
    });
  });

  it('renders a populated ticket list', () => {
    service.listTickets.and.returnValue(of([{
      id: 1,
      subject: 'Access request',
      description: 'Please review access for the new user.',
      status: 'EN_REVISION',
      externalReference: 'EXT-1',
      createdAt: '2026-08-12T10:00:00Z',
      updatedAt: '2026-08-12T11:00:00Z',
    }]));
    fixture = TestBed.createComponent(TicketsComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Access request');
    expect(fixture.nativeElement.textContent).toContain('EXT-1');
    expect(fixture.nativeElement.querySelector('p-table')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('p-tag')).not.toBeNull();
  });

  it('renders an error state when listing fails', () => {
    service.listTickets.and.returnValue(throwError(() => new Error('failure')));
    fixture = TestBed.createComponent(TicketsComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No se pudieron cargar los tickets');
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
  });

  it('opens the read-only detail drawer from the summary row', () => {
    service.listTickets.and.returnValue(of([{
      id: 1, subject: 'Access request', description: 'Review access.', status: 'EN_REVISION',
      externalReference: null, createdAt: '2026-08-12T10:00:00Z', updatedAt: '2026-08-12T11:00:00Z',
    }]));
    fixture = TestBed.createComponent(TicketsComponent);
    fixture.detectChanges();

    fixture.componentInstance.openTicket(fixture.componentInstance.tickets()[0]);
    expect(fixture.componentInstance.selectedTicketId()).toBe(1);
    expect(fixture.nativeElement.textContent).not.toContain('Eventos asociados');
  });

  it('reloads the list once when the detail drawer closes', () => {
    service.listTickets.and.returnValues(of([]), of([]));
    fixture = TestBed.createComponent(TicketsComponent);
    fixture.detectChanges();
    fixture.componentInstance.selectedTicketId.set(1);

    fixture.componentInstance.closeTicket();
    fixture.componentInstance.closeTicket();

    expect(service.listTickets).toHaveBeenCalledTimes(2);
    expect(fixture.componentInstance.selectedTicketId()).toBeNull();
  });

  it('creates a ticket and reloads the list', () => {
    service.listTickets.and.returnValues(of([]), of([]));
    service.createTicket.and.returnValue(of({} as any));
    fixture = TestBed.createComponent(TicketsComponent);
    fixture.detectChanges();

    fixture.componentInstance.newSubject.set('New request');
    fixture.componentInstance.newDescription.set('Please investigate.');
    fixture.componentInstance.createTicket();

    expect(service.createTicket).toHaveBeenCalledOnceWith({
      subject: 'New request',
      description: 'Please investigate.',
    });
    expect(service.listTickets).toHaveBeenCalledTimes(2);
  });

  it('includes a trimmed external reference when creating a ticket', () => {
    service.listTickets.and.returnValues(of([]), of([]));
    service.createTicket.and.returnValue(of({} as any));
    fixture = TestBed.createComponent(TicketsComponent);
    fixture.detectChanges();

    fixture.componentInstance.newSubject.set('New request');
    fixture.componentInstance.newDescription.set('Please investigate.');
    fixture.componentInstance.newExternalReference.set(' CASE-1 ');
    fixture.componentInstance.createTicket();

    expect(service.createTicket).toHaveBeenCalledOnceWith({
      subject: 'New request',
      description: 'Please investigate.',
      externalReference: 'CASE-1',
    });
  });

  it('keeps comment capability in the detail drawer', () => {
    service.listTickets.and.returnValue(of([{ id: 1, subject: 'Access request', description: 'Review access.', status: 'EN_REVISION', externalReference: null, createdAt: '', updatedAt: '' }]));
    service.getTicket.and.returnValue(of({ id: 1, subject: 'Access request', description: 'Review access.', status: 'EN_REVISION', externalReference: null, createdAt: '', updatedAt: '', comments: [], events: [] }));
    service.addComment.and.returnValue(of({ id: 7, text: 'More information', createdAt: '', updatedAt: '' }));
    fixture = TestBed.createComponent(TicketsComponent);
    fixture.detectChanges();
    fixture.componentInstance.openTicket(fixture.componentInstance.tickets()[0]);
    fixture.detectChanges();
    const drawer = fixture.debugElement.query(By.directive(DrawerTicketComponent));
    expect(drawer).not.toBeNull();
    drawer.componentInstance.commentDraft = 'More information';
    drawer.componentInstance.addComment();

    expect(service.addComment).toHaveBeenCalledOnceWith(1, 'More information');
    expect(drawer.componentInstance.ticket.comments[0].text).toBe('More information');
  });

  it('applies and clears server-side filters', () => {
    service.listTickets.and.returnValues(of([]), of([]), of([]));
    fixture = TestBed.createComponent(TicketsComponent);
    fixture.detectChanges();

    fixture.componentInstance.searchValue.set(' access ');
    fixture.componentInstance.statusFilter.set('EN_REVISION');
    fixture.componentInstance.createdFrom.set('2026-09-01');
    fixture.componentInstance.createdTo.set('2026-09-30');
    fixture.componentInstance.page = 3;
    (fixture.componentInstance as any).table = { first: 20 };
    fixture.componentInstance.applyFilters();
    expect(service.listTickets).toHaveBeenCalledWith({ search: 'access', estado: 'EN_REVISION', createdFrom: '2026-09-01', createdTo: '2026-09-30', page: 1, limit: 10 });
    expect((fixture.componentInstance as any).table.first).toBe(0);

    (fixture.componentInstance as any).table.first = 20;
    fixture.componentInstance.clear();
    expect(service.listTickets).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect((fixture.componentInstance as any).table.first).toBe(0);
    expect(fixture.componentInstance.hasActiveFilters()).toBeFalse();
  });

  it('renders the compact comment composer controls', () => {
    service.listTickets.and.returnValue(of([{ id: 1, subject: 'Access request', description: 'Review access.', status: 'EN_REVISION', externalReference: null, createdAt: '', updatedAt: '' }]));
    service.getTicket.and.returnValue(of({ id: 1, subject: 'Access request', description: 'Review access.', status: 'EN_REVISION', externalReference: null, createdAt: '', updatedAt: '', comments: [], events: [] }));
    fixture = TestBed.createComponent(TicketsComponent);
    fixture.detectChanges();
    fixture.componentInstance.openTicket(fixture.componentInstance.tickets()[0]);
    fixture.detectChanges();

    const composer = fixture.nativeElement.querySelector('.comment-composer') as HTMLElement;
    expect(composer.querySelector('#ticket-comment')).not.toBeNull();
    expect((composer.querySelector('#ticket-comment') as HTMLInputElement).placeholder).toBe('Escribí un mensaje');
    expect(composer.querySelector('[aria-label="Adjuntar archivo"]')).not.toBeNull();
    expect(composer.querySelector('button[aria-label="Enviar"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('input[type="file"]')).toHaveSize(1);
    expect(fixture.nativeElement.querySelectorAll('input[type="file"]:not(.d-none)')).toHaveSize(0);
  });

  it('accumulates files selected through the attachment control', () => {
    service.listTickets.and.returnValue(of([{ id: 1, subject: 'Access request', description: 'Review access.', status: 'EN_REVISION', externalReference: null, createdAt: '', updatedAt: '' }]));
    service.getTicket.and.returnValue(of({ id: 1, subject: 'Access request', description: 'Review access.', status: 'EN_REVISION', externalReference: null, createdAt: '', updatedAt: '', comments: [], events: [] }));
    fixture = TestBed.createComponent(TicketsComponent);
    fixture.detectChanges();
    fixture.componentInstance.openTicket(fixture.componentInstance.tickets()[0]);
    fixture.detectChanges();
    const drawer = fixture.debugElement.query(By.directive(DrawerTicketComponent));
    const fileInput = fixture.nativeElement.querySelector('[aria-label="Adjuntos del comentario"]') as HTMLInputElement;
    const file = new File(['file'], 'document.pdf', { type: 'application/pdf' });
    const image = new File(['image'], 'photo.png', { type: 'image/png' });

    Object.defineProperty(fileInput, 'files', { value: [file], configurable: true });
    fileInput.dispatchEvent(new Event('change'));
    Object.defineProperty(fileInput, 'files', { value: [image], configurable: true });
    fileInput.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(drawer.componentInstance.commentFiles).toEqual([file, image]);
    expect(fixture.nativeElement.textContent).toContain('Archivos seleccionados: 2');
  });

  it('renders the compact comment time and provenance footer', () => {
    service.listTickets.and.returnValue(of([{ id: 1, subject: 'Access request', description: 'Review access.', status: 'EN_REVISION', externalReference: null, createdAt: '', updatedAt: '' }]));
    service.getTicket.and.returnValue(of({ id: 1, subject: 'Access request', description: 'Review access.', status: 'EN_REVISION', externalReference: null, createdAt: '', updatedAt: '', comments: [{ id: 7, text: 'Reply', createdAt: '2026-09-16T10:00:00Z', updatedAt: '', source: 'GEM_WEB', actorType: 'USER', actorId: 'user-7', userId: 'user-7', credentialId: null, displayName: 'Ana' }], events: [] }));
    fixture = TestBed.createComponent(TicketsComponent);
    fixture.detectChanges();
    fixture.componentInstance.openTicket(fixture.componentInstance.tickets()[0]);
    fixture.detectChanges();

    const footer = fixture.nativeElement.querySelector('.comment-footer');
    expect(footer).not.toBeNull();
    expect(footer.querySelector('app-time-ago')).not.toBeNull();
    expect(footer.textContent).toContain('Ana · GEM Web');
    expect(footer.querySelectorAll('app-time-ago')).toHaveSize(1);
  });

  it('renders the same attachment cards for comments and the ticket', () => {
    const commentAttachment = {
      id: 'comment-file', name: 'a-very-long-comment-document-name.pdf', mimeType: 'application/pdf',
      size: 1536, checksum: 'comment-checksum', createdAt: '', downloadUrl: '/files/comment-file',
    };
    const ticketAttachment = {
      id: 'ticket-file', name: 'photo.png', mimeType: 'image/png',
      size: 0, checksum: 'ticket-checksum', createdAt: '', downloadUrl: '/files/ticket-file',
    };
    service.listTickets.and.returnValue(of([{ id: 1, subject: 'Access request', description: 'Review access.', status: 'EN_REVISION', externalReference: null, createdAt: '', updatedAt: '' }]));
    service.getTicket.and.returnValue(of({
      id: 1, subject: 'Access request', description: 'Review access.', status: 'EN_REVISION', externalReference: null,
      createdAt: '', updatedAt: '', comments: [{ id: 7, text: 'Reply', createdAt: '', updatedAt: '', attachments: [commentAttachment] }],
      events: [], attachments: [ticketAttachment],
    }));
    fixture = TestBed.createComponent(TicketsComponent);
    fixture.detectChanges();
    fixture.componentInstance.openTicket(fixture.componentInstance.tickets()[0]);
    fixture.detectChanges();

    const cards = Array.from(fixture.nativeElement.querySelectorAll('.attachment-card')) as HTMLAnchorElement[];
    expect(cards).toHaveSize(2);
    expect(cards[0].href).toContain('/files/comment-file');
    expect(cards[0].target).toBe('_blank');
    expect(cards[0].rel).toBe('noopener');
    expect(cards[0].querySelector('.pi-file-pdf')).not.toBeNull();
    expect(cards[0].textContent).toContain('PDF · 1.5 KB');
    expect(cards[0].querySelector('.attachment-name')?.textContent).toContain('a-very-long-comment-document-name.pdf');
    expect(cards[1].querySelector('.pi-image')).not.toBeNull();
    expect(cards[1].textContent).toContain('Imagen · 0 B');
    expect(cards[1].querySelector('.pi-download')).not.toBeNull();
  });

  it('renders associated events with padded identifiers and translated states', () => {
    service.listTickets.and.returnValue(of([{ id: 1, subject: 'Access request', description: 'Review access.', status: 'EN_REVISION', externalReference: null, createdAt: '', updatedAt: '' }]));
    service.getTicket.and.returnValue(of({
      id: 1, subject: 'Access request', description: 'Review access.', status: 'EN_REVISION', externalReference: null,
      createdAt: '', updatedAt: '', comments: [], events: [
        { id: 'event-1', type: 'ticket', code: '12', title: 'Access approved', visibleState: 'OPEN' },
        { id: 'event-2', type: 'note', code: 'not-a-number', title: 'Needs review', visibleState: 'CLOSED' },
      ],
    }));
    fixture = TestBed.createComponent(TicketsComponent);
    fixture.detectChanges();
    fixture.componentInstance.openTicket(fixture.componentInstance.tickets()[0]);
    fixture.detectChanges();

    const events = Array.from(fixture.nativeElement.querySelectorAll('.ticket-event')) as HTMLElement[];
    expect(events).toHaveSize(2);
    expect(events[0].querySelector('strong')?.textContent).toBe('TICKET-012 | Access approved');
    expect(events[0].querySelector('p')?.textContent?.trim()).toBe('Abierto');
    expect(events[1].querySelector('strong')?.textContent).toBe('NOTE-not-a-number | Needs review');
    expect(events[1].querySelector('p')?.textContent?.trim()).toBe('Cerrado');
  });

  it('formats attachment types and sizes through the drawer presentation helper', () => {
    service.listTickets.and.returnValue(of([]));
    fixture = TestBed.createComponent(TicketsComponent);
    fixture.detectChanges();
    const drawer = fixture.debugElement.query(By.directive(DrawerTicketComponent)).componentInstance as DrawerTicketComponent;

    expect(drawer.attachmentPresentation({ id: '1', name: 'sheet.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size: 1024 * 1024, checksum: '', createdAt: '', downloadUrl: '/sheet' })).toEqual({
      icon: 'pi pi-file-excel', type: 'Excel', size: '1 MB', href: jasmine.any(String),
    });
  });

  it('renders comments newest first and collapses the list to seven comments', () => {
    const comments = Array.from({ length: 8 }, (_, index) => ({
      id: index + 1,
      text: `Comment ${index + 1}`,
      createdAt: `2026-09-${String(index + 1).padStart(2, '0')}T10:00:00Z`,
      updatedAt: '',
    }));
    service.listTickets.and.returnValue(of([{ id: 1, subject: 'Access request', description: 'Review access.', status: 'EN_REVISION', externalReference: null, createdAt: '', updatedAt: '' }]));
    service.getTicket.and.returnValue(of({ id: 1, subject: 'Access request', description: 'Review access.', status: 'EN_REVISION', externalReference: null, createdAt: '', updatedAt: '', comments, events: [] }));
    fixture = TestBed.createComponent(TicketsComponent);
    fixture.detectChanges();
    fixture.componentInstance.openTicket(fixture.componentInstance.tickets()[0]);
    fixture.detectChanges();

    const commentItems = Array.from(fixture.nativeElement.querySelectorAll('.comment-item')) as HTMLElement[];
    expect(commentItems).toHaveSize(7);
    expect(commentItems[0].textContent).toContain('Comment 8');
    expect(commentItems[6].textContent).toContain('Comment 2');
    expect(fixture.nativeElement.querySelector('.comment-list + div button').textContent).toContain('Ver más');
  });

  it('expands and collapses comments with the toggle button', () => {
    const comments = Array.from({ length: 8 }, (_, index) => ({
      id: index + 1,
      text: `Comment ${index + 1}`,
      createdAt: `2026-09-${String(index + 1).padStart(2, '0')}T10:00:00Z`,
      updatedAt: '',
    }));
    service.listTickets.and.returnValue(of([{ id: 1, subject: 'Access request', description: 'Review access.', status: 'EN_REVISION', externalReference: null, createdAt: '', updatedAt: '' }]));
    service.getTicket.and.returnValue(of({ id: 1, subject: 'Access request', description: 'Review access.', status: 'EN_REVISION', externalReference: null, createdAt: '', updatedAt: '', comments, events: [] }));
    fixture = TestBed.createComponent(TicketsComponent);
    fixture.detectChanges();
    fixture.componentInstance.openTicket(fixture.componentInstance.tickets()[0]);
    fixture.detectChanges();

    const toggle = () => fixture.nativeElement.querySelector('.comment-list + div button') as HTMLButtonElement;
    toggle().click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.comment-item')).toHaveSize(8);
    expect(toggle().textContent).toContain('Ver menos');

    toggle().click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.comment-item')).toHaveSize(7);
    expect(toggle().textContent).toContain('Ver más');
  });

  it('places the comment form before the comment list', () => {
    service.listTickets.and.returnValue(of([{ id: 1, subject: 'Access request', description: 'Review access.', status: 'EN_REVISION', externalReference: null, createdAt: '', updatedAt: '' }]));
    service.getTicket.and.returnValue(of({ id: 1, subject: 'Access request', description: 'Review access.', status: 'EN_REVISION', externalReference: null, createdAt: '', updatedAt: '', comments: [{ id: 1, text: 'Reply', createdAt: '2026-09-01T10:00:00Z', updatedAt: '' }], events: [] }));
    fixture = TestBed.createComponent(TicketsComponent);
    fixture.detectChanges();
    fixture.componentInstance.openTicket(fixture.componentInstance.tickets()[0]);
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('#ticket-comment') as HTMLElement;
    const list = fixture.nativeElement.querySelector('.comment-list') as HTMLElement;
    expect(textarea.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('updates the drawer reference and synchronizes the summary row', () => {
    service.listTickets.and.returnValue(of([{ id: 1, subject: 'Access request', description: 'Review access.', status: 'EN_REVISION', externalReference: null, createdAt: '', updatedAt: '' }]));
    service.getTicket.and.returnValue(of({ id: 1, subject: 'Access request', description: 'Review access.', status: 'EN_REVISION', externalReference: null, createdAt: '', updatedAt: '', comments: [], events: [] }));
    service.updateExternalReference.and.returnValue(of({ externalReference: 'CASE-1' } as any));
    fixture = TestBed.createComponent(TicketsComponent);
    fixture.detectChanges();
    fixture.componentInstance.openTicket(fixture.componentInstance.tickets()[0]);
    fixture.detectChanges();

    const drawer = fixture.debugElement.query(By.directive(DrawerTicketComponent));
    drawer.componentInstance.editExternalReference();
    drawer.componentInstance.externalReferenceDraft = ' CASE-1 ';
    drawer.componentInstance.updateExternalReference();

    expect(service.updateExternalReference).toHaveBeenCalledOnceWith(1, 'CASE-1');
    expect(fixture.componentInstance.tickets()[0].externalReference).toBe('CASE-1');
    expect(drawer.componentInstance.externalReferenceEditing).toBeFalse();
  });

  it('restores the reference and exits edit mode when cancelled', () => {
    service.listTickets.and.returnValue(of([{ id: 1, subject: 'Access request', description: 'Review access.', status: 'EN_REVISION', externalReference: 'CASE-1', createdAt: '', updatedAt: '' }]));
    service.getTicket.and.returnValue(of({ id: 1, subject: 'Access request', description: 'Review access.', status: 'EN_REVISION', externalReference: 'CASE-1', createdAt: '', updatedAt: '', comments: [], events: [] }));
    fixture = TestBed.createComponent(TicketsComponent);
    fixture.detectChanges();
    fixture.componentInstance.openTicket(fixture.componentInstance.tickets()[0]);
    fixture.detectChanges();

    const drawer = fixture.debugElement.query(By.directive(DrawerTicketComponent));
    drawer.componentInstance.editExternalReference();
    drawer.componentInstance.externalReferenceDraft = 'UNSAVED';
    drawer.componentInstance.cancelExternalReference();

    expect(drawer.componentInstance.externalReferenceDraft).toBe('CASE-1');
    expect(drawer.componentInstance.externalReferenceEditing).toBeFalse();
  });
});
