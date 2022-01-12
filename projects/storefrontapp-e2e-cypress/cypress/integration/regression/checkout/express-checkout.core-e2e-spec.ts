import { CheckoutConfig } from '@spartacus/storefront';
import * as checkout from '../../../helpers/checkout-flow';
import { viewportContext } from '../../../helpers/viewport-context';
import { clearAllStorage } from '../../../support/utils/clear-all-storage';
import * as expressCheckout from '../../../helpers/express-checkout';

context('Express checkout', () => {
  viewportContext(['desktop'], () => {
    before(() => {
      //Temporary change. Test repeatability in pipeline.
      Cypress.config(
        'requestTimeout',
        Number(Cypress.config('requestTimeout')) * 2
      );
      clearAllStorage();
      cy.cxConfig({ checkout: { express: true } } as CheckoutConfig);
      checkout.visitHomePage();
    });

    beforeEach(() => {
      cy.restoreLocalStorage();
    });

    afterEach(() => {
      cy.saveLocalStorage();
    });
    expressCheckout.testExpressCheckout();
  });
});
