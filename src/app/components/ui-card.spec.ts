import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiCard } from './ui-card';

@Component({
  imports: [UiCard],
  template: '<app-ui-card title="Card title"></app-ui-card>',
})
class TestHost {}

describe('UiCard', () => {
  let fixture: ComponentFixture<TestHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
  });

  it('removes the host title attribute so the card does not show a native tooltip', () => {
    expect(fixture.nativeElement.querySelector('app-ui-card').getAttribute('title')).toBeNull();
  });
});
