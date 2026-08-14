import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { LayoutStoreService } from "../../core/services/layout-store.service";
import { debounceTime, fromEvent, Subscription } from "rxjs";
import { SidenavComponent } from "../components/sidenav/sidenav.component";
import { Topbar } from "../components/topbar/topbar";
import { Footer } from "../components/footer/footer";
import { PortalClientIdentityService } from "../../core/services/portal-client-identity.service";


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
  providers: []
})
export class VerticalLayout implements OnInit, OnDestroy {

  constructor(public layout: LayoutStoreService, private identity: PortalClientIdentityService) { }
  resizeSubscription!: Subscription

  ngOnInit() {
    if (!this.identity.identity()) this.identity.load().subscribe();
    this.onResize()

    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(debounceTime(200))
      .subscribe(() => this.onResize())
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
  }
}
