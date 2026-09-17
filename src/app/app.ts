import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { provideIcons } from '@ng-icons/core';
import * as tablerIcons from '@ng-icons/tabler-icons'
import * as tablerIconsFill from '@ng-icons/tabler-icons/fill'
import * as lucideIcons from '@ng-icons/lucide'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DynamicDialogModule],
  template: '<router-outlet />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({ ...tablerIcons , ...tablerIconsFill, ...lucideIcons }),
  ],
})
export class AppComponent {}
