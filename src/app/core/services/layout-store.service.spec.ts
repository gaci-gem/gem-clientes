import { TestBed } from '@angular/core/testing';
import { LayoutStoreService } from './layout-store.service';

const STORAGE_KEY = '__SIMPLE_ANGULAR_CONFIG__';

describe('LayoutStoreService', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    document.documentElement.removeAttribute('data-skin');
    document.documentElement.removeAttribute('data-bs-theme');
    document.documentElement.classList.remove('theme-switching');
    TestBed.configureTestingModule({ providers: [LayoutStoreService] });
  });

  it('uses the configured default skin when storage is empty', () => {
    const service = TestBed.inject(LayoutStoreService);

    expect(service.skin).toBe('corporate');
    expect(document.documentElement.getAttribute('data-skin')).toBe('corporate');
  });

  it('updates the data-skin attribute when the skin changes', () => {
    const service = TestBed.inject(LayoutStoreService);

    service.setSkin('spotify', false);

    expect(service.skin).toBe('spotify');
    expect(document.documentElement.getAttribute('data-skin')).toBe('spotify');
  });

  it('keeps theme switching disabled until the next animation frame', () => {
    const frameCallbacks: FrameRequestCallback[] = [];
    spyOn(window, 'requestAnimationFrame').and.callFake((callback) => {
      frameCallbacks.push(callback);
      return frameCallbacks.length;
    });

    const service = TestBed.inject(LayoutStoreService);
    service.setTheme('dark', false);

    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
    expect(document.documentElement.classList.contains('theme-switching')).toBeTrue();

    frameCallbacks[0]?.(0);

    expect(document.documentElement.classList.contains('theme-switching')).toBeFalse();
  });
});
