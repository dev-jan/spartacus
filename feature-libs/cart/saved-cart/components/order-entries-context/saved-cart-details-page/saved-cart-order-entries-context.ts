import { Injectable } from '@angular/core';
import { ActionsSubject } from '@ngrx/store';
import {
  AddOrderEntriesContext,
  CartOrderEntriesContext,
  GetOrderEntriesContext,
} from '@spartacus/cart/main/components';
import {
  Cart,
  MultiCartFacade,
  OrderEntriesSource,
  OrderEntry,
  ProductData,
} from '@spartacus/cart/main/root';
import { SavedCartFacade } from '@spartacus/cart/saved-cart/root';
import { RoutingService, UserIdService } from '@spartacus/core';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SavedCartOrderEntriesContext
  extends CartOrderEntriesContext
  implements AddOrderEntriesContext, GetOrderEntriesContext
{
  readonly type = OrderEntriesSource.SAVED_CART;

  constructor(
    protected actionsSubject: ActionsSubject,
    protected userIdService: UserIdService,
    protected multiCartService: MultiCartFacade,
    protected savedCartService: SavedCartFacade,
    protected routingService: RoutingService
  ) {
    super(actionsSubject);
  }

  protected savedCartId$ = this.routingService.getRouterState().pipe(
    map((routingData) => routingData.state.params.savedCartId),
    distinctUntilChanged()
  );

  getEntries(): Observable<OrderEntry[]> {
    return this.savedCartId$.pipe(
      switchMap((cartId) => this.savedCartService.get(cartId)),
      map((cart: Cart | undefined) => cart?.entries ?? ([] as OrderEntry[]))
    );
  }

  protected add(products: ProductData[]): Observable<string> {
    return combineLatest([
      this.userIdService.takeUserId(),
      this.savedCartId$,
    ]).pipe(
      tap(([userId, cartId]) =>
        this.multiCartService.addEntries(userId, cartId, products)
      ),
      map(([_userId, cartId]) => cartId)
    );
  }
}