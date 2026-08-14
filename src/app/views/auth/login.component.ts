import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { AppLogo } from '../../components/app-logo';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AppLogo,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);


  protected readonly loginForm = this.formBuilder.nonNullable.group({ login: ['', Validators.required], password: ['', Validators.required] });

  protected isSubmitting = false;
  protected errorMessage = this.route.snapshot.queryParamMap.has('sessionExpired') ? 'Tu sesión expiró. Ingresá nuevamente para continuar.' : '';

  protected submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';
    const { login, password } = this.loginForm.getRawValue();
    this.auth.login(login, password)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: () => void this.router.navigate(['/tickets']),
        error: () => this.errorMessage = 'No pudimos iniciar sesión. Verificá tus datos e intentá nuevamente.'
      });
  }
}
