import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app';

describe('AppComponent', () => {
  it('creates the application root', async () => {
    await TestBed.configureTestingModule({ imports: [AppComponent] }).compileComponents();
    expect(TestBed.createComponent(AppComponent).componentInstance).toBeTruthy();
  });
});
