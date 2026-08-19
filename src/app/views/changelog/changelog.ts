import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { Tooltip } from 'primeng/tooltip';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { CHANGELOG, ChangelogChange, ChangelogEntry } from '../../core/services/changelog';
import { VersionService } from '../../core/services/version';
import { UiCard } from '../../components/ui-card';

@Component({
  selector: 'app-changelog',
  standalone: true,
  imports: [CommonModule, UiCard, NgIcon, Tooltip],
  templateUrl: './changelog.html',
  styleUrl: './changelog.scss',
})
export class ChangelogComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly dialogRef = inject(DynamicDialogRef, { optional: true });
  private readonly versionService = inject(VersionService);

  @Input() isModalView = false;
  readonly changelog = CHANGELOG;
  readonly maxVersionsInModal = 2;
  readonly currentBuild = signal<string | undefined>(undefined);

  ngOnInit(): void {
    this.versionService.getVersion().subscribe({
      next: ({ commitHash }) => this.currentBuild.set(commitHash),
    });
  }

  get displayedChangelog(): ChangelogEntry[] {
    return this.isModalView
      ? this.changelog.filter((entry) => !entry.isFuture).slice(0, this.maxVersionsInModal)
      : this.changelog;
  }

  isCurrentVersion(entry: ChangelogEntry): boolean {
    return this.changelog.find((item) => !item.isFuture) === entry;
  }

  shouldExpand(entry: ChangelogEntry): boolean { return this.isCurrentVersion(entry); }

  navigateToFullChangelog(): void {
    this.closeModal();
    this.router.navigate(['/changelog']);
  }

  closeModal(): void { this.dialogRef?.close(); }

  navigateToFeature(link: string): void {
    this.closeModal();
    this.router.navigate([link]);
  }

  navigateToReport(url: string): void { window.open(url, '_blank'); }

  getChangeIcon(type: ChangelogChange['type']): string {
    return { feature: 'pi pi-plus-circle', improvement: 'pi pi-arrow-up', fix: 'pi pi-wrench' }[type];
  }

  getChangeClass(type: ChangelogChange['type']): string { return `change-icon-${type}`; }
  getChangeBadgeClass(type: ChangelogChange['type']): string { return `badge-${type}`; }
  getChangeLabel(type: ChangelogChange['type']): string {
    return { feature: 'Nuevo', improvement: 'Mejorado', fix: 'Corregido' }[type];
  }

  getGroupedChanges(entry: ChangelogEntry): { type: ChangelogChange['type']; items: ChangelogChange[] }[] {
    const groups = new Map<ChangelogChange['type'], ChangelogChange[]>();
    for (const change of entry.changes) groups.set(change.type, [...(groups.get(change.type) ?? []), change]);
    return (['feature', 'improvement', 'fix'] as const)
      .filter((type) => groups.has(type))
      .map((type) => ({ type, items: groups.get(type)! }));
  }
}
