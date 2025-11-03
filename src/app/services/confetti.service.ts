import { Injectable } from '@angular/core';
import confetti from 'canvas-confetti';

@Injectable({
  providedIn: 'root',
})
export class ConfettiService {
  constructor() {}

  /**
   * Start confetti celebration with multiple bursts
   */
  startConfetti(duration: number = 4000): void {
    const end = Date.now() + duration;

    // Colors for the celebration
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#FFA726',
      '#66BB6A',
      '#AB47BC',
    ];

    // Initial big burst
    this.fireConfetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors,
    });

    // Continuous smaller bursts
    // const interval = setInterval(() => {
    //   if (Date.now() > end) {
    //     clearInterval(interval);
    //     return;
    //   }

    //   // Random side bursts
    //   confetti({
    //     particleCount: 30,
    //     angle: 60,
    //     spread: 55,
    //     origin: { x: 0, y: 0.8 },
    //     colors: colors,
    //   });

    //   confetti({
    //     particleCount: 30,
    //     angle: 60,
    //     spread: 55,
    //     origin: { x: 1, y: 0.8 },
    //     colors: colors,
    //   });
    // }, 400);
  }

  /**
   * Stop confetti animation (canvas-confetti handles cleanup automatically)
   */
  stopConfetti(): void {
    // canvas-confetti doesn't need manual cleanup, but we can reset if needed
    // The animations will naturally complete and clean themselves up
  }

  /**
   * Fire a single confetti burst with custom options
   */
  fireConfetti(options?: confetti.Options): void {
    confetti(options);
  }

  /**
   * Create a celebration with fireworks effect
   */
  celebrateWithFireworks(): void {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Create firework bursts from random positions
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        })
      );

      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        })
      );
    }, 250);
  }

  /**
   * School colors celebration (customize for your app)
   */
  schoolColorsConfetti(): void {
    const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545']; // Blue, Green, Yellow, Red

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors,
      shapes: ['circle', 'square'],
      gravity: 1.2,
      drift: 0.1,
      ticks: 200,
    });
  }
}
