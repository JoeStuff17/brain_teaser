import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dropdown-container" [class.is-open]="isOpen" [class.disabled]="disabled">
      <!-- Trigger Button -->
      <button
        #trigger
        type="button"
        class="dropdown-trigger"
        (click)="toggle()"
        [attr.aria-expanded]="isOpen"
        [attr.aria-haspopup]="true"
        [attr.aria-label]="ariaLabel || placeholder"
        [disabled]="disabled"
        aria-autocomplete="none"
      >
        <span class="trigger-label">
          {{ selectedLabel || placeholder }}
        </span>
        <svg
          class="chevron-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          [class.rotate-180]="isOpen"
        >
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
      </button>

      <!-- Options List -->
      @if (isOpen) {
        <ul class="dropdown-options" role="listbox">
          @for (option of options; track $index; let i = $index) {
            <li
              [id]="'dropdown-option-' + i"
              class="option-item"
              [class.active]="i === activeIndex"
              (click)="selectOption(option, $event)"
              (mousedown)="onOptionMouseDown($event)"
              (mouseover)="activeIndex = i"
              role="option"
              [attr.aria-selected]="i === selectedOptionIndex"
            >
              <span class="option-text">{{ getLabel(option) }}</span>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: [`
    .dropdown-container {
      position: relative;
      width: 100%;
      font-family: inherit;
    }

    .dropdown-trigger {
      width: 100%;
      padding: 0.75rem 1rem;
      padding-right: 2.5rem;
      border: 1px solid #e2e8f0;
      background-color: white;
      border-radius: 0.5rem;
      font-size: 0.95rem;
      color: #1e293b;
      background-image: none;
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      transition: all 0.2s ease;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      text-align: left;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .dropdown-trigger:hover:not(:disabled) {
      border-color: #818cf8;
    }

    .dropdown-trigger:focus {
      outline: none;
      border-color: #818cf8;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }

    .dropdown-trigger:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background-color: #f8fafc;
    }

    .trigger-label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .chevron-icon {
      transition: transform 0.2s ease;
      color: #94a3b8;
    }

    .chevron-icon.rotate-180 {
      transform: rotate(180deg);
    }

    .dropdown-options {
      position: absolute;
      top: calc(100% + 0.5rem);
      left: 0;
      width: 100%;
      max-height: 250px;
      overflow-y: auto;
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
      list-style: none;
      margin: 0;
      padding: 0;
      z-index: 50;
      animation: slideDown 0.2s ease-out forwards;
    }

    .option-item {
      padding: 0.75rem 1rem;
      cursor: pointer;
      transition: background-color 0.15s ease;
      display: block;
    }

    .option-item:hover, .option-item.active {
      background-color: #f8fafc;
    }

    .option-item.active {
      background-color: #eff6ff;
      font-weight: 500;
      color: #1e40af;
    }

    @keyframes slideDown {
      0% {
        opacity: 0;
        transform: translateY(-10px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .dropdown-options {
        animation: none;
      }
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true,
    },
  ],
})
export class DropdownComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() options: Array<string | { label: string; value: any }> = [];
  @Input() placeholder: string = 'Select...';
  @Input() ariaLabel: string = '';
  @Input() disabled: boolean = false;

  @Output() selectionChange = new EventEmitter<any>();
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  @ViewChild('trigger') trigger!: ElementRef<HTMLButtonElement>;

  isOpen = false;
  activeIndex = -1;
  selectedValue: any = null;
  selectedLabel: string | null = null;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.validateOptions();
  }

  ngOnDestroy(): void {
    this.close();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.isOpen) return;
    const target = event.target as HTMLElement;
    if (!target.closest?.('.dropdown-container')) {
      this.close();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.isOpen) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        this.open();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex = Math.min(this.activeIndex + 1, this.options.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex = Math.max(this.activeIndex - 1, 0);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.activeIndex >= 0) {
          this.selectOption(this.options[this.activeIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'Tab':
        this.close();
        break;
    }
  }

  // Prevent focus loss during mousedown
  onOptionMouseDown(event: MouseEvent): void {
    event.preventDefault(); // Prevent button blur
  }

  toggle(): void {
    if (this.disabled) return;
    this.isOpen ? this.close() : this.open();
  }

  open(): void {
    if (this.disabled || this.isOpen) return;
    this.isOpen = true;
    this.activeIndex = this.getSelectedIndex() ?? -1;
    this.opened.emit();
  }

  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.onTouched();
    this.closed.emit();
  }

  selectOption(option: any, event?: Event): void {
    event?.stopPropagation();

    this.selectedValue = this.isStringOption(option) ? option : option.value;
    this.selectedLabel = this.getLabel(option);

    this.onChange(this.selectedValue);
    this.onTouched();
    this.selectionChange.emit({ value: this.selectedValue, label: this.selectedLabel });

    this.close();
  }

  getLabel(option: any): string {
    return this.isStringOption(option) ? option : option.label;
  }

  private getSelectedIndex(): number {
    return this.options.findIndex(opt =>
      this.isStringOption(opt)
        ? opt === this.selectedValue
        : opt.value === this.selectedValue
    );
  }

  private isStringOption(option: any): option is string {
    return typeof option === 'string';
  }

  private validateOptions(): void {
    if (!Array.isArray(this.options)) {
      console.warn('DropdownComponent: options must be an array');
      this.options = [];
    }
  }

  // ControlValueAccessor
  writeValue(value: any): void {
    this.selectedValue = value;
    const index = this.getSelectedIndex();
    this.selectedLabel = index >= 0 ? this.getLabel(this.options[index]) : null;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  get selectedOptionIndex(): number {
  return this.options.findIndex(opt =>
    this.isStringOption(opt)
      ? opt === this.selectedValue
      : opt.value === this.selectedValue
  );
}
}