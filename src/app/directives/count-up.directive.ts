import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[countUp]'
})
export class CountUpDirective implements OnInit {
  @Input('countUp') set targetValue(value: string | number) {
    this.targetNumber = typeof value === 'string' ? parseInt(value, 10) : value;
  }
  @Input() duration: number = 2000; // durée en millisecondes
  @Input() suffix: string = '';

  private targetNumber: number = 0;
  private startNumber: number = 0;
  private increment: number = 1;
  private currentNumber: number = 0;
  private fps: number = 60;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    // Créer un observateur d'intersection pour démarrer l'animation quand l'élément est visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animate();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(this.el.nativeElement);
  }

  private animate() {
    const totalFrames = (this.duration / 1000) * this.fps;
    this.increment = (this.targetNumber - this.startNumber) / totalFrames;
    
    const updateCount = () => {
      this.currentNumber += this.increment;
      
      if (this.increment > 0 && this.currentNumber >= this.targetNumber) {
        this.currentNumber = this.targetNumber;
        this.updateText();
        return;
      } else if (this.increment < 0 && this.currentNumber <= this.targetNumber) {
        this.currentNumber = this.targetNumber;
        this.updateText();
        return;
      }
      
      this.updateText();
      requestAnimationFrame(updateCount);
    };

    requestAnimationFrame(updateCount);
  }

  private updateText() {
    // Arrondir au nombre entier le plus proche
    const displayNumber = Math.round(this.currentNumber);
    this.el.nativeElement.textContent = displayNumber + this.suffix;
  }
} 