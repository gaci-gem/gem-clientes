export interface GemClientesTicket {
  id: number;
  subject: string;
  description: string;
  status: string;
  externalReference: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GemClientesTicketEvent {
  id: string;
  type: string;
  code: string;
  title: string;
  visibleState: 'OPEN' | 'CLOSED';
}

export interface GemClientesTicketDetail extends GemClientesTicket {
  comments: GemClientesTicketComment[];
  events: GemClientesTicketEvent[];
  attachments?: GemClientesTicketAttachment[];
}

export interface GemClientesTicketComment {
  id: number;
  text: string;
  createdAt: string;
  updatedAt: string;
  source?: 'GEM_WEB' | 'GEM_CLIENTES' | 'EMAIL' | 'SYSTEM';
  displayName?: string | null;
  attachments?: GemClientesTicketAttachment[];
}

export const TICKET_ATTACHMENT_MAX_FILES = 10;
export const TICKET_ATTACHMENT_MAX_FILE_SIZE = 25 * 1024 * 1024;
export const TICKET_ATTACHMENT_MAX_TOTAL_SIZE = 50 * 1024 * 1024;
export const TICKET_ATTACHMENT_ACCEPT = 'image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain,text/csv,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const TICKET_ATTACHMENT_TYPES = new Set(TICKET_ATTACHMENT_ACCEPT.split(','));

export function validateTicketAttachments(files: File[]): string | null {
  if (files.length > TICKET_ATTACHMENT_MAX_FILES) return `Podés adjuntar hasta ${TICKET_ATTACHMENT_MAX_FILES} archivos.`;
  let total = 0;
  for (const file of files) {
    if (!TICKET_ATTACHMENT_TYPES.has(file.type.toLowerCase())) return `El tipo de archivo no está permitido: ${file.name}.`;
    if (file.size === 0 || file.size > TICKET_ATTACHMENT_MAX_FILE_SIZE) return `${file.name} supera el límite de 25 MB o está vacío.`;
    total += file.size;
  }
  return total > TICKET_ATTACHMENT_MAX_TOTAL_SIZE ? 'El tamaño total de los adjuntos no puede superar 50 MB.' : null;
}

export interface GemClientesTicketAttachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  checksum: string;
  createdAt: string;
  downloadUrl: string;
}

export interface CreateGemClientesTicket {
  subject: string;
  description: string;
  externalReference?: string;
  files?: File[];
}
