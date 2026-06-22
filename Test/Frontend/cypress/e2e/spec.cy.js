describe('template spec', () => {
  it('Megnyitjuk a localhost:5173 oldalt', () => {
    cy.visit('http://localhost:5173/');
  })

  it('Ellenőrizzük a logót', () => {
    cy.visit('http://localhost:5173/');
    cy.get('[data-testid="login-logo"]').should('be.visible');
  })

  it('Ellenőrizzük a login panel elemeket', () => {
    cy.visit('http://localhost:5173/');
    cy.get('[data-testid="login-header-text"]').should('exist');
    cy.get('[data-testid="login-username-label"]').should('exist');
    cy.get('[data-testid="login-username-input"]').should('be.visible');
    cy.get('[data-testid="login-password-label"]').should('exist');
    cy.get('[data-testid="login-password-input"]').should('be.visible');
    cy.get('[data-testid="login-login-button"]').should('be.visible');
  })

  it('Admin belépés hibás adatokkal', () => {
    cy.visit('http://localhost:5173/');
    cy.get('[data-testid="login-username-input"]').type('admin.geza');
    cy.get('[data-testid="login-password-input"]').type('geza');
    cy.get('[data-testid="login-login-button"]').click();
    cy.get('[data-testid="login-alert-text"]').should('be.visible').and('contain', 'Helytelen felhasználónév');
  })

  it('Admin belépés helyes adatokkal és admin dashboard gombok ellenőrzése', () => {
    cy.visit('http://localhost:5173/');
    cy.get('[data-testid="login-username-input"]').type('admin.istvan');
    cy.get('[data-testid="login-password-input"]').type('istvan');
    cy.get('[data-testid="login-login-button"]').click();
    cy.get('[data-testid="sidebar-menu"]').should('be.visible');
    cy.get('[data-testid="topbar-menu"]').should('be.visible');
    cy.get('[data-testid="dashboard-title"]').should('be.visible').and('contain', 'Dashboard');
    cy.get('[data-testid="new-device-btn"]').should('be.visible');
    cy.get('[data-testid="new-assignment-btn"]').should('be.visible');
    cy.get('[data-testid="new-user-btn"]').should('be.visible');
  })

  it('Admin belépés, Eszközök megjelenitése és admin gombok ellenőrzése', () => {
    cy.visit('http://localhost:5173/');
    cy.get('[data-testid="login-username-input"]').type('admin.istvan');
    cy.get('[data-testid="login-password-input"]').type('istvan');
    cy.get('[data-testid="login-login-button"]').click();
    cy.get('[data-testid="sidebar-menu-devices"]').click();
    cy.get('[data-testid="device-page-title"]').should('be.visible').and('contain','Eszközök');
    cy.get('[data-testid="device-new-device-btn"]').should('be.visible');
    cy.get('[data-testid="device-new-devicetype-btn"]').should('be.visible');
    cy.get('[data-testid="device-edit-devicetype-btn"]').should('be.visible');
    cy.get('[data-testid="device-delete-devicetype-btn"]').should('be.visible');
  })

  it('Admin belépés, Felhasználók megjelenitése és admin gombok ellenőrzése', () => {
    cy.visit('http://localhost:5173/');
    cy.get('[data-testid="login-username-input"]').type('admin.istvan');
    cy.get('[data-testid="login-password-input"]').type('istvan');
    cy.get('[data-testid="login-login-button"]').click();
    cy.get('[data-testid="sidebar-menu-users"]').click();
    cy.get('[data-testid="user-page-title"]').should('be.visible').and('contain','Felhasználók');
    cy.get('[data-testid="new-user-btn"]').should('be.visible');
  })

  it('Admin belépés, Mogzások megjelenitése és admin gombok ellenőrzése', () => {
    cy.visit('http://localhost:5173/');
    cy.get('[data-testid="login-username-input"]').type('admin.istvan');
    cy.get('[data-testid="login-password-input"]').type('istvan');
    cy.get('[data-testid="login-login-button"]').click();
    cy.get('[data-testid="sidebar-menu-assignments"]').click();
    cy.get('[data-testid="assignment-title"]').should('be.visible').and('contain','Mozgások');
    cy.get('[data-testid="new-assignment-btn"]').should('be.visible');
  })

  it('Admin belépés, Riportok megjelenítése', () => {
    cy.visit('http://localhost:5173/');
    cy.get('[data-testid="login-username-input"]').type('admin.istvan');
    cy.get('[data-testid="login-password-input"]').type('istvan');
    cy.get('[data-testid="login-login-button"]').click();
    cy.get('[data-testid="sidebar-menu-reports"]').click();
    cy.get('[data-testid="riport-page-title"]').should('be.visible').and('contain','Riportok');
    cy.get('[data-testid="report-status-title"]').should('be.visible').and('contain','Admin riportok');
    cy.get('[data-testid="report-card"]').should('have.length', 4);
  })

  it('Kijelentkezés', () => {
    cy.visit('http://localhost:5173/');
    cy.get('[data-testid="login-username-input"]').type('admin.istvan');
    cy.get('[data-testid="login-password-input"]').type('istvan');
    cy.get('[data-testid="login-login-button"]').click();
    cy.get('[data-testid="topbar-menu-profile"]').click();
    cy.get('[data-testid="topbar-profile-menu-logout"]').click();
    cy.get('[data-testid="login-header-text"]').should('be.visible').and('contain','Bejelentkezés');
  })

})