import { Component, inject } from '@angular/core'
import { AppMenuComponent } from './components/app-menu/app-menu.component'
import { SimplebarAngularModule } from 'simplebar-angular'
import { LayoutStoreService } from '../../../core/services/layout-store.service'
import { NgIcon } from '@ng-icons/core'
import { DialogService } from 'primeng/dynamicdialog'
import { ChangelogModalComponent } from '../../../views/changelog/changelog-modal'

@Component({
  selector: 'app-sidenav',
  imports: [
    // UserProfileComponent,
    AppMenuComponent,
    SimplebarAngularModule,
    NgIcon,
  ],
  providers: [DialogService],
  templateUrl: './sidenav.component.html',
})
export class SidenavComponent {
  private readonly dialogService = inject(DialogService);
  constructor(public layout: LayoutStoreService) { }

  toggleCollapseMenu() {
    this.layout.setSidenavSize(
      this.layout.sidenavSize === 'default' ? 'collapse' : 'default'
    )
  }

  openChangelog() {
    this.dialogService.open(ChangelogModalComponent, {
      header: 'Novedades', width: '600px', modal: true, dismissableMask: true, styleClass: 'changelog-dialog'
    });
  }

}
