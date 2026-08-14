import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { PortalClientTicketsService } from '../../core/services/portal-client-tickets.service';
import { TicketsComponent } from './tickets.component';
import { DrawerTicketComponent } from './drawer-ticket/drawer-ticket.component';

describe('TicketsComponent', () => {
  let fixture: ComponentFixture<TicketsComponent>;
  let service: jasmine.SpyObj<PortalClientTicketsService>;

  beforeEach(() => {
    service = jasmine.createSpyObj('PortalClientTicketsService', ['listTickets', 'getTicket', 'createTicket', 'addComment', 'updateExternalReference']);
    TestBed.configureTestingModule({
      imports: [TicketsComponent],
      providers: [{ provide: PortalClientTicketsService, useValue: service }],
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

  it('updates the drawer reference and synchronizes the summary row', () => {
    service.listTickets.and.returnValue(of([{ id: 1, subject: 'Access request', description: 'Review access.', status: 'EN_REVISION', externalReference: null, createdAt: '', updatedAt: '' }]));
    service.getTicket.and.returnValue(of({ id: 1, subject: 'Access request', description: 'Review access.', status: 'EN_REVISION', externalReference: null, createdAt: '', updatedAt: '', comments: [], events: [] }));
    service.updateExternalReference.and.returnValue(of({ externalReference: 'CASE-1' } as any));
    fixture = TestBed.createComponent(TicketsComponent);
    fixture.detectChanges();
    fixture.componentInstance.openTicket(fixture.componentInstance.tickets()[0]);
    fixture.detectChanges();

    const drawer = fixture.debugElement.query(By.directive(DrawerTicketComponent));
    drawer.componentInstance.externalReferenceDraft = ' CASE-1 ';
    drawer.componentInstance.updateExternalReference();

    expect(service.updateExternalReference).toHaveBeenCalledOnceWith(1, 'CASE-1');
    expect(fixture.componentInstance.tickets()[0].externalReference).toBe('CASE-1');
  });
});
