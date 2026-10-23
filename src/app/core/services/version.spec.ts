import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { parseSimpleSemver, shouldShowChangelog, VersionService } from './version';

describe('VersionService', () => {
  let service: VersionService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [VersionService, provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(VersionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('caches the version request and appends a cache-busting query', () => {
    service.getVersion().subscribe();
    service.getVersion().subscribe();
    const request = http.expectOne((req) => req.urlWithParams.startsWith('assets/version.json?nocache='));
    expect(request.request.urlWithParams).toContain('nocache=');
    request.flush({ version: '0.1.0', branch: 'main', commitHash: 'abc', buildTime: 'now' });
  });

  describe('parseSimpleSemver', () => {
    it('parses major.minor.patch versions', () => {
      expect(parseSimpleSemver('0.5.1')).toEqual({ major: 0, minor: 5, patch: 1 });
    });

    it('rejects invalid versions', () => {
      expect(parseSimpleSemver('0.5')).toBeNull();
      expect(parseSimpleSemver('v0.5.1')).toBeNull();
      expect(parseSimpleSemver('01.5.1')).toBeNull();
    });
  });

  describe('shouldShowChangelog', () => {
    it('does not show the modal for a patch-only change', () => {
      expect(shouldShowChangelog('0.5.1', '0.5.0')).toBeFalse();
    });

    it('shows the modal for a minor or major change', () => {
      expect(shouldShowChangelog('0.6.0', '0.5.0')).toBeTrue();
      expect(shouldShowChangelog('1.0.0', '0.5.0')).toBeTrue();
    });

    it('shows the modal when lastSeenVersion is absent or invalid', () => {
      expect(shouldShowChangelog('0.5.1', null)).toBeTrue();
      expect(shouldShowChangelog('0.5.1', 'invalid')).toBeTrue();
    });

    it('does not show the modal when the current version is invalid', () => {
      expect(shouldShowChangelog('invalid', '0.5.0')).toBeFalse();
    });
  });
});
