import { ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';
import { TranslatePipe } from './translate.pipe';
import { TranslationService } from './translation.service';

describe('TranslatePipe', () => {
  let pipe: TranslatePipe;
  let service: TranslationService;
  let cd: ChangeDetectorRef;

  beforeEach(() => {
    service = {
      translate: () => {},
    } as any;
    cd = { markForCheck: jest.fn() } as any;
    pipe = new TranslatePipe(service, cd);
  });

  describe('transform', () => {
    it('should return falsy when input is undefined', () => {
      const result = pipe.transform(undefined);
      expect(result).toBeFalsy();
    });

    it('should return raw string when input is object with "raw" property ', () => {
      const result = pipe.transform({ raw: 'test' });
      expect(result).toBe('test');
    });

    it('should return result of service.translate', () => {
      jest.spyOn(service, 'translate').mockReturnValue(of('expectedValue'));
      const result = pipe.transform('testKey', { param: 'param1' });
      expect(service.translate).toHaveBeenCalledWith(
        'testKey',
        { param: 'param1' },
        true
      );
      expect(result).toBe('expectedValue');
    });

    it('should translate with merged params from the first and the second argument', () => {
      jest.spyOn(service, 'translate').mockReturnValue(of());
      pipe.transform(
        { key: 'testKey', params: { param1: 'value1' } },
        { param2: 'value2' }
      );
      expect(service.translate).toHaveBeenCalledWith(
        'testKey',
        { param1: 'value1', param2: 'value2' },
        true
      );
    });

    it('should NOT call service.translate twice if pipe.transform was called twice with the same arguments', () => {
      jest.spyOn(service, 'translate').mockReturnValue(of());
      pipe.transform('testKey', { param: 'param1' });
      pipe.transform('testKey', { param: 'param1' });
      expect(service.translate).toHaveBeenCalledTimes(1);
    });

    it('should call service.translate every time pipe.transform was called with different keys', () => {
      jest.spyOn(service, 'translate').mockReturnValue(of());
      pipe.transform('testKey', { param: 'param1' });
      pipe.transform('testKeyOther', { param: 'param1' });
      expect(service.translate).toHaveBeenCalledTimes(2);
    });

    it('should call service.translate every time pipe.transform was called with different options', () => {
      jest.spyOn(service, 'translate').mockReturnValue(of());
      pipe.transform('testKey', { param: 'param1' });
      pipe.transform('testKey', { param: 'param2' });
      pipe.transform('testKey', { param: 'param2', otherParam: 'otherParam1' });
      expect(service.translate).toHaveBeenCalledTimes(3);
    });

    it('should call cd.markForCheck every time when service.translate emits value', () => {
      jest.spyOn(service, 'translate').and.returnValues(
        of('value1', 'value2'),
        of('value3')
      );
      pipe.transform('testKey', { param: 'param1' });
      pipe.transform('testKey', { param: 'param2' });
      expect(cd.markForCheck).toHaveBeenCalledTimes(3);
    });
  });
});
