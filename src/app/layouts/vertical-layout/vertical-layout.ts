import { Component, OnDestroy, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { LayoutStoreService } from "../../core/services/layout-store.service";
import { debounceTime, fromEvent, Subscription } from "rxjs";
import { SidenavComponent } from "../components/sidenav/sidenav.component";
import { Topbar } from "../components/topbar/topbar";
import { Footer } from "../components/footer/footer";
import { GemClientesIdentityService } from "../../core/services/gem-clientes-identity.service";
import { DialogService } from 'primeng/dynamicdialog';
import { ChangelogModalComponent } from '../../views/changelog/changelog-modal';
import { VersionService } from '../../core/services/version';


@Component({
  selector: 'app-vertical-layout',
  imports: [
    RouterOutlet,
    SidenavComponent,
    Topbar,
    Footer,
  ],
  templateUrl: './vertical-layout.html',
  styles: `
    .content-page {
      position: relative;
    }
  `,
  providers: [DialogService]
})
export class VerticalLayout implements OnInit, OnDestroy {

  constructor(public layout: LayoutStoreService, private identity: GemClientesIdentityService, private versionService: VersionService, private dialogService: DialogService) { }
  resizeSubscription!: Subscription
  private changelogTimer?: ReturnType<typeof setTimeout>

  ngOnInit() {
    if (!this.identity.identity()) this.identity.load().subscribe();
    this.onResize()
    this.checkAndShowChangelog()

    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(debounceTime(200))
      .subscribe(() => this.onResize())
  }

  private checkAndShowChangelog(): void {
    this.versionService.getVersion().subscribe({
      next: ({ version }) => {
        if (!version || version === localStorage.getItem('lastSeenVersion')) return;
        this.changelogTimer = setTimeout(() => this.dialogService.open(ChangelogModalComponent, {
          header: 'Novedades', width: '600px', modal: true, dismissableMask: true, styleClass: 'changelog-dialog'
        }), 1000);
      },
    });
  }

  onResize(): void {
    const width = window.innerWidth

    if (width <= 1140) {
      this.layout.setSidenavSize('offcanvas')
    } else {
      this.layout.setSidenavSize('default')
    }
  }

  ngOnDestroy(): void {
    this.resizeSubscription?.unsubscribe()
    if (this.changelogTimer) clearTimeout(this.changelogTimer)
  }
}
