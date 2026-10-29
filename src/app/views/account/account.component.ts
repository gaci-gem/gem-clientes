import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { GemClientesPasswordService } from '../../core/services/gem-clientes-password.service';
import { showErrorToast, showSuccessToast } from '../../utils/message-utils';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './account.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly passwordService = inject(GemClientesPasswordService);
  private readonly dialogRef = inject(DynamicDialogRef, { optional: true });
  private readonly messageService = inject(MessageService);

  protected readonly passwordForm = this.formBuilder.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)]],
    confirmation: ['', Validators.required],
  });
  protected isSubmitting = false;
  protected hasAttemptedSubmit = false;
  protected showPassword = {
    currentPassword: false,
    newPassword: false,
    confirmation: false,
  };

  protected submit(): void {
    this.hasAttemptedSubmit = true;
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      showErrorToast(this.messageService, 'Error', 'Revisá los campos indicados antes de actualizar tu contraseña.');
      return;
    }
    const { currentPassword, newPassword, confirmation } = this.passwordForm.getRawValue();
    if (newPassword === currentPassword) {
      showErrorToast(this.messageService, 'Error', 'La nueva contraseña debe ser distinta de la actual.');
      return;
    }
    if (newPassword !== confirmation) {
      showErrorToast(this.messageService, 'Error', 'Las contraseñas nuevas no coinciden.');
      return;
    }
    this.isSubmitting = true;
    this.passwordService.changePassword({ currentPassword, newPassword, confirmation }).pipe(
      finalize(() => this.isSubmitting = false),
    ).subscribe({
      next: () => {
        this.passwordForm.reset();
        this.hasAttemptedSubmit = false;
        showSuccessToast(this.messageService, 'Contraseña actualizada', 'Tu contraseña se actualizó correctamente.');
        this.dialogRef?.close();
      },
      error: (error) => {
        const message = error.status === 401
          ? 'La contraseña actual no es válida.'
          : error.status === 400
            ? this.getBadRequestMessage(error)
            : 'No pudimos actualizar tu contraseña. Intentá nuevamente.';
        showErrorToast(this.messageService, 'Error', message);
      },
    });
  }

  protected shouldShowError(controlName: 'currentPassword' | 'newPassword' | 'confirmation'): boolean {
    const control = this.passwordForm.controls[controlName];
    return control.invalid && (control.touched || this.hasAttemptedSubmit);
  }

  protected shouldShowConfirmationMismatch(): boolean {
    const { newPassword, confirmation } = this.passwordForm.controls;
    return newPassword.value !== confirmation.value
      && newPassword.value.length > 0
      && confirmation.value.length > 0
      && (newPassword.touched || confirmation.touched || this.hasAttemptedSubmit);
  }

  protected togglePassword(controlName: keyof typeof this.showPassword): void {
    this.showPassword[controlName] = !this.showPassword[controlName];
  }

  private getBadRequestMessage(error: { error?: unknown }): string {
    if (typeof error.error === 'string' && error.error.trim()) return error.error;
    if (error.error && typeof error.error === 'object') {
      const body = error.error as { message?: unknown; error?: unknown };
      if (typeof body.message === 'string' && body.message.trim()) return body.message;
      if (typeof body.error === 'string' && body.error.trim()) return body.error;
    }
    return 'La nueva contraseña debe tener al menos 8 caracteres, incluyendo letras y números, y ser distinta de la actual.';
  }
}
