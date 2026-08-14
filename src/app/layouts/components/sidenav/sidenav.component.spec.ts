import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { provideIcons } from '@ng-icons/core'
import { lucideCircleGauge, lucideSquareChevronLeft } from '@ng-icons/lucide'

import { SidenavComponent } from './sidenav.component'

describe('SidenavComponent', () => {
  let component: SidenavComponent
  let fixture: ComponentFixture<SidenavComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidenavComponent],
      providers: [
        provideRouter([]),
        provideIcons({ lucideCircleGauge, lucideSquareChevronLeft }),
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(SidenavComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
