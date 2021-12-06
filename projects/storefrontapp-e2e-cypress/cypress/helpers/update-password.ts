
import { login } from './auth-forms';
import * as alerts from './global-message';
import * as helper from './login';

import { standardUser } from '../sample-data/shared-users';

export const PAGE_TITLE_HOME = 'Homepage';
export const PAGE_URL_UPDATE_PASSWORD = '/my-account/update-password';
export const newPassword = 'newPassword123!';

export function testUpdatePassword(){
it('should update the password with success', () => {
    alerts.getSuccessAlert().should('not.exist');
    cy.get('[formcontrolname="oldPassword"]').type(
      standardUser.registrationData.password
    );
    cy.get('[formcontrolname="newPassword"]').type(newPassword);
    cy.get('[formcontrolname="newPasswordConfirm"]').type(newPassword);
    cy.get('cx-update-password button').click();
    cy.title().should('eq', PAGE_TITLE_HOME);
    alerts.getSuccessAlert().should('exist');

    helper.signOutUser();
    cy.visit('/login');
    login(standardUser.registrationData.email, newPassword);
    cy.get(helper.userGreetSelector).should('exist');
  });
}