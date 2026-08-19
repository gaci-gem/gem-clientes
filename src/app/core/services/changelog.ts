export interface ChangelogEntry {
  version: string;
  date: string;
  isFuture?: boolean;
  estimatedDate?: string;
  changes: ChangelogChange[];
}

export interface ChangelogChange {
  type: 'feature' | 'improvement' | 'fix';
  text: string;
  link?: string;
  urlReport?: string;
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.1.1',
    date: '2026-08-19',
    changes: [
      { type: 'improvement', text: 'Ahora es más fácil acceder a Novedades y consultar su historial.' },
      { type: 'improvement', text: 'Hicimos más clara la gestión de solicitudes, documentos e imágenes.' },
      { type: 'fix', text: 'Mejoramos la estabilidad general de la aplicación.' },
    ],
  },
  {
    version: '0.1.0',
    date: '2026-08-19',
    changes: [
      { type: 'feature', text: 'Primera versión del Portal de Clientes GEM.' },
      { type: 'feature', text: 'Consulta y seguimiento de tus solicitudes.' },
      { type: 'feature', text: 'Gestión de cuenta y credenciales de acceso.' },
    ],
  },
  // Future releases can set isFuture and estimatedDate without affecting startup detection.
];
