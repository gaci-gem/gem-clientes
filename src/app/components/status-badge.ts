import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReporteEstado, ReporteEstadoBadge } from '@core/interfaces/reporte';
import { NgIcon } from '@ng-icons/core';

@Component({
    selector: 'app-status-badge',
    standalone: true,
    imports: [
        CommonModule,
        NgIcon,
    ],
    template: `
    <span [ngClass]="ReporteEstadoBadge[status].class" class="badge badge-pill d-inline-flex align-items-center py-1" style="min-width: 100%; justify-content: center; font-size: 0.95em; font-weight: 500;">
      <ng-icon [name]="ReporteEstadoBadge[status].icon" style="width: 16px; height: 16px; margin-right: 6px;"></ng-icon> {{ ReporteEstadoBadge[status].label }}
    </span>
  `,
    styles: []
})
export class StatusBadgeComponent {
    /**
     * Estado del reporte: 'PE' (Pendiente), 'PR' (En Proceso), 'OK' (Generado), 'ER' (Error)
     */
    @Input() status: ReporteEstado = ReporteEstado.PE;

    ReporteEstadoBadge = ReporteEstadoBadge;


}
