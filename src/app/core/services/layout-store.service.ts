import { effect, Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LayoutState } from '../../types/layout';

const STORAGE_KEY = '__SIMPLE_ANGULAR_CONFIG__';
const defaultState: LayoutState = {
  skin: 'corporate',
  theme: 'light',
  position: 'fixed',
  topbar: { color: 'light' },
  sidenav: { color: 'light', size: 'default', user: false },
  isLoading: false,
  monochrome: false,
};

@Injectable({ providedIn: 'root' })
export class LayoutStoreService {
  readonly state = signal<LayoutState>(this.loadState());
  private readonly html = document.documentElement;
  private readonly layoutStateSubject = new BehaviorSubject<LayoutState>(this.state());
  readonly layoutState$ = this.layoutStateSubject.asObservable();

  constructor() {
    this.applyAllAttributes();
    effect(() => this.applyAllAttributes());
  }

  get skin() { return this.state().skin; }
  get theme() { return this.state().theme; }
  get position() { return this.state().position; }
  get topbarColor() { return this.state().topbar.color; }
  get sidenavColor() { return this.state().sidenav.color; }
  get sidenavSize() { return this.state().sidenav.size; }
  get sidenavUser() { return this.state().sidenav.user; }
  get isLoading() { return this.state().isLoading; }

  setSkin(skin: LayoutState['skin'], persist = true): void {
    this.updateState({ skin }, persist);
  }

  setTheme(theme: LayoutState['theme'], persist = true): void {
    this.updateState({ theme }, persist);
  }

  setLayoutPosition(position: LayoutState['position'], persist = true): void {
    this.updateState({ position }, persist);
  }

  setTopbarColor(color: LayoutState['topbar']['color'], persist = true): void {
    this.updateState({ topbar: { ...this.state().topbar, color } }, persist);
  }

  setSidenavColor(color: LayoutState['sidenav']['color'], persist = true): void {
    this.updateState({ sidenav: { ...this.state().sidenav, color } }, persist);
  }

  setSidenavSize(size: LayoutState['sidenav']['size'], persist = true): void {
    this.updateState({ sidenav: { ...this.state().sidenav, size } }, persist);
  }

  toggleMonochrome(persist = true): void {
    this.updateState({ monochrome: !this.state().monochrome }, persist);
  }

  toggleSidenavUser(persist = true): void {
    this.updateState({ sidenav: { ...this.state().sidenav, user: !this.state().sidenav.user } }, persist);
  }

  setIsLoading(isLoading: boolean): void {
    this.updateState({ isLoading }, true);
  }

  reset(persist = true): void {
    this.state.set({ ...defaultState, sidenav: { ...defaultState.sidenav } });
    this.applyAllAttributes();
    if (persist) this.persistToStorage();
    this.layoutStateSubject.next(this.state());
  }

  toggleSidenav(): void {
    if (this.sidenavSize === 'offcanvas') {
      this.toggleMobileSidenav();
      return;
    }
    this.setSidenavSize(this.sidenavSize === 'default' ? 'collapse' : 'default');
  }

  toggleMobileSidenav(): void {
    const enabled = this.html.classList.toggle('sidebar-enable');
    enabled ? this.showBackdrop() : this.hideBackdrop();
  }

  closeMobileSidenav(): void {
    this.html.classList.remove('sidebar-enable');
    this.hideBackdrop();
  }

  setHtmlAttribute(attr: string, value: string): void { this.html.setAttribute(attr, value); }
  removeHtmlAttribute(attr: string): void { this.html.removeAttribute(attr); }

  getSystemTheme(): 'light' | 'dark' {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  showBackdrop(): void {
    if (document.getElementById('custom-backdrop')) return;
    const backdrop = document.createElement('div');
    backdrop.id = 'custom-backdrop';
    backdrop.className = 'offcanvas-backdrop fade show';
    backdrop.addEventListener('click', () => this.closeMobileSidenav());
    document.body.appendChild(backdrop);
    document.body.style.overflow = 'hidden';
    if (window.innerWidth > 767) document.body.style.paddingRight = '15px';
  }

  hideBackdrop(): void {
    document.getElementById('custom-backdrop')?.remove();
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  private updateState(patch: Partial<LayoutState>, persist: boolean): void {
    this.state.update((current) => ({ ...current, ...patch }));
    if (persist) this.persistToStorage();
    this.applyAllAttributes();
    this.layoutStateSubject.next(this.state());
  }

  private loadState(): LayoutState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : {};
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return { ...defaultState, sidenav: { ...defaultState.sidenav } };
      }

      const skin = this.isSkin(parsed.skin) ? parsed.skin : defaultState.skin;
      return {
        ...defaultState,
        ...parsed,
        skin,
        topbar: { ...defaultState.topbar, ...parsed.topbar },
        sidenav: { ...defaultState.sidenav, ...parsed.sidenav },
      };
    } catch {
      return { ...defaultState, sidenav: { ...defaultState.sidenav } };
    }
  }

  private persistToStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state()));
  }

  private isSkin(value: unknown): value is LayoutState['skin'] {
    return [
      'shadcn', 'corporate', 'spotify', 'saas', 'nature', 'vintage',
      'leafline', 'ghibli', 'slack', 'material', 'flat', 'pastel',
      'caffieine', 'redshift', 'gaci',
    ].includes(value as LayoutState['skin']);
  }

  private applyAllAttributes(): void {
    const current = this.state();
    this.setHtmlAttribute('data-skin', current.skin);
    this.setHtmlAttribute('data-bs-theme', current.theme === 'system' ? this.getSystemTheme() : current.theme);
    this.setHtmlAttribute('data-layout-position', current.position);
    this.setHtmlAttribute('data-topbar-color', current.topbar.color);
    this.setHtmlAttribute('data-sidenav-color', current.sidenav.color);
    this.setHtmlAttribute('data-sidenav-size', current.sidenav.size);
    this.setHtmlAttribute('data-sidenav-user', String(current.sidenav.user));
    this.html.classList.toggle('monochrome', current.monochrome);
  }
}
