import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import {
  Storage,
  getDownloadURL,
  ref,
  uploadBytes,
} from '@angular/fire/storage';
import { QRCodeComponent, QRCodeModule } from 'angularx-qrcode';

import { CombiRecord, RecordRole } from '../../core/models/record.model';
import { RecordService } from 'src/app/core/services/record.service';

@Component({
  selector: 'combi-credential',
  standalone: true,
  imports: [QRCodeModule],
  template: `
    <canvas
      #credentialCanvas
      [width]="WIDTH"
      [height]="HEIGHT"
      style="max-width: 100%;"
    ></canvas>
    <qrcode
      #qrCode
      elementType="img"
      errorCorrectionLevel="M"
      hidden
      [margin]="0"
      [qrdata]="recordCode"
      [width]="QR_SIZE"
    ></qrcode>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CredentialComponent {
  @Input({ required: true }) set record(record: CombiRecord | undefined) {
    this._record = record;
    this.loadCredential(record);
  }

  @ViewChild('credentialCanvas', { static: true })
  credentialCanvas?: ElementRef;

  recordCode = '';

  readonly HEIGHT = 542;
  readonly WIDTH = 354;
  readonly QR_SIZE = 180;

  private _record?: CombiRecord;
  private storage = inject(Storage);
  private recordService = inject(RecordService);

  private readonly QR_TOP = 220;
  private readonly QR_LEFT = (this.WIDTH - this.QR_SIZE) / 2;
  private readonly NAME_TOP = 200;
  private readonly NAME_LEFT = this.WIDTH / 2;
  private readonly TEMPLATES: Record<RecordRole, string> = {
    [RecordRole.PARTICIPANTE]: 'assets/img/PARTICIPANTE-ai-25.png',
    [RecordRole.STAFF]: 'assets/img/STAFF-ai-25.png',
    [RecordRole.MENTOR]: 'assets/img/MENTOR-ai-25.png',
    [RecordRole.JURADO]: 'assets/img/JURADO-ai-25.png',
  };
  private readonly STORAGE_FOLDER = 'tech-join';

  @ViewChild('qrCode', { static: true }) private qrCode?: QRCodeComponent;

  @Output() private saveInCloud = new EventEmitter<string>();
  @Output() private credentialLoaded = new EventEmitter<void>();

  print(): void {
    if (!this._record) {
      return;
    }

    const printButton = document.createElement('a');
    printButton.download = this._record?.name;
    printButton.href =
      this.credentialCanvas?.nativeElement.toDataURL('image/png;base64');
    printButton.click();
  }

  saveInStorage(): void {
    if (!this._record) {
      return;
    }

    this.credentialCanvas?.nativeElement.toBlob((file: Blob) => {
      const storageRef = ref(
        this.storage,
        `${this.STORAGE_FOLDER}/${this._record?.id}`,
      );

      uploadBytes(storageRef, file).then(async (snapshot) => {
        const credentialUrl = await getDownloadURL(snapshot.ref);

        this.saveInCloud.emit(credentialUrl);

        if (!this._record) {
          return;
        }

        this.recordService.updateRecord(this._record?.id, { credentialUrl });
      });
    });
  }

  private loadCredential(record: CombiRecord | undefined): void {
    if (!record) {
      return;
    }

    this.recordCode = record['id'] as string;
    const templateImage = new Image();
    templateImage.src =
      this.TEMPLATES[record.role] || this.TEMPLATES[RecordRole.PARTICIPANTE];
    templateImage.onload = () =>
      this.loadCredentialImage(templateImage, record);
  }

  private loadCredentialImage(
    templateImage: HTMLImageElement,
    record: CombiRecord,
  ): void {
    let qrImage = this.qrCode?.qrcElement.nativeElement.querySelector('img');

    if (!qrImage.src) {
      qrImage = this.qrCode?.qrcElement.nativeElement.querySelector('canvas');
    }

    this.buildImageContext(templateImage, record, qrImage);
  }

  private buildImageContext(
    templateImage: HTMLImageElement,
    record: CombiRecord,
    qrImage: CanvasImageSource,
  ): void {
    const context = (
      this.credentialCanvas?.nativeElement as HTMLCanvasElement
    ).getContext('2d');

    if (!context) {
      return;
    }

    const googleSans = new FontFace(
      'GoogleSans',
      'url(assets/fonts/GoogleSans/GoogleSans-Medium.ttf)',
    );

    (document.fonts as any).add(googleSans);
    googleSans.load();

    document.fonts.ready.then(() => {
      // Ready to use the font in a canvas context
      context.font = '500 16px GoogleSans';
      context.textAlign = 'center';
      context.fillStyle = 'black';

      context.drawImage(templateImage, 0, 0);
      context.fillText(record.name, this.NAME_LEFT, this.NAME_TOP);
      // Uncomment in case we need to show the role in the credential
      // context.strokeText(record.role, this.NAME_LEFT, this.NAME_TOP + 24);
      context.strokeRect(0, 0, this.WIDTH, this.HEIGHT);
      context.drawImage(qrImage, this.QR_LEFT, this.QR_TOP);

      this.credentialLoaded.emit();
    });
  }
}
