import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';

export interface AppVersion {
  version: string;
  branch: string;
  commitHash: string;
  buildTime: string;
  build?: string;
}

export interface SimpleSemver {
  major: number;
  minor: number;
  patch: number;
}

export function parseSimpleSemver(version: string): SimpleSemver | null {
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(version.trim());
  if (!match) return null;

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

export function shouldShowChangelog(currentVersion: string, lastSeenVersion: string | null): boolean {
  if (!lastSeenVersion) return true;

  const current = parseSimpleSemver(currentVersion);
  const lastSeen = parseSimpleSemver(lastSeenVersion);

  // Si la versión actual es inválida, no se abre el modal automáticamente.
  if (!current) return false;
  // Un lastSeen inválido no permite confirmar que las novedades ya fueron vistas.
  if (!lastSeen) return true;

  return current.major !== lastSeen.major || current.minor !== lastSeen.minor;
}

@Injectable({ providedIn: 'root' })
export class VersionService {
  private version$?: Observable<AppVersion>;

  constructor(private http: HttpClient) {}

  getVersion(): Observable<AppVersion> {
    if (!this.version$) {
      this.version$ = this.http
        .get<AppVersion>('assets/version.json?nocache=' + Date.now())
        .pipe(shareReplay(1));
    }
    return this.version$;
  }
}
