import { Injectable } from '@angular/core';
import {
  CheckoutPaymentTypeFacade,
  PaymentTypeSetEvent,
} from '@spartacus/checkout/b2b/root';
import { CheckoutQueryFacade } from '@spartacus/checkout/base/root';
import {
  ActiveCartService,
  B2BPaymentTypeEnum,
  Command,
  CommandService,
  CommandStrategy,
  CurrencySetEvent,
  EventService,
  isJaloError,
  LanguageSetEvent,
  LoginEvent,
  LogoutEvent,
  OCC_USER_ID_ANONYMOUS,
  PaymentType,
  Query,
  QueryNotifier,
  QueryService,
  QueryState,
  UserIdService,
} from '@spartacus/core';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { CheckoutPaymentTypeConnector } from '../connectors/checkout-payment-type/checkout-payment-type.connector';

@Injectable()
export class CheckoutPaymentTypeService implements CheckoutPaymentTypeFacade {
  protected getPaymentTypesQueryReloadEvents(): QueryNotifier[] {
    return [LanguageSetEvent, CurrencySetEvent];
  }
  protected getPaymentTypesQueryResetEvents(): QueryNotifier[] {
    return [LogoutEvent, LoginEvent];
  }

  protected paymentTypesQuery: Query<PaymentType[]> = this.queryService.create(
    () => this.paymentTypeConnector.getPaymentTypes(),
    {
      reloadOn: this.getPaymentTypesQueryReloadEvents(),
      resetOn: this.getPaymentTypesQueryResetEvents(),
      retryOn: { shouldRetry: isJaloError },
    }
  );

  protected setPaymentTypeCommand: Command<
    { paymentTypeCode: string; purchaseOrderNumber?: string },
    unknown
  > = this.commandService.create<{
    paymentTypeCode: string;
    purchaseOrderNumber?: string;
  }>(
    ({ paymentTypeCode, purchaseOrderNumber }) =>
      this.checkoutPreconditions().pipe(
        switchMap(([userId, cartId]) =>
          this.paymentTypeConnector
            .setPaymentType(
              userId,
              cartId,
              paymentTypeCode,
              purchaseOrderNumber
            )
            .pipe(
              tap(() =>
                this.eventService.dispatch(
                  {
                    userId,
                    cartId,
                    paymentTypeCode,
                    purchaseOrderNumber,
                  },
                  PaymentTypeSetEvent
                )
              )
            )
        )
      ),
    {
      strategy: CommandStrategy.CancelPrevious,
    }
  );

  constructor(
    protected activeCartService: ActiveCartService,
    protected userIdService: UserIdService,
    protected queryService: QueryService,
    protected commandService: CommandService,
    protected paymentTypeConnector: CheckoutPaymentTypeConnector,
    protected eventService: EventService,
    protected checkoutQueryFacade: CheckoutQueryFacade
  ) {}

  protected checkoutPreconditions(): Observable<[string, string]> {
    return combineLatest([
      this.userIdService.takeUserId(),
      this.activeCartService.takeActiveCartId(),
    ]).pipe(
      take(1),
      map(([userId, cartId]) => {
        if (
          !userId ||
          !cartId ||
          (userId === OCC_USER_ID_ANONYMOUS &&
            !this.activeCartService.isGuestCart())
        ) {
          throw new Error('Checkout conditions not met');
        }
        return [userId, cartId];
      })
    );
  }

  getPaymentTypesState(): Observable<QueryState<PaymentType[] | undefined>> {
    return this.paymentTypesQuery.getState();
  }

  getPaymentTypes(): Observable<PaymentType[]> {
    return this.getPaymentTypesState().pipe(map((state) => state.data ?? []));
  }

  setPaymentType(
    paymentTypeCode: B2BPaymentTypeEnum,
    purchaseOrderNumber?: string
  ): Observable<unknown> {
    return this.setPaymentTypeCommand.execute({
      paymentTypeCode,
      purchaseOrderNumber,
    });
  }

  getSelectedPaymentTypeState(): Observable<
    QueryState<PaymentType | undefined>
  > {
    return this.checkoutQueryFacade
      .getCheckoutDetailsState()
      .pipe(map((state) => ({ ...state, data: state.data?.paymentType })));
  }

  isAccountPayment(): Observable<boolean> {
    return this.getSelectedPaymentTypeState().pipe(
      filter((state) => !state.loading),
      map((state) => state.data?.code === B2BPaymentTypeEnum.ACCOUNT_PAYMENT)
    );
  }

  getPurchaseOrderNumberState(): Observable<QueryState<string | undefined>> {
    return this.checkoutQueryFacade
      .getCheckoutDetailsState()
      .pipe(
        map((state) => ({ ...state, data: state.data?.purchaseOrderNumber }))
      );
  }
}
