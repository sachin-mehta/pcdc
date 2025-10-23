import { Component, Input, Output, EventEmitter } from '@angular/core';

  @Component({
    selector: 'app-circular-progress-bar',
    templateUrl: './circular-progress-bar.component.html',
    styleUrls: ['./circular-progress-bar.component.scss'],
  })
  export class CircularProgressBarComponent {
    @Input() firstLabel!: string;
    @Input() secondLabel: string | null = null;
    @Input() icon: string | null = null;
    @Input() progressValue!: number;
    @Input() currentRateUpload!: number;
    @Input() currentRateDownload!: number;
    @Input() error: boolean = false;
    @Input() completed: boolean = false;
    
    @Output() startTest = new EventEmitter<void>();
    @Output() showError = new EventEmitter<boolean>();
    
    private lastClickTime = 0;
    private clickThrottleMs = 1000; // Prevent clicks within 1 second
  
    handleClick() {  
      const now = Date.now();
      console.log('CircularProgressBar handleClick() called at:', new Date().toISOString());
      console.log('Progress value:', this.progressValue);
      console.log('Second label:', this.secondLabel);
      console.log('Time since last click:', now - this.lastClickTime);
      
      // Throttle rapid clicks
      if (now - this.lastClickTime < this.clickThrottleMs) {
        console.log('Click throttled - too soon after last click');
        return;
      }
      
      this.lastClickTime = now;
      
      if (this.progressValue === 0 || this.progressValue === 100) {
        console.log('Emitting startTest event');
        this.startTest.emit();
      } else {
        console.log('Not emitting startTest - progress value not 0 or 100');
      }
    }
  
    getStrokeDashOffset(): string {
      if(!this.error) {
        return `calc(263.9px - (263.9px * ${this.progressValue}) / 100)`;
      } else {
        return `calc(263.9px - (263.9px * 100}) / 100)`;
      }
    }
  
    getFillColor(): string {
      if (
        this.progressValue === 0 
      ) {
        return 'rgba(70, 198, 109, 0.1)';
      }
      return 'transparent';
    }
  
    getTextClass(): string {
      if (this.secondLabel) return 'fill-color-tertiary';
      if (this.error) return 'fill-color-text-error';
      return 'fill-white';
    }

    getGreenColorClass(): string {
      return 'fill-green';
    }
  }
  