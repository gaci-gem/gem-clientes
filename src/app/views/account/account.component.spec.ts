import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { GemClientesPasswordService } from '../../core/services/gem-clientes-password.service';
import { AccountComponent } from './account.component';

describe('AccountComponent', () => {
  let fixture: ComponentFixture<AccountComponent>;
  let service: jasmine.SpyObj<GemClientesPasswordService>;
  let dialogRef: jasmine.SpyObj<DynamicDialogRef>;
  let messageService: jasmine.SpyObj<MessageService>;

  beforeEach(() => {
    service = jasmine.createSpyObj('GemClientesPasswordService', ['changePassword']);
    dialogRef = jasmine.createSpyObj('DynamicDialogRef', ['close']);
    messageService = jasmine.createSpyObj('MessageService', ['add']);
    TestBed.configureTestingModule({
      imports: [AccountComponent],
      providers: [
        { provide: GemClientesPasswordService, useValue: service },
        { provide: DynamicDialogRef, useValue: dialogRef },
        { provide: MessageService, useValue: messageService },
      ],
    });
    fixture = TestBed.createComponent(AccountComponent);
  });

  it('valida letras y números en la nueva contraseña', () => {
    const form = fixture.componentInstance['passwordForm'];
    form.setValue({ currentPassword: 'Actual1', newPassword: '12345678', confirmation: '12345678' });

    expect(form.controls.newPassword.hasError('pattern')).toBeTrue();
  });

  it('muestra feedback visible y accesible al enviar 123456789', () => {
    const component = fixture.componentInstance;
    component['passwordForm'].setValue({ currentPassword: 'Actual1', newPassword: '123456789', confirmation: '123456789' });

    component['submit']();
    fixture.detectChanges();

    expect(service.changePassword).not.toHaveBeenCalled();
    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error', detail: 'Revisá los campos indicados antes de actualizar tu contraseña.' }));
    expect(fixture.nativeElement.textContent).toContain('La nueva contraseña debe tener mínimo 8 caracteres y al menos una letra y un número.');
    expect(fixture.nativeElement.querySelector('#newPasswordError')?.getAttribute('id')).toBe('newPasswordError');
  });

  it('rechaza una nueva contraseña igual a la actual sin llamar al servicio', () => {
    const component = fixture.componentInstance;
    component['passwordForm'].setValue({ currentPassword: 'Actual123', newPassword: 'Actual123', confirmation: 'Actual123' });

    component['submit']();

    expect(service.changePassword).not.toHaveBeenCalled();
    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error', detail: 'La nueva contraseña debe ser distinta de la actual.' }));
  });

  it('muestra el mismatch debajo de la confirmación y no llama al servicio', () => {
    const component = fixture.componentInstance;
    component['passwordForm'].setValue({ currentPassword: 'Actual123', newPassword: '123456789a', confirmation: '123456789b' });

    component['submit']();
    fixture.detectChanges();

    expect(service.changePassword).not.toHaveBeenCalled();
    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error', detail: 'Las contraseñas nuevas no coinciden.' }));
    expect(fixture.nativeElement.querySelector('#confirmationMismatchError')?.textContent).toContain('no coincide');
    expect(fixture.nativeElement.querySelector('#confirmation')?.getAttribute('aria-describedby')).toContain('confirmationMismatchError');
  });

  it('permite mostrar y ocultar cada contraseña', () => {
    const inputs = ['currentPassword', 'newPassword', 'confirmation'];
    const component = fixture.componentInstance;
    fixture.detectChanges();

    inputs.forEach((name) => {
      const input = fixture.nativeElement.querySelector(`#${name}`) as HTMLInputElement;
      const button = input.parentElement?.querySelector('button') as HTMLButtonElement;
      expect(input.type).toBe('password');
      button.click();
      fixture.detectChanges();
      expect(input.type).toBe('text');
      expect(button.getAttribute('aria-label')).toContain('Ocultar');
      button.click();
      fixture.detectChanges();
      expect(input.type).toBe('password');
    });
  });

  it('muestra el mensaje del backend para un 400 y libera el estado de envío', () => {
    const response = new Subject<{ authenticated: true }>();
    service.changePassword.and.returnValue(response.asObservable());
    const component = fixture.componentInstance;
    component['passwordForm'].setValue({ currentPassword: 'Actual123', newPassword: 'Nueva1234', confirmation: 'Nueva1234' });

    component['submit']();
    expect(component['isSubmitting']).toBeTrue();
    response.error({ status: 400, error: { message: 'La contraseña no cumple la política.' } });

    expect(component['isSubmitting']).toBeFalse();
    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error', detail: 'La contraseña no cumple la política.' }));
  });

  it('muestra un mensaje específico para 401 y libera el estado de envío', () => {
    service.changePassword.and.returnValue(throwError(() => ({ status: 401 })));
    const component = fixture.componentInstance;
    component['passwordForm'].setValue({ currentPassword: 'Actual123', newPassword: 'Nueva1234', confirmation: 'Nueva1234' });

    component['submit']();

    expect(component['isSubmitting']).toBeFalse();
    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error', detail: 'La contraseña actual no es válida.' }));
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('resetea el formulario y libera el estado al completar correctamente', () => {
    service.changePassword.and.returnValue(of({ authenticated: true }));
    const component = fixture.componentInstance;
    component['passwordForm'].setValue({ currentPassword: 'Actual123', newPassword: 'Nueva1234', confirmation: 'Nueva1234' });

    component['submit']();

    expect(component['isSubmitting']).toBeFalse();
    expect(component['passwordForm'].getRawValue()).toEqual({ currentPassword: '', newPassword: '', confirmation: '' });
    expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success', detail: 'Tu contraseña se actualizó correctamente.' }));
    expect(dialogRef.close).toHaveBeenCalled();
  });
});
