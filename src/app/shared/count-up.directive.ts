import { Directive, ElementRef, Input, OnChanges, SimpleChanges, NgZone, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appCountUp]',
  standalone: true
})
export class CountUpDirective implements OnChanges, OnDestroy {
  @Input() target: number | string = 0;
  @Input() duration = 800; // milliseconds
  @Input() currency?: string;
  @Input() decimals = 0;

  private rafId: number | null = null;

  constructor(private el: ElementRef, private ngZone: NgZone) {}

  ngOnChanges(changes: SimpleChanges) {
    if ('target' in changes) {
      this.animate();
    }
  }

  ngOnDestroy(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  private animate() {
    if (this.rafId) cancelAnimationFrame(this.rafId);

    const rawStart = (this.el.nativeElement?.innerText || '').toString().replace(/[^0-9.-]+/g, '');
    let startValue = parseFloat(rawStart) || 0;
    const endValue = Number(this.target) || 0;
    const duration = Math.max(150, Math.min(3000, this.duration || 800));
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // easeOutQuad
      const eased = t * (2 - t);
      const current = startValue + (endValue - startValue) * eased;
      this.render(current);
      if (t < 1) {
        this.rafId = requestAnimationFrame(step);
      } else {
        this.render(endValue);
        this.rafId = null;
      }
    };

    this.ngZone.runOutsideAngular(() => {
      this.rafId = requestAnimationFrame(step);
    });
  }

  private render(value: number) {
    if (this.currency) {
      try {
        const formatter = new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: this.currency,
          minimumFractionDigits: this.decimals,
          maximumFractionDigits: this.decimals
        });
        this.el.nativeElement.innerText = formatter.format(value);
      } catch (e) {
        // fallback
        this.el.nativeElement.innerText = value.toFixed(this.decimals);
      }
    } else {
      const formatter = new Intl.NumberFormat(undefined, {
        minimumFractionDigits: this.decimals,
        maximumFractionDigits: this.decimals
      });
      this.el.nativeElement.innerText = formatter.format(Number(value.toFixed(this.decimals)));
    }
  }
}
