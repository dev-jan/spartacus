import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  CheckoutCostCenterFacade,
  CheckoutPaymentTypeFacade,
} from '@spartacus/checkout/b2b/root';
import {
  Cart,
  CostCenter,
  I18nTestingModule,
  QueryState,
  UserCostCenterService,
} from '@spartacus/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { CostCenterComponent } from './cost-center.component';

const mockCostCenters: CostCenter[] = [
  {
    code: 'test-cost-center1',
    name: 'test-cost-center1',
  },
  {
    code: 'test-cost-center2',
    name: 'test-cost-center-name2',
  },
];

class MockCheckoutCostCenterService
  implements Partial<CheckoutCostCenterFacade>
{
  getCostCenterState(): Observable<QueryState<CostCenter | undefined>> {
    return of({ loading: false, error: false, data: mockCostCenters[0] });
  }
  setCostCenter(_costCenterId: string): Observable<Cart> {
    return of();
  }
}

const accountPayment$ = new BehaviorSubject<boolean>(false);
class MockCheckoutPaymentTypeFacade
  implements Partial<CheckoutPaymentTypeFacade>
{
  isAccountPayment(): Observable<boolean> {
    return accountPayment$.asObservable();
  }
}

class MockUserCostCenterService implements Partial<UserCostCenterService> {
  getActiveCostCenters(): Observable<CostCenter[]> {
    return of(mockCostCenters);
  }
}

describe('CostCenterComponent', () => {
  let component: CostCenterComponent;
  let fixture: ComponentFixture<CostCenterComponent>;
  let checkoutCostCenterService: CheckoutCostCenterFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [I18nTestingModule],
      declarations: [CostCenterComponent],
      providers: [
        {
          provide: UserCostCenterService,
          useClass: MockUserCostCenterService,
        },
        {
          provide: CheckoutCostCenterFacade,
          useClass: MockCheckoutCostCenterService,
        },
        {
          provide: CheckoutPaymentTypeFacade,
          useClass: MockCheckoutPaymentTypeFacade,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CostCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    checkoutCostCenterService = TestBed.inject(CheckoutCostCenterFacade);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return false for payment type when it is NOT ACCOUNT type', () => {
    accountPayment$.next(false);
    fixture.detectChanges();

    let result: boolean | undefined;
    component.isAccountPayment$
      .subscribe((data) => (result = data))
      .unsubscribe();

    expect(result).toBe(false);
  });

  it('should return true for payment type when it is ACCOUNT type', () => {
    accountPayment$.next(true);
    fixture.detectChanges();

    let result: boolean | undefined;
    component.isAccountPayment$
      .subscribe((data) => (result = data))
      .unsubscribe();

    expect(result).toBe(true);
  });

  it('should get cost centers', () => {
    let costCenter: CostCenter[] | undefined;

    component.costCenters$
      .subscribe((data) => (costCenter = data))
      .unsubscribe();

    expect(costCenter).toBeTruthy();
    expect(costCenter).toEqual(mockCostCenters);
  });

  it('should NOT set default if the cart already CONTAINS a cost center', () => {
    spyOn(checkoutCostCenterService, 'setCostCenter').and.stub();
    let costCenter: CostCenter[] | undefined;

    component.costCenters$
      .subscribe((data) => (costCenter = data))
      .unsubscribe();

    expect(costCenter).toBeTruthy();
    expect(costCenter).toEqual(mockCostCenters);
    expect(component['costCenterId']).toEqual(mockCostCenters[0].code);
    expect(checkoutCostCenterService.setCostCenter).not.toHaveBeenCalled();
  });

  it('should set default if the cart does NOT contain a cost center', () => {
    spyOn(checkoutCostCenterService, 'setCostCenter').and.stub();
    spyOn(checkoutCostCenterService, 'getCostCenterState').and.returnValue(
      of(null)
    );

    let costCenter: CostCenter[] | undefined;

    component.costCenters$
      .subscribe((data) => (costCenter = data))
      .unsubscribe();

    expect(costCenter).toBeTruthy();
    expect(costCenter).toEqual(mockCostCenters);
    expect(component['costCenterId']).toEqual(mockCostCenters[0].code);
    expect(checkoutCostCenterService.setCostCenter).toHaveBeenCalledWith(
      mockCostCenters[0].code
    );
  });

  it('should set cost center', () => {
    spyOn(checkoutCostCenterService, 'setCostCenter').and.stub();

    component.setCostCenter(mockCostCenters[1].code ?? '');

    expect(component['costCenterId']).toEqual(mockCostCenters[1].code);
    expect(checkoutCostCenterService.setCostCenter).toHaveBeenCalledWith(
      mockCostCenters[1].code
    );
  });
});