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
  attachments?: GemClientesTicketAttachment[];
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
