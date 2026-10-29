import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'

import { UserProfile } from './user-profile'
import { DialogService } from 'primeng/dynamicdialog';
import { AccountComponent } from '../../../../../views/account/account.component';

describe('UserProfile', () => {
  let component: UserProfile
  let fixture: ComponentFixture<UserProfile>
  let dialogService: jasmine.SpyObj<DialogService>

  beforeEach(async () => {
    dialogService = jasmine.createSpyObj('DialogService', ['open']);
    await TestBed.configureTestingModule({
      imports: [UserProfile],
      providers: [provideRouter([]), { provide: DialogService, useValue: dialogService }],
    }).compileComponents()

    fixture = TestBed.createComponent(UserProfile)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('abre el cambio de contraseña en un diálogo modal', () => {
    component.handleEvent('change-password');

    expect(dialogService.open).toHaveBeenCalledWith(AccountComponent, jasmine.objectContaining({
      header: 'Cambiar contraseña',
      modal: true,
      closable: true,
      width: 'min(560px, 95vw)',
      breakpoints: { '640px': '95vw' },
    }));
  });

})
