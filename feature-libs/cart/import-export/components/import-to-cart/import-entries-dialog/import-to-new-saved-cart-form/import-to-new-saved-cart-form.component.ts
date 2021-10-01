import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { of } from 'rxjs';
import { CxDatePipe } from '@spartacus/core';
import {
  LaunchDialogService,
  FilesFormValidators,
  ImportCsvFileService,
} from '@spartacus/storefront';
import { ImportExportConfig } from '@spartacus/cart/import-export/core';
import { ProductsData, NameSource } from '@spartacus/cart/import-export/core';
import { ImportEntriesFormComponent } from '../import-entries-form/import-entries-form.component';
import { ImportToCartService } from '../../import-to-cart.service';

@Component({
  selector: 'cx-import-to-new-saved-cart-form',
  templateUrl: './import-to-new-saved-cart-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CxDatePipe],
})
export class ImportToNewSavedCartFormComponent extends ImportEntriesFormComponent {
  descriptionMaxLength: number = 250;
  nameMaxLength: number = 50;

  @Output()
  submitEvent = new EventEmitter<{
    products: ProductsData;
    savedCartInfo?: {
      name: string;
      description: string;
    };
  }>();

  get descriptionsCharacterLeft(): number {
    return (
      this.descriptionMaxLength -
      (this.form.get('description')?.value?.length || 0)
    );
  }

  constructor(
    protected launchDialogService: LaunchDialogService,
    protected importToCartService: ImportToCartService,
    protected importCsvService: ImportCsvFileService,
    protected filesFormValidators: FilesFormValidators,
    protected importExportConfig: ImportExportConfig,
    protected datePipe: CxDatePipe
  ) {
    super(
      launchDialogService,
      importToCartService,
      importCsvService,
      filesFormValidators,
      importExportConfig
    );
  }

  save(): void {
    const file: File = this.form.get('file')?.value?.[0];
    if (this.separator !== undefined) {
      this.importCsvService
        .loadFile(file, this.separator)
        .subscribe((loadedFile: string[][]) => {
          this.submitEvent.emit({
            products: this.importToCartService.csvDataToProduct(loadedFile),
            savedCartInfo: {
              name: this.form.get('name')?.value,
              description: this.form.get('description')?.value,
            },
          });
        });
    }
  }

  protected buildForm(): FormGroup {
    const form = new FormGroup({});
    form.setControl(
      'file',
      new FormControl(
        '',
        [
          Validators.required,
          this.filesFormValidators.maxSize(
            this.componentData?.fileValidity?.maxSize
          ),
        ],
        [
          (control) =>
            this.separator !== undefined
              ? this.importCsvService.validateFile(control.value[0], {
                  separator: this.separator,
                  isDataParsable:
                    this.importToCartService.isDataParsableToProducts,
                  maxEntries: this.maxEntries,
                })
              : of(null),
        ]
      )
    );
    form.setControl(
      'name',
      new FormControl('', [
        Validators.required,
        Validators.maxLength(this.nameMaxLength),
      ])
    );
    form.setControl(
      'description',
      new FormControl('', [Validators.maxLength(this.descriptionMaxLength)])
    );
    return form;
  }

  updateCartName(): void {
    const nameField = this.form.get('name');
    if (
      nameField &&
      !nameField?.value &&
      this.componentData?.cartNameGeneration?.source
    ) {
      switch (this.componentData.cartNameGeneration.source) {
        case NameSource.FILE_NAME: {
          this.setFieldValueByFileName(nameField);
          break;
        }
        case NameSource.DATE_TIME: {
          this.setFieldValueByDatetime(nameField);
          break;
        }
        default: {
          break;
        }
      }
    }
  }

  protected setFieldValueByFileName(nameField: AbstractControl): void {
    const fileName = this.form
      .get('file')
      ?.value?.[0]?.name?.replace(/\.[^/.]+$/, '');
    nameField.setValue(fileName);
  }

  protected setFieldValueByDatetime(nameField: AbstractControl): void {
    const date = new Date();
    const fromDateOptions =
      this.componentData?.cartNameGeneration?.fromDateOptions;
    const mask = fromDateOptions?.mask;
    const prefix = fromDateOptions?.prefix ?? '';
    const suffix = fromDateOptions?.suffix ?? '';
    const dateString = mask
      ? this.datePipe.transform(date, mask)
      : this.datePipe.transform(date);
    nameField.setValue(`${prefix}${dateString}${suffix}`);
  }
}