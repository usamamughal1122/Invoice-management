import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private theme$ = new BehaviorSubject<'light' | 'dark'>('light');
  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);

    // 1️⃣ Load saved theme or detect system theme
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = saved ?? (prefersDark ? 'dark' : 'light');

    this.setTheme(initialTheme, false);

    // 2️⃣ Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!saved) this.setTheme(e.matches ? 'dark' : 'light', false);
    });
  }

  get theme() {
    return this.theme$.asObservable();
  }

  toggle() {
    const newTheme = this.theme$.value === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  private setTheme(theme: 'light' | 'dark', save = true) {
    // Remove previous Bootstrap theme
    this.renderer.setAttribute(document.documentElement, 'data-bs-theme', theme);

    // Optional: Also add a .dark class for custom CSS
    document.body.classList.toggle('dark', theme === 'dark');

    // Save preference
    if (save) localStorage.setItem('theme', theme);

    // Emit new value
    this.theme$.next(theme);
  }
}
