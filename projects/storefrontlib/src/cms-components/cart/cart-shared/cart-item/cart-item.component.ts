import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PromotionLocation, PromotionResult } from '@spartacus/core';
import { Observable } from 'rxjs';
import { PromotionService } from '../../../../shared/services/promotion/promotion.service';
import { ICON_TYPE } from '../../../misc/icon/icon.model';

export interface Item {
  entryNumber?: any;
  product?: any;
  quantity?: any;
  basePrice?: any;
  totalPrice?: any;
  updateable?: boolean;
  statusSummaryList?: any[];
  configurationInfos?: any[];
}

export interface CartItemComponentOptions {
  isSaveForLater?: boolean;
  optionalBtn?: any;
}

@Component({
  selector: 'cx-cart-item',
  templateUrl: './cart-item.component.html',
})
export class CartItemComponent implements OnInit {
  @Input() compact = false;
  @Input() item: Item;
  @Input() readonly = false;
  @Input() quantityControl: FormControl;

  @Output() view = new EventEmitter<any>();

  @Input() promotionLocation: PromotionLocation = PromotionLocation.ActiveCart;

  // TODO: evaluate whether this is generic enough
  @Input() options: CartItemComponentOptions = {
    isSaveForLater: false,
    optionalBtn: null,
  };

  appliedProductPromotions$: Observable<PromotionResult[]>;
  iconTypes = ICON_TYPE;

  constructor(protected promotionService: PromotionService) {}

  ngOnInit() {
    this.appliedProductPromotions$ = this.promotionService.getProductPromotionForEntry(
      this.item,
      this.promotionLocation
    );
  }

  isProductOutOfStock(product: any) {
    // TODO Move stocklevelstatuses across the app to an enum
    return (
      product &&
      product.stock &&
      product.stock.stockLevelStatus === 'outOfStock'
    );
  }

  removeItem() {
    this.quantityControl.setValue(0);
    this.quantityControl.markAsDirty();
  }

  viewItem() {
    this.view.emit();
  }

  /**
   * Verifies whether the configuration infos has any entries and the entry has any status.
   *
   * @returns {boolean} - whether the status of configuration infos entry has status
   */
  hasStatus(): boolean {
    return (
      this.item.configurationInfos?.length > 0 &&
      this.item.configurationInfos[0]?.status !== 'NONE'
    );
  }
}
