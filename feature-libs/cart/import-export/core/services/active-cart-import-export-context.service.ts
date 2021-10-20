import { Injectable } from '@angular/core';
import { ActionsSubject } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ActiveCartService, OrderEntry } from '@spartacus/core';
import { CartTypes } from '../model/import-export.model';
import { ProductData } from '../model/import-to-cart.model';
import { CartImportExportContext } from './cart-import-export.context';
import { ImportExportContext } from './import-export.context';

@Injectable({
  providedIn: 'root',
})
export class ActiveCartImportExportContext
  extends CartImportExportContext
  implements ImportExportContext
{
  readonly type = CartTypes.ACTIVE_CART;

  constructor(
    protected actionsSubject: ActionsSubject,
    protected activeCartService: ActiveCartService
  ) {
    super(actionsSubject);
  }

  getEntries(): Observable<OrderEntry[]> {
    return this.activeCartService.getEntries();
  }

  protected add(products: ProductData[]): Observable<string> {
    this.activeCartService.addEntries(this.mapProductsToOrderEntries(products));
    return this.activeCartService.getActiveCartId();
  }

  protected mapProductsToOrderEntries(products: ProductData[]): OrderEntry[] {
    return products.map(
      (product: { productCode: string; quantity: number }) => ({
        product: { code: product.productCode },
        quantity: product.quantity,
      })
    );
  }
}