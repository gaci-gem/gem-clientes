import { TestBed } from '@angular/core/testing';
import { LayoutStoreService } from './layout-store.service';

const STORAGE_KEY = '__SIMPLE_ANGULAR_CONFIG__';

describe('LayoutStoreService', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    document.documentElement.removeAttribute('data-skin');
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
});
