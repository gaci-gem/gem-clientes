import { Component, inject } from '@angular/core'
import { AppMenuComponent } from './components/app-menu/app-menu.component'
import { SimplebarAngularModule } from 'simplebar-angular'
import { LayoutStoreService } from '../../../core/services/layout-store.service'
import { NgIcon } from '@ng-icons/core'

@Component({
  selector: 'app-sidenav',
  imports: [
    // UserProfileComponent,
    AppMenuComponent,
    SimplebarAngularModule,
    NgIcon,
  ],
  templateUrl: './sidenav.component.html',
})
export class SidenavComponent {
  constructor(public layout: LayoutStoreService) { }

  toggleCollapseMenu() {
    this.layout.setSidenavSize(
      this.layout.sidenavSize === 'default' ? 'collapse' : 'default'
    )
  }

}
