import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UserOrderAdapter } from './user-order.adapter';
import { UserOrderConnector } from './user-order.connector';

class MockOrderAdapter implements UserOrderAdapter {
  load = jest.fn().mockImplementation((userId, orderCode) =>
    of(`order-${userId}-${orderCode}`)
  );

  loadHistory = jest.fn().mockImplementation(
    (userId) => of(`orderHistory-${userId}`)
  );

  getConsignmentTracking = jest.fn(
  ).mockImplementation((orderCode, consignmentCode, userId) =>
    of(`consignmentTracking-${userId}-${orderCode}-${consignmentCode}`)
  );

  createReturnRequest = jest.fn(
  ).mockImplementation((userId, {}) => of(`orderReturnRequest-${userId}`));

  loadReturnRequestList = jest.fn(
  ).mockImplementation((userId) => of(`loadReturnRequestList-${userId}`));

  loadReturnRequestDetail = jest.fn(
  ).mockImplementation((userId, returnRequestCode) =>
    of(`loadReturnRequestDetail-${userId}-${returnRequestCode}`)
  );

  cancel = jest.fn().mockImplementation(
    (userId, orderCode, {}) => of(`cancel-${userId}-${orderCode}`)
  );

  cancelReturnRequest = jest.fn(
  ).mockImplementation((userId, returnRequestCode, {}) =>
    of(`cancelReturnRequest-${userId}-${returnRequestCode}`)
  );
}

describe('UserOrderConnector', () => {
  let service: UserOrderConnector;
  let adapter: UserOrderAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: UserOrderAdapter, useClass: MockOrderAdapter }],
    });

    service = TestBed.inject(UserOrderConnector);
    adapter = TestBed.inject(UserOrderAdapter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('get should call adapter', () => {
    let result;
    service.get('user2', 'order2').subscribe((res) => (result = res));
    expect(result).toBe('order-user2-order2');
    expect(adapter.load).toHaveBeenCalledWith('user2', 'order2');
  });

  it('getHistory should call adapter', () => {
    let result;
    service.getHistory('user3').subscribe((res) => (result = res));
    expect(result).toBe('orderHistory-user3');
    expect(adapter.loadHistory).toHaveBeenCalledWith(
      'user3',
      undefined,
      undefined,
      undefined
    );
  });

  it('getConsignmentTracking should call adapter', () => {
    let result;
    service
      .getConsignmentTracking('orderCode', 'consignmentCode', 'userId')
      .subscribe((res) => (result = res));
    expect(result).toBe('consignmentTracking-userId-orderCode-consignmentCode');
    expect(adapter.getConsignmentTracking).toHaveBeenCalledWith(
      'orderCode',
      'consignmentCode',
      'userId'
    );
  });

  it('cancel should call adapter', () => {
    let result;
    service
      .cancel('userId', 'orderCode', {})
      .subscribe((res) => (result = res));
    expect(result).toBe('cancel-userId-orderCode');
    expect(adapter.cancel).toHaveBeenCalledWith('userId', 'orderCode', {});
  });

  it('return should call adapter', () => {
    let result;
    service.return('userId', {}).subscribe((res) => (result = res));
    expect(result).toBe('orderReturnRequest-userId');
    expect(adapter.createReturnRequest).toHaveBeenCalledWith('userId', {});
  });

  it('getReturnRequestList should call adapter', () => {
    let result;
    service.getReturnRequestList('userId').subscribe((res) => (result = res));
    expect(result).toBe('loadReturnRequestList-userId');
    expect(adapter.loadReturnRequestList).toHaveBeenCalledWith(
      'userId',
      undefined,
      undefined,
      undefined
    );
  });

  it('getReturnRequestDetail should call adapter', () => {
    let result;
    service
      .getReturnRequestDetail('userId', 'returnRequestCode')
      .subscribe((res) => (result = res));
    expect(result).toBe('loadReturnRequestDetail-userId-returnRequestCode');
    expect(adapter.loadReturnRequestDetail).toHaveBeenCalledWith(
      'userId',
      'returnRequestCode'
    );
  });

  it('cancelReturnRequest should call adapter', () => {
    let result;
    service
      .cancelReturnRequest('userId', 'returnRequestCode', {
        status: 'CANCELLING',
      })
      .subscribe((res) => (result = res));
    expect(result).toBe('cancelReturnRequest-userId-returnRequestCode');
    expect(adapter.cancelReturnRequest).toHaveBeenCalledWith(
      'userId',
      'returnRequestCode',
      { status: 'CANCELLING' }
    );
  });
});
