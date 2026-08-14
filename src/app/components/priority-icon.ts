import { Component, Input } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { getPrioridadDesc } from '../constants/prioridad';

@Component({
  selector: 'app-prioridad-icon',
  standalone: true,
  imports: [
    TooltipModule
  ],
  template: `
    <div pTooltip="{{getTooltip()}}" tooltipPosition="bottom">
        @if (nivel === 5) {
            <!-- Nivel 5: admiración roja -->
            <svg xmlns="http://www.w3.org/2000/svg"
                    [attr.width]="size" [attr.height]="size"
                    viewBox="0 0 24 24"
                    fill="none" stroke="#dc2626" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="4" ry="4"/>
                <line x1="12" y1="7" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12" y2="17"/>
            </svg>
        } @else {
            <!-- Niveles 1–4: barras -->
            <svg xmlns="http://www.w3.org/2000/svg"
                    [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24">
                <!-- <rect x="2" y="2" width="20" height="20" rx="4" ry="4"
                    fill="none" [attr.stroke]="color" stroke-width="2"/> -->
                <rect x="4" y="14" width="3" height="6" rx="1"
                    [attr.fill]="getFill(1)"/>
                <rect x="10" y="10" width="3" height="10" rx="1"
                    [attr.fill]="getFill(2)"/>
                <rect x="16" y="6" width="3" height="14" rx="1"
                    [attr.fill]="getFill(3)"/>
            </svg>
        }
    </div>
  `
})
export class PrioridadIconComponent {
  /** Nivel de prioridad: 1 (baja) a 5 (alta) */
  @Input() nivel: number = 1;

  /** Tamaño en px (ancho y alto del ícono) */
  @Input() size: number = 32;

  /** Color según el nivel */
  get color(): string {
    switch (this.nivel) {
      case 2: return '#10b981'; // verde
      case 3: return '#facc15'; // amarillo
      case 4: return '#ea580c'; // naranja oscuro
      default: return '#9ca3af'; // gris
    }
  }

  /** Determina el color de cada barra */
  getFill(bar: number): string {
    if (this.nivel === 1) return '#9ca3af'; // todo gris
    if (this.nivel >= 2 && this.nivel <= 4) {
      return bar <= this.nivel - 1 ? this.color : '#9ca3af';
    }
    return '#9ca3af';
  }

  getTooltip(): string {
    return getPrioridadDesc(this.nivel);
  }
}
