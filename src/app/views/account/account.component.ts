import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { PortalClientPasswordService } from '../../core/services/portal-client-password.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './account.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly passwordService = inject(PortalClientPasswordService);

  protected readonly passwordForm = this.formBuilder.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmation: ['', Validators.required],
  });
  protected isSubmitting = false;
  protected successMessage = '';
  protected errorMessage = '';

  protected submit(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    const { currentPassword, newPassword, confirmation } = this.passwordForm.getRawValue();
    if (newPassword !== confirmation) {
      this.errorMessage = 'Las contraseñas nuevas no coinciden.';
      return;
    }
    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.passwordService.changePassword({ currentPassword, newPassword, confirmation }).pipe(
      finalize(() => this.isSubmitting = false),
    ).subscribe({
      next: () => {
        this.passwordForm.reset();
        this.successMessage = 'Tu contraseña se actualizó correctamente.';
      },
      error: (error) => {
        this.errorMessage = error.status === 401
          ? 'La contraseña actual no es válida.'
          : 'No pudimos actualizar tu contraseña. Intentá nuevamente.';
      },
    });
  }
}
