import { Injectable } from '@angular/core';
import { CardType, PaymentDetails } from '@spartacus/cart/base/root';
import { Observable } from 'rxjs';
import { CheckoutPaymentAdapter } from './checkout-payment.adapter';

@Injectable()
export class CheckoutPaymentConnector {
  constructor(protected adapter: CheckoutPaymentAdapter) {}

  public createPaymentDetails(
    userId: string,
    cartId: string,
    paymentDetails: PaymentDetails
  ): Observable<PaymentDetails> {
    return this.adapter.createPaymentDetails(userId, cartId, paymentDetails);
  }

  public setPaymentDetails(
    userId: string,
    cartId: string,
    paymentDetailsId: string
  ): Observable<unknown> {
    return this.adapter.setPaymentDetails(userId, cartId, paymentDetailsId);
  }

  getCardTypes(): Observable<CardType[]> {
    return this.adapter.getCardTypes();
  }
}
