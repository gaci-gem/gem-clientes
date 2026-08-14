import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-help-tooltip',
  standalone: true,
  imports: [CommonModule, TooltipModule],
  template: `
    <i
      [class]="iconClass"
      [ngStyle]="{ 'font-size': size, cursor: 'help' }"
      [pTooltip]="text"
      [tooltipPosition]="position"
      [tooltipStyleClass]="tooltipStyleClass"
      [attr.aria-label]="text"
    ></i>
  `,
})
export class HelpTooltip {
  @Input() text: string = '';
  @Input() position: 'top' | 'right' | 'bottom' | 'left' = 'top';
  @Input() iconClass: string = 'pi pi-question-circle text-muted';
  @Input() size: string = '1rem';
  @Input() tooltipStyleClass?: string;
}
