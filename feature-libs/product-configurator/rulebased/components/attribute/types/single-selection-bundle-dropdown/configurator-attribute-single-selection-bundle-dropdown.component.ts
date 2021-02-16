import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { ConfigFormUpdateEvent } from '../../../form/configurator-form.event';
import { Configurator } from '../../../../core/model/configurator.model';
import { ConfiguratorAttributeBaseComponent } from '../base/configurator-attribute-base.component';
import { FormControl } from '@angular/forms';
import { ConfiguratorAttributeQuantityService } from '../../quantity/configurator-attribute-quantity.service';
import { BehaviorSubject } from 'rxjs';
import { ConfiguratorPriceService } from '../../../../core/facade/configurator-price.service';
import { ConfiguratorPriceComponentOptions } from '../../../price/configurator-price.component';
import { ConfiguratorAttributeProductCardComponentOptions } from '../../product-card/configurator-attribute-product-card.component';
import {
  ConfiguratorAttributeQuantityComponentOptions,
  Quantity,
} from '../../quantity/configurator-attribute-quantity.component';

@Component({
  selector: 'cx-configurator-attribute-single-selection-bundle-dropdown',
  templateUrl:
    './configurator-attribute-single-selection-bundle-dropdown.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfiguratorAttributeSingleSelectionBundleDropdownComponent
  extends ConfiguratorAttributeBaseComponent
  implements OnInit {
  attributeDropDownForm = new FormControl('');
  loading$ = new BehaviorSubject<boolean>(false);
  selectionValue: Configurator.Value;

  @Input() attribute: Configurator.Attribute;
  @Input() group: string;
  @Input() ownerKey: string;

  @Output() selectionChange = new EventEmitter<ConfigFormUpdateEvent>();

  constructor(
    private quantityService: ConfiguratorAttributeQuantityService,
    private priceService: ConfiguratorPriceService
  ) {
    super();
  }

  ngOnInit() {
    this.attributeDropDownForm.setValue(this.attribute?.selectedSingleValue);

    if (this.attribute?.values && this.attribute?.values?.length > 0) {
      this.selectionValue = this.attribute?.values.find(
        (value) => value.selected
      );
    }
  }

  get withQuantity() {
    return this.quantityService.withQuantity(
      this.attribute?.dataType,
      this.attribute?.uiType
    );
  }

  get disableQuantityActions() {
    return this.quantityService.disableQuantityActions(
      this.attributeDropDownForm?.value
    );
  }

  onSelect(): void {
    const event: ConfigFormUpdateEvent = {
      changedAttribute: {
        ...this.attribute,
        selectedSingleValue: this.attributeDropDownForm?.value,
      },
      ownerKey: this.ownerKey,
      updateType: Configurator.UpdateType.ATTRIBUTE,
    };
    this.selectionChange.emit(event);
  }

  onDeselect(): void {
    const event: ConfigFormUpdateEvent = {
      changedAttribute: {
        ...this.attribute,
        selectedSingleValue: '0',
      },
      ownerKey: this.ownerKey,
      updateType: Configurator.UpdateType.ATTRIBUTE,
    };

    this.selectionChange.emit(event);
  }

  onChangeQuantity(eventObject): void {
    this.loading$.next(true);

    if (!eventObject.quantity) {
      this.attributeDropDownForm.setValue('');
      this.onSelect();
    } else {
      const event: ConfigFormUpdateEvent = {
        changedAttribute: {
          ...this.attribute,
          quantity: eventObject.quantity,
        },
        ownerKey: this.ownerKey,
        updateType: Configurator.UpdateType.ATTRIBUTE_QUANTITY,
      };

      this.selectionChange.emit(event);
    }
  }

  getSelectedValuePrice(): Configurator.PriceDetails | undefined {
    return this.priceService.getSelectedValuePrice(this.attribute);
  }

  isPriceDataDefined(): boolean {
    return this.priceService.isPriceDataDefined(this.attribute);
  }

  /**
   * Extract corresponding price formula parameters
   *
   * @return {ConfiguratorPriceComponentOptions} - New price formula
   */
  extractPriceFormulaParameters(): ConfiguratorPriceComponentOptions {
    return {
      quantity: this.attribute?.quantity,
      price: this.getSelectedValuePrice(),
      priceTotal: this.attribute?.attributePriceTotal,
      isLightedUp: true,
    };
  }

  /**
   * Extract corresponding product card parameters
   *
   * @return {ConfiguratorAttributeProductCardComponentOptions} - New product card options
   */
  extractProductCardParameters(): ConfiguratorAttributeProductCardComponentOptions {
    return {
      preventAction: true,
      product: this.selectionValue,
      singleDropdown: true,
      withQuantity: false,
    };
  }

  /**
   *  Extract corresponding quantity parameters
   *
   * @param {boolean} disableQuantityActions - Disable quantity actions
   * @return {ConfiguratorAttributeQuantityComponentOptions} - New quantity options
   */
  extractQuantityParameters(
    disableQuantityActions: boolean
  ): ConfiguratorAttributeQuantityComponentOptions {
    const initialQuantity: Quantity = {
      quantity:
        this.attributeDropDownForm.value !== '0' ? this.attribute?.quantity : 0,
    };

    return {
      allowZero: !this.attribute?.required,
      initialQuantity: initialQuantity,
      disableQuantityActions: disableQuantityActions,
    };
  }
}
