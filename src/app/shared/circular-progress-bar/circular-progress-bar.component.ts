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
  
    handleClick() {  
      if (this.progressValue === 0 || this.progressValue === 100) {
        this.startTest.emit();
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
  