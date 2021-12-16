import { TestBed } from '@angular/core/testing';
import { EMPTY, of } from 'rxjs';
import { ConfigInitializerService } from '../../config';
import { SiteContextConfig } from '../config/site-context-config';
import { CurrencyService } from '../facade/currency.service';
import { CurrencyInitializer } from './currency-initializer';
import { CurrencyStatePersistenceService } from './currency-state-persistence.service';

const mockSiteContextConfig: SiteContextConfig = {
  context: {
    currency: ['USD'],
  },
};

class MockCurrencyService implements Partial<CurrencyService> {
  isInitialized() {
    return false;
  }
  setActive = jest.fn().mockImplementation();
}

class MockCurrencyStatePersistenceService
  implements Partial<CurrencyStatePersistenceService>
{
  initSync = jest.fn().mockReturnValue(of(EMPTY));
}

class MockConfigInitializerService
  implements Partial<ConfigInitializerService>
{
  getStable = () => of(mockSiteContextConfig);
}

describe('CurrencyInitializer', () => {
  let initializer: CurrencyInitializer;
  let currencyService: CurrencyService;
  let currencyStatePersistenceService: CurrencyStatePersistenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CurrencyInitializer,
        { provide: CurrencyService, useClass: MockCurrencyService },
        {
          provide: CurrencyStatePersistenceService,
          useClass: MockCurrencyStatePersistenceService,
        },
        {
          provide: ConfigInitializerService,
          useClass: MockConfigInitializerService,
        },
      ],
    });

    currencyStatePersistenceService = TestBed.inject(
      CurrencyStatePersistenceService
    );
    currencyService = TestBed.inject(CurrencyService);
    initializer = TestBed.inject(CurrencyInitializer);
  });

  it('should be created', () => {
    expect(initializer).toBeTruthy();
  });

  describe('initialize', () => {
    it('should call CurrencyStatePersistenceService initSync()', () => {
      jest.spyOn<any>(initializer, 'setFallbackValue').mockReturnValue(of(null));
      initializer.initialize();
      expect(currencyStatePersistenceService.initSync).toHaveBeenCalled();
      expect(initializer['setFallbackValue']).toHaveBeenCalled();
    });

    it('should set default from config is the currency is NOT initialized', () => {
      initializer.initialize();
      expect(currencyService.setActive).toHaveBeenCalledWith('USD');
    });

    it('should NOT set default from config is the currency is initialized', () => {
      jest.spyOn(currencyService, 'isInitialized').mockReturnValue(true);
      initializer.initialize();
      expect(currencyService.setActive).not.toHaveBeenCalled();
    });
  });
});
