import { environment } from '@/environments/environment';
import { Component, Output, EventEmitter, Input, OnInit, inject } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { FileUploadModule } from 'primeng/fileupload';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.html',
  styleUrl: './file-uploader.scss',
  imports: [FileUploadModule]
})
export class FileUploader implements OnInit {
  @Input() url:string = `${environment.BASE_URL}/evento/adicion`;
  @Output() filesUploaded = new EventEmitter<any>();
  protected config = inject(DynamicDialogConfig);

  eventoId!: string;
  usuarioId!: string;

  ngOnInit() {
    this.eventoId = this.config.data.eventoId;
    this.usuarioId = this.config.data.usuarioId;
  }

  onBeforeSend(event: any) {
    console.log("onBeforeSend", event);
    console.log(this.eventoId);
    const formData: FormData = event.formData;
    formData.append('eventoId', this.eventoId);
    formData.append('usuarioId', this.usuarioId);
    formData.append('tipo', "ADJUNTO");
    formData.append('comentario', "");
    
  }

  onUpload(event: any) {
    this.filesUploaded.emit(event);
  }
}
