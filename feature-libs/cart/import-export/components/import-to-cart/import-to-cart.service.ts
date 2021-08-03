import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { ofType } from '@ngrx/effects';
import { ActionsSubject } from '@ngrx/store';
import {
  Cart,
  CartActions,
  MultiCartService,
  StateUtils,
  UserIdService,
} from '@spartacus/core';
import { SavedCartService } from '@spartacus/cart/saved-cart/core';
import {
  ProductsData,
  ProductImportStatus,
  ProductImportInfo,
} from '@spartacus/cart/import-export/core';

@Injectable()
export class ImportToCartService {
  constructor(
    protected userIdService: UserIdService,
    protected multiCartService: MultiCartService,
    protected savedCartService: SavedCartService,
    protected actionsSubject: ActionsSubject
  ) {}

  loadProductsToCart(
    products: ProductsData,
    savedCartInfo: { name: string; description?: string }
  ) {
    return this.userIdService.takeUserId().pipe(
      switchMap((userId: string) =>
        this.multiCartService
          .createCart({
            userId,
            extraData: { active: false },
          })
          .pipe(
            map(
              (cartData: StateUtils.ProcessesLoaderState<Cart>) =>
                cartData.value?.code
            ),
            filter(Boolean),
            tap((cartId: string) => {
              // getCartByUserId
              this.savedCartService.saveCart({
                cartId,
                saveCartName: savedCartInfo.name,
                saveCartDescription: savedCartInfo.description,
              });
              this.savedCartService.loadSavedCarts();
            }),
            // delayWhen((cartId: string) =>
            //   this.savedCartService
            //     .isStable(cartId)
            //     .pipe(filter((stable: boolean) => stable))
            // ),
            tap((cartId: string) =>
              this.multiCartService.addEntries(userId, cartId, products)
            ),
            switchMap((cartId: string) => this.getResults(cartId)),
            // wiemy ile jest entries -> N
            // po N sukcesach/errorrach chcemy przestac emitować
            take(products.length) // TODO: risky, think about cases when it will be interupted
          )
      )
    );
  }

  csvDataToProduct(csvData: string[][]): ProductsData {
    return csvData.map((row: string[]) => ({
      productCode: row[0],
      quantity: Number(row[1]),
    }));
  }

  isDataParsable(data: string[][]): Boolean {
    const patternRegex = new RegExp(/(?<=\s|^)\d+(?=\s|$)/);
    return data.every((row) => patternRegex.test(row[1]));
  }

  /**
   * Returns observable which emits on every added product success or failure.
   *
   * It completes when all entries are added.
   *
   * HOW TO USE IT IN COMPONENT:
   * We need a logic for a summary (i.e. convert partial success to a failure)
   */
  protected getResults(cartId: string): Observable<ProductImportInfo> {
    return this.actionsSubject.pipe(
      ofType(
        CartActions.CART_ADD_ENTRY_SUCCESS,
        CartActions.CART_ADD_ENTRY_FAIL
      ), // TODO: other product types (i.e. configurable product) might use different actions for addding to cart
      filter(
        (
          action: CartActions.CartAddEntrySuccess | CartActions.CartAddEntryFail
        ) => action.payload.cartId === cartId
      ),
      map((action) => this.mapMessages(action))
    );
    // TODO: don't retrurn RAW NGRX ACTIONS
    // ALTERNATIVE IDEA:
    // add each entry one by one, then on success/failure emit a result
    // and then add next entry
  }

  protected mapMessages(
    action: CartActions.CartAddEntrySuccess | CartActions.CartAddEntryFail
  ): ProductImportInfo {
    if (action instanceof CartActions.CartAddEntryFail) {
      const { productCode, error } = action.payload;
      if (error?.details[0]?.type === 'UnknownIdentifierError') {
        return {
          productCode,
          statusCode: ProductImportStatus.UNKNOWN_IDENTIFIER,
        };
      }
    } else if (action instanceof CartActions.CartAddEntrySuccess) {
      const {
        productCode,
        statusCode,
        quantity,
        quantityAdded,
        entry,
      } = action.payload;
      if (statusCode === ProductImportStatus.LOW_STOCK) {
        return {
          productCode,
          statusCode,
          productName: entry?.product.name,
          quantity,
          quantityAdded,
        };
      }
      if (statusCode === ProductImportStatus.SUCCESS) {
        return { productCode, statusCode };
      }
    }
  }
}