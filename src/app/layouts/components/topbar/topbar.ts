import { ChangeDetectorRef, Component } from "@angular/core";
import { UserProfile } from "./components/user-profile/user-profile";
import { RouterLink } from "@angular/router";
import { NgIcon } from "@ng-icons/core";
import { LayoutStoreService } from "../../../core/services/layout-store.service";
import { appLogo } from "../../../constants";
import { Subject } from "rxjs";
import { ThemeToggler } from "./components/theme-toggler/theme-toggler";
import { AppLogo } from "../../../components/app-logo";

@Component({
  selector: 'app-topbar',
  imports: [
    NgIcon,
    RouterLink,
    ThemeToggler,
    UserProfile,
    // NotificationDropdown,
    AppLogo,
    // ThemeDropdown,
  ],
  templateUrl: './topbar.html',
  standalone: true
})
export class Topbar {
  constructor(
    public layout: LayoutStoreService,
    protected cdr: ChangeDetectorRef,
  ) { }
  appLogo = appLogo;

  // Estado para el offcanvas
  showUserNotes = false;
  notaSeleccionadaId: string | null = null;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar() {
    const html = document.documentElement
    const currentSize = html.getAttribute('data-sidenav-size')
    const savedSize = this.layout.sidenavSize


    if (currentSize === 'offcanvas') {
      html.classList.toggle('sidebar-enable')
      this.layout.showBackdrop()
    } else {
      this.layout.setSidenavSize(
        currentSize === 'collapse' ? 'default' : 'collapse'
      )
    }
  }
}
