import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { VersionService } from './version';

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
});
