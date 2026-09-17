import { Component, inject, OnInit } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { VersionService } from '../../core/services/version';
import { ChangelogComponent } from './changelog';

@Component({
  selector: 'app-changelog-modal',
  standalone: true,
  imports: [ChangelogComponent],
  template: '<app-changelog [isModalView]="true" />',
  styles: ':host { display: block; }',
})
export class ChangelogModalComponent implements OnInit {
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly versionService = inject(VersionService);

  ngOnInit(): void {
    this.versionService.getVersion().subscribe({
      next: ({ version }) => localStorage.setItem('lastSeenVersion', version),
    });
  }
}
