import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { MessageService } from 'primeng/api'

import { VerticalLayout } from './vertical-layout'

describe('VerticalLayout', () => {
  let component: VerticalLayout
  let fixture: ComponentFixture<VerticalLayout>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerticalLayout],
       providers: [provideRouter([]), MessageService],
    }).compileComponents()

    fixture = TestBed.createComponent(VerticalLayout)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('mantiene un host persistente para los mensajes Toast', () => {
    expect(fixture.nativeElement.querySelector('p-toast')).not.toBeNull()
  })
})
