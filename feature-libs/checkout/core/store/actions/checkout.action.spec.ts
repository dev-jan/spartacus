import {
  Address,
  DeliveryMode,
  MULTI_CART_DATA,
  Order,
  PROCESS_FEATURE,
  StateUtils,
} from '@spartacus/core';
import { CheckoutActions } from '../actions/index';
import {
  PLACED_ORDER_PROCESS_ID,
  SET_DELIVERY_ADDRESS_PROCESS_ID,
  SET_DELIVERY_MODE_PROCESS_ID,
  SET_SUPPORTED_DELIVERY_MODE_PROCESS_ID,
} from '../checkout-state';

const userId = 'testUserId';
const cartId = 'testCartId';
const termsChecked = true;
const selectedModeId = 'selectedModeId';

const orderDetails: Order = {
  code: 'testOrder123',
};

const address: Address = {
  firstName: 'John',
  lastName: 'Doe',
  titleCode: 'mr',
  line1: 'Toyosaki 2 create on cart',
  town: 'Montreal',
  postalCode: 'L6M1P9',
  country: { isocode: 'CA' },
};

const modes: DeliveryMode[] = [{ code: 'code1' }, { code: 'code2' }];

describe('Checkout Actions', () => {
  describe('AddDeliveryAddress', () => {
    it('should create the action', () => {
      const payload = {
        userId,
        cartId,
        address,
      };

      const action = new CheckoutActions.AddDeliveryAddress(payload);
      expect({ ...action }).toEqual({
        type: CheckoutActions.ADD_DELIVERY_ADDRESS,
        payload,
      });
    });
  });

  describe('AddDeliveryAddressFail', () => {
    it('should create the action', () => {
      const error = 'anError';
      const action = new CheckoutActions.AddDeliveryAddressFail(error);

      expect({ ...action }).toEqual({
        type: CheckoutActions.ADD_DELIVERY_ADDRESS_FAIL,
        payload: error,
      });
    });
  });

  describe('AddDeliveryAddressSuccess', () => {
    it('should create the action', () => {
      const action = new CheckoutActions.AddDeliveryAddressSuccess(address);
      expect({ ...action }).toEqual({
        type: CheckoutActions.ADD_DELIVERY_ADDRESS_SUCCESS,
        payload: address,
      });
    });
  });

  describe('SetDeliveryAddress', () => {
    it('should create the action', () => {
      const payload = {
        userId,
        cartId,
        address,
      };

      const action = new CheckoutActions.SetDeliveryAddress(payload);
      expect({ ...action }).toEqual({
        type: CheckoutActions.SET_DELIVERY_ADDRESS,
        payload,
        meta: StateUtils.entityLoadMeta(
          PROCESS_FEATURE,
          SET_DELIVERY_ADDRESS_PROCESS_ID
        ),
      });
    });
  });

  describe('SetDeliveryAddressFail', () => {
    it('should create the action', () => {
      const error = 'anError';
      const action = new CheckoutActions.SetDeliveryAddressFail(error);

      expect({ ...action }).toEqual({
        type: CheckoutActions.SET_DELIVERY_ADDRESS_FAIL,
        payload: error,
        meta: StateUtils.entityFailMeta(
          PROCESS_FEATURE,
          SET_DELIVERY_ADDRESS_PROCESS_ID,
          error
        ),
      });
    });
  });

  describe('SetDeliveryAddressSuccess', () => {
    it('should create the action', () => {
      const action = new CheckoutActions.SetDeliveryAddressSuccess(address);
      expect({ ...action }).toEqual({
        type: CheckoutActions.SET_DELIVERY_ADDRESS_SUCCESS,
        payload: address,
        meta: StateUtils.entitySuccessMeta(
          PROCESS_FEATURE,
          SET_DELIVERY_ADDRESS_PROCESS_ID
        ),
      });
    });
  });

  describe('ResetSetDeliveryAddressProcess', () => {
    it('should create the action', () => {
      const action = new CheckoutActions.ResetSetDeliveryAddressProcess();
      expect({ ...action }).toEqual({
        type: CheckoutActions.RESET_SET_DELIVERY_ADDRESS_PROCESS,
        meta: StateUtils.entityResetMeta(
          PROCESS_FEATURE,
          SET_DELIVERY_ADDRESS_PROCESS_ID
        ),
      });
    });
  });

  describe('Load Supported Delivery Modes from Cart', () => {
    describe('LoadSupportedDeliveryModes', () => {
      it('should create the action', () => {
        const payload = {
          userId,
          cartId,
        };

        const action = new CheckoutActions.LoadSupportedDeliveryModes(payload);
        expect({ ...action }).toEqual({
          type: CheckoutActions.LOAD_SUPPORTED_DELIVERY_MODES,
          payload,
          meta: StateUtils.entityLoadMeta(
            PROCESS_FEATURE,
            SET_SUPPORTED_DELIVERY_MODE_PROCESS_ID
          ),
        });
      });
    });

    describe('LoadSupportedDeliveryModesFail', () => {
      it('should create the action', () => {
        const error = 'anError';
        const action = new CheckoutActions.LoadSupportedDeliveryModesFail(
          error
        );

        expect({ ...action }).toEqual({
          type: CheckoutActions.LOAD_SUPPORTED_DELIVERY_MODES_FAIL,
          payload: error,
          meta: StateUtils.entityFailMeta(
            PROCESS_FEATURE,
            SET_SUPPORTED_DELIVERY_MODE_PROCESS_ID
          ),
        });
      });
    });

    describe('LoadSupportedDeliveryModesSuccess', () => {
      it('should create the action', () => {
        const action = new CheckoutActions.LoadSupportedDeliveryModesSuccess(
          modes
        );
        expect({ ...action }).toEqual({
          type: CheckoutActions.LOAD_SUPPORTED_DELIVERY_MODES_SUCCESS,
          payload: modes,
          meta: StateUtils.entitySuccessMeta(
            PROCESS_FEATURE,
            SET_SUPPORTED_DELIVERY_MODE_PROCESS_ID
          ),
        });
      });
    });
  });

  describe('Set Delivery Mode for Cart', () => {
    describe('SetDeliveryMode', () => {
      it('should create the action', () => {
        const payload = {
          userId,
          cartId,
          selectedModeId: selectedModeId,
        };

        const action = new CheckoutActions.SetDeliveryMode(payload);
        expect({ ...action }).toEqual({
          type: CheckoutActions.SET_DELIVERY_MODE,
          payload,
          meta: StateUtils.entityLoadMeta(
            PROCESS_FEATURE,
            SET_DELIVERY_MODE_PROCESS_ID
          ),
        });
      });
    });

    describe('SetDeliveryModeFail', () => {
      it('should create the action', () => {
        const error = 'anError';
        const action = new CheckoutActions.SetDeliveryModeFail(error);

        expect({ ...action }).toEqual({
          type: CheckoutActions.SET_DELIVERY_MODE_FAIL,
          payload: error,
          meta: StateUtils.entityFailMeta(
            PROCESS_FEATURE,
            SET_DELIVERY_MODE_PROCESS_ID,
            error
          ),
        });
      });
    });

    describe('SetDeliveryModeSuccess', () => {
      it('should create the action', () => {
        const action = new CheckoutActions.SetDeliveryModeSuccess(
          selectedModeId
        );
        expect({ ...action }).toEqual({
          type: CheckoutActions.SET_DELIVERY_MODE_SUCCESS,
          payload: selectedModeId,
          meta: StateUtils.entitySuccessMeta(
            PROCESS_FEATURE,
            SET_DELIVERY_MODE_PROCESS_ID
          ),
        });
      });
    });

    describe('ResetSetDeliveryModeProcess', () => {
      it('should create the action', () => {
        const action = new CheckoutActions.ResetSetDeliveryModeProcess();
        expect({ ...action }).toEqual({
          type: CheckoutActions.RESET_SET_DELIVERY_MODE_PROCESS,
          meta: StateUtils.entityResetMeta(
            PROCESS_FEATURE,
            SET_DELIVERY_MODE_PROCESS_ID
          ),
        });
      });
    });
  });

  describe('Place Order', () => {
    describe('PlaceOrder', () => {
      it('should create the action', () => {
        const payload = {
          userId,
          cartId,
          termsChecked,
        };

        const action = new CheckoutActions.PlaceOrder(payload);
        expect({ ...action }).toEqual({
          type: CheckoutActions.PLACE_ORDER,
          payload,
          meta: StateUtils.entityLoadMeta(
            PROCESS_FEATURE,
            PLACED_ORDER_PROCESS_ID
          ),
        });
      });
    });

    describe('PlaceOrderFail', () => {
      it('should create the action', () => {
        const error = 'anError';
        const action = new CheckoutActions.PlaceOrderFail(error);

        expect({ ...action }).toEqual({
          type: CheckoutActions.PLACE_ORDER_FAIL,
          payload: error,
          meta: StateUtils.entityFailMeta(
            PROCESS_FEATURE,
            PLACED_ORDER_PROCESS_ID,
            error
          ),
        });
      });
    });

    describe('PlaceOrderSuccess', () => {
      it('should create the action', () => {
        const action = new CheckoutActions.PlaceOrderSuccess(orderDetails);
        expect({ ...action }).toEqual({
          type: CheckoutActions.PLACE_ORDER_SUCCESS,
          payload: orderDetails,
          meta: StateUtils.entitySuccessMeta(
            PROCESS_FEATURE,
            PLACED_ORDER_PROCESS_ID
          ),
        });
      });
    });

    describe('ClearPlaceOrder', () => {
      it('should create the action', () => {
        const action = new CheckoutActions.ClearPlaceOrder();
        expect({ ...action }).toEqual({
          type: CheckoutActions.CLEAR_PLACE_ORDER,
          meta: StateUtils.entityResetMeta(
            PROCESS_FEATURE,
            PLACED_ORDER_PROCESS_ID
          ),
        });
      });
    });
  });

  describe('Clear Checkout Step', () => {
    it('should create the action', () => {
      const action = new CheckoutActions.ClearCheckoutStep(2);
      expect({ ...action }).toEqual({
        type: CheckoutActions.CLEAR_CHECKOUT_STEP,
        payload: 2,
      });
    });
  });

  describe('Clear Checkout Data', () => {
    it('should create the action', () => {
      const action = new CheckoutActions.ClearCheckoutData();
      expect({ ...action }).toEqual({
        type: CheckoutActions.CLEAR_CHECKOUT_DATA,
      });
    });
  });

  describe('Clear Checkout Delivery Address', () => {
    it('should create the action', () => {
      const payload = {
        userId,
        cartId,
      };
      const action = new CheckoutActions.ClearCheckoutDeliveryAddress(payload);
      expect({ ...action }).toEqual({
        type: CheckoutActions.CLEAR_CHECKOUT_DELIVERY_ADDRESS,
        payload,
      });
    });
  });

  describe('Clear Checkout Delivery Address Fail', () => {
    it('should create the action', () => {
      const payload = {
        userId,
        cartId,
      };
      const action = new CheckoutActions.ClearCheckoutDeliveryAddressFail(
        payload
      );
      expect({ ...action }).toEqual({
        type: CheckoutActions.CLEAR_CHECKOUT_DELIVERY_ADDRESS_FAIL,
        payload,
      });
    });
  });

  describe('Clear Checkout Delivery Address Success', () => {
    it('should create the action', () => {
      const action = new CheckoutActions.ClearCheckoutDeliveryAddressSuccess();
      expect({ ...action }).toEqual({
        type: CheckoutActions.CLEAR_CHECKOUT_DELIVERY_ADDRESS_SUCCESS,
      });
    });
  });

  describe('Clear Checkout Delivery Mode', () => {
    it('should create the action', () => {
      const payload = {
        userId,
        cartId,
      };
      const action = new CheckoutActions.ClearCheckoutDeliveryMode(payload);
      expect({ ...action }).toEqual({
        type: CheckoutActions.CLEAR_CHECKOUT_DELIVERY_MODE,
        payload,
        meta: StateUtils.entityProcessesIncrementMeta(MULTI_CART_DATA, cartId),
      });
    });
  });

  describe('Clear Checkout Delivery Mode Fail', () => {
    it('should create the action', () => {
      const payload = {
        userId,
        cartId,
        error: 'anError',
      };
      const action = new CheckoutActions.ClearCheckoutDeliveryModeFail(payload);
      expect({ ...action }).toEqual({
        type: CheckoutActions.CLEAR_CHECKOUT_DELIVERY_MODE_FAIL,
        payload,
        meta: StateUtils.entityProcessesDecrementMeta(MULTI_CART_DATA, cartId),
      });
    });
  });

  describe('Clear Checkout Delivery Mode Success', () => {
    it('should create the action', () => {
      const action = new CheckoutActions.ClearCheckoutDeliveryModeSuccess({
        userId,
        cartId,
      });
      expect({ ...action }).toEqual({
        type: CheckoutActions.CLEAR_CHECKOUT_DELIVERY_MODE_SUCCESS,
        payload: { userId, cartId },
        meta: StateUtils.entityProcessesDecrementMeta(MULTI_CART_DATA, cartId),
      });
    });
  });

  describe('Clear Supported Delivery Modes Data', () => {
    it('should create the action', () => {
      const action = new CheckoutActions.ClearSupportedDeliveryModes();
      expect({ ...action }).toEqual({
        type: CheckoutActions.CLEAR_SUPPORTED_DELIVERY_MODES,
      });
    });
  });
});