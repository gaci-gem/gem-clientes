
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getContrastYIQ } from '../utils/color-utils';

@Component({
  selector: 'app-badge-click',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="badge-click"
      [ngStyle]="{
        'background-color': backgroundColor,
        'color': textColor,
        'cursor': link ? 'pointer' : 'default',
        'min-width': width,
        'height': height,
        'line-height': height,
        'text-align': 'center'
      }"
      (click)="redirect()"
    >
      <ng-content></ng-content>
    </span>
  `,
  styles: [`
    .badge-click {
      display: inline-block;
      padding: 0.25em 0.7em;
      border-radius: 0.8em;
      color: #fff;
      font-size: 0.95em;
      font-weight: 500;
      transition: filter 0.2s;
      user-select: none;
    }
    .badge-click:hover {
      filter: brightness(0.9);
    }
  `]
})
export class BadgeClickComponent {
  @Input() link: string | null = null;
  @Input() backgroundColor: string = '#3E47F6';
  @Input() width: string = 'auto';
  @Input() height: string = 'auto';

  get textColor(): string {
    return getContrastYIQ(this.backgroundColor);
  }

  redirect() {
    if (this.link) {
      window.open(this.link, '_blank');
    }
  }

  /**
   * Calcula el color de texto (blanco o negro) según el contraste con el background
   */
  private getContrastYIQ(hexcolor: string): string {
    let hex = hexcolor.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(x => x + x).join('');
    }
    if (hex.length !== 6) return '#fff';
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const yiq = ((r*299)+(g*587)+(b*114))/1000;
    return yiq >= 128 ? '#222' : '#fff';
  }
}
