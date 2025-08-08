import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appEnterKeyClick]',
  standalone: false 
})
export class EnterKeyClickDirective {
  constructor(private el: ElementRef<HTMLElement>) {}

  @HostListener('document:keydown.enter', ['$event'])
  onEnterPress(event: KeyboardEvent) {
    const button = this.el.nativeElement;

    // Check if element is visible in DOM
    const isVisible = this.isElementVisible(button);

    // Only trigger if visible and enabled
    if (isVisible && !button.hasAttribute('disabled')) {
      event.preventDefault();
      button.click();
    }
  }

  private isElementVisible(elem: HTMLElement): boolean {
    return !!(
      elem.offsetParent !== null &&
      window.getComputedStyle(elem).visibility !== 'hidden' &&
      elem.offsetWidth > 0 &&
      elem.offsetHeight > 0
    );
  }
}
