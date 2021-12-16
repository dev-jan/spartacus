import { TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { TokenResponse } from 'angular-oauth2-oidc';
import { OCC_USER_ID_CURRENT } from 'projects/core/src/occ';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { RoutingService } from '../../../routing/facade/routing.service';
import { AuthToken } from '../models/auth-token.model';
import { AuthRedirectService } from '../services/auth-redirect.service';
import { AuthStorageService } from '../services/auth-storage.service';
import { OAuthLibWrapperService } from '../services/oauth-lib-wrapper.service';
import { AuthActions } from '../store/actions';
import { AuthService } from './auth.service';
import { UserIdService } from './user-id.service';

class MockUserIdService implements Partial<UserIdService> {
  getUserId(): Observable<string> {
    return of('');
  }
  clearUserId() {}
  setUserId() {}
}

class MockOAuthLibWrapperService implements Partial<OAuthLibWrapperService> {
  revokeAndLogout() {
    return Promise.resolve();
  }
  authorizeWithPasswordFlow() {
    return Promise.resolve({} as TokenResponse);
  }
  initLoginFlow() {}
  tryLogin() {
    return Promise.resolve(true);
  }
}

class MockAuthStorageService implements Partial<AuthStorageService> {
  getToken() {
    return of({ access_token: 'token' } as AuthToken);
  }
  getItem() {
    return 'value';
  }
}

class MockAuthRedirectService implements Partial<AuthRedirectService> {
  redirect() {}
}

class MockRoutingService implements Partial<RoutingService> {
  go = () => Promise.resolve(true);
}

describe('AuthService', () => {
  let service: AuthService;
  let routingService: RoutingService;
  let authStorageService: AuthStorageService;
  let userIdService: UserIdService;
  let oAuthLibWrapperService: OAuthLibWrapperService;
  let authRedirectService: AuthRedirectService;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({})],
      providers: [
        AuthService,
        {
          provide: UserIdService,
          useClass: MockUserIdService,
        },
        {
          provide: OAuthLibWrapperService,
          useClass: MockOAuthLibWrapperService,
        },
        { provide: AuthStorageService, useClass: MockAuthStorageService },
        { provide: AuthRedirectService, useClass: MockAuthRedirectService },
        { provide: RoutingService, useClass: MockRoutingService },
      ],
    });

    service = TestBed.inject(AuthService);
    routingService = TestBed.inject(RoutingService);
    authStorageService = TestBed.inject(AuthStorageService);
    userIdService = TestBed.inject(UserIdService);
    oAuthLibWrapperService = TestBed.inject(OAuthLibWrapperService);
    authRedirectService = TestBed.inject(AuthRedirectService);
    store = TestBed.inject(Store);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('checkOAuthParamsInUrl()', () => {
    it('should login user when token is present', async () => {
      jest.spyOn(oAuthLibWrapperService, 'tryLogin');
      jest.spyOn(userIdService, 'setUserId');
      jest.spyOn(authRedirectService, 'redirect');
      jest.spyOn(store, 'dispatch');
      jest.spyOn(authStorageService, 'getItem').mockReturnValue('token');

      await service.checkOAuthParamsInUrl();

      expect(oAuthLibWrapperService.tryLogin).toHaveBeenCalled();
      expect(userIdService.setUserId).toHaveBeenCalledWith(OCC_USER_ID_CURRENT);
      expect(store.dispatch).toHaveBeenCalledWith(new AuthActions.Login());
      expect(authRedirectService.redirect).toHaveBeenCalled();
    });
  });

  describe('loginWithRedirect()', () => {
    it('should initialize login flow', () => {
      jest.spyOn(oAuthLibWrapperService, 'initLoginFlow');

      const result = service.loginWithRedirect();

      expect(result).toBeTruthy();
      expect(oAuthLibWrapperService.initLoginFlow).toHaveBeenCalled();
    });
  });

  describe('loginWithCredentials()', () => {
    it('should login user', async () => {
      jest.spyOn(oAuthLibWrapperService, 'authorizeWithPasswordFlow');
      jest.spyOn(userIdService, 'setUserId');
      jest.spyOn(authRedirectService, 'redirect');
      jest.spyOn(store, 'dispatch');

      await service.loginWithCredentials('username', 'pass');

      expect(
        oAuthLibWrapperService.authorizeWithPasswordFlow
      ).toHaveBeenCalledWith('username', 'pass');
      expect(userIdService.setUserId).toHaveBeenCalledWith(OCC_USER_ID_CURRENT);
      expect(store.dispatch).toHaveBeenCalledWith(new AuthActions.Login());
      expect(authRedirectService.redirect).toHaveBeenCalled();
    });
  });

  describe('coreLogout()', () => {
    it('should revoke tokens and logout', async () => {
      jest.spyOn(userIdService, 'clearUserId');
      jest.spyOn(oAuthLibWrapperService, 'revokeAndLogout');
      jest.spyOn(store, 'dispatch');

      await service.coreLogout();

      expect(
        (service.logoutInProgress$ as BehaviorSubject<boolean>).value
      ).toBeTruthy();
      expect(userIdService.clearUserId).toHaveBeenCalled();
      expect(oAuthLibWrapperService.revokeAndLogout).toHaveBeenCalled();
      expect(store.dispatch).toHaveBeenCalledWith(new AuthActions.Logout());
    });
  });

  describe('isUserLoggedIn()', () => {
    it('should return true when there is access_token', (done) => {
      service
        .isUserLoggedIn()
        .pipe(take(1))
        .subscribe((result) => {
          expect(result).toBeTruthy();
          done();
        });
    });

    it('should return false when there is not access_token', (done) => {
      jest.spyOn(authStorageService, 'getToken').mockReturnValue(of(undefined));

      service
        .isUserLoggedIn()
        .pipe(take(1))
        .subscribe((result) => {
          expect(result).toBeFalsy();
          done();
        });
    });
  });

  describe('initLogout()', () => {
    it('should redirect url to logout page', () => {
      jest.spyOn(routingService, 'go');

      service.logout();

      expect(routingService.go).toHaveBeenCalledWith({ cxRoute: 'logout' });
    });
  });
});
