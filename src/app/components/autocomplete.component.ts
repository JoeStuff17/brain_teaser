import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-autocomplete',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="autocomplete-container" [class.is-open]="isOpen">
      <div class="input-wrapper">
        <input
          #inputElement
          type="text"
          class="autocomplete-input"
          [placeholder]="placeholder"
          [(ngModel)]="inputValue"
          (input)="onInputChange($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
          [disabled]="disabled"
          autocomplete="off"
          [attr.aria-label]="ariaLabel || placeholder"
          aria-autocomplete="list"
          [attr.aria-expanded]="isOpen"
          [attr.aria-activedescendant]="activeIndex >= 0 ? 'option-' + activeIndex : null"
          role="combobox"
        />
        
        @if(inputValue && inputValue.length > 0) {
        <button
          type="button" 
          class="clear-button" 
          (mousedown)="clearInput($event)"
          aria-label="Clear input">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        }
        
        <div class="input-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      </div>
      
      @if (isOpen && filteredOptions.length > 0) {
        <ul 
          class="options-list" 
          role="listbox" 
          [attr.aria-label]="placeholder">
          @for (option of filteredOptions; track $index) {
            <li 
              [id]="'option-' + $index"
              class="option-item" 
              [class.active]="$index === activeIndex"
              (mousedown)="selectOption(option)"
              (mouseover)="activeIndex = $index"
              role="option"
              [attr.aria-selected]="$index === activeIndex">
              <span class="option-text">{{ isStringArray ? option : option[displayProperty] }}</span>
              @if (!isStringArray && option.description) {
                <span class="option-description">{{ option.description }}</span>
              }
            </li>
          }
        </ul>
      } @else if (isOpen && inputValue && inputValue.length > 0) {
        <div class="no-results">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>No results found</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .autocomplete-container {
      position: relative;
      width: 100%;
    }
    
    .input-wrapper {
      position: relative;
    }
    
    .autocomplete-input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.5rem;
      border: 1px solid #e2e8f0;
      background-color: white;
      border-radius: 0.5rem;
      font-size: 0.95rem;
      color: #1e293b;
      transition: all 0.2s ease;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }
    
    .autocomplete-input:focus {
      outline: none;
      border-color: #818cf8;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }
    
    .input-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
      pointer-events: none;
    }
    
    .clear-button {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
      background: none;
      border: none;
      padding: 0.25rem;
      cursor: pointer;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    
    .clear-button:hover {
      color: #64748b;
      background-color: #f1f5f9;
    }
    
    .options-list {
      position: absolute;
      top: calc(100% + 0.5rem);
      left: 0;
      width: 100%;
      max-height: 250px;
      overflow-y: auto;
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      z-index: 50;
      padding: 0.5rem 0;
      border: 1px solid #e2e8f0;
      list-style: none;
      margin: 0;
      animation: slideDown 0.2s ease-out forwards;
    }
    
    .option-item {
      padding: 0.75rem 1rem;
      cursor: pointer;
      transition: background-color 0.15s ease;
      display: flex;
      flex-direction: column;
    }
    
    .option-item:hover, .option-item.active {
      background-color: #f8fafc;
    }
    
    .option-item.active {
      background-color: #eff6ff;
    }
    
    .option-text {
      font-size: 0.95rem;
      color: #1e293b;
    }
    
    .option-description {
      font-size: 0.8rem;
      color: #64748b;
      margin-top: 0.25rem;
    }
    
    .no-results {
      position: absolute;
      top: calc(100% + 0.5rem);
      left: 0;
      width: 100%;
      padding: 1rem;
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      gap: 0.5rem;
      animation: slideDown 0.2s ease-out forwards;
      border: 1px solid #e2e8f0;
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
      .options-list, .no-results {
        animation: none;
      }
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteComponent),
      multi: true
    }
  ]
})
export class AutocompleteComponent implements OnInit, ControlValueAccessor {
  @Input() options: any[] = [];
  @Input() displayProperty: string = 'name';
  @Input() valueProperty: string = 'id';
  @Input() placeholder: string = 'Search...';
  @Input() ariaLabel: string = '';
  @Input() minChars: number = 1;
  @Input() disabled: boolean = false;
  
  @Output() optionSelected = new EventEmitter<any>();
  @Output() inputChanged = new EventEmitter<string>();
  
  @ViewChild('inputElement') inputElement!: ElementRef<HTMLInputElement>;
  
  inputValue: string = '';
  isOpen: boolean = false;
  activeIndex: number = -1;
  filteredOptions: any[] = [];
  selectedOption: any = null;
  isStringArray: boolean = false;
  
  private onChange: any = () => {};
  private onTouched: any = () => {};
  
  ngOnInit(): void {
    // Determine if we're dealing with a string array
    this.isStringArray = this.options.length > 0 && typeof this.options[0] === 'string';
    this.filterOptions();
  }
  
  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.isOpen) return;
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex = Math.min(this.activeIndex + 1, this.filteredOptions.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex = Math.max(this.activeIndex - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.activeIndex >= 0) {
          this.selectOption(this.filteredOptions[this.activeIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
    }
  }
  
  onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.inputValue = value;
    this.inputChanged.emit(value);
    this.filterOptions();
    
    if (value.length >= this.minChars) {
      this.open();
    } else {
      this.close();
    }
    
    this.onChange(null);
    this.selectedOption = null;
  }
  
  onFocus(): void {
    if (this.inputValue.length >= this.minChars) {
      this.open();
    }
  }
  
  onBlur(): void {
    setTimeout(() => {
      this.close();
      this.onTouched();
    }, 150);
  }
  
  selectOption(option: any): void {
    this.selectedOption = option;
    
    if (this.isStringArray) {
      this.inputValue = option;
      this.onChange(option); // For string arrays, the value is the string itself
    } else {
      this.inputValue = option[this.displayProperty];
      this.onChange(option[this.valueProperty]);
    }
    
    this.optionSelected.emit(option);
    this.close();
    this.inputElement.nativeElement.focus();
  }
  
  clearInput(event: MouseEvent): void {
    event.preventDefault();
    this.inputValue = '';
    this.selectedOption = null;
    this.onChange(null);
    this.inputChanged.emit('');
    this.filterOptions();
    this.inputElement.nativeElement.focus();
  }
  
  open(): void {
    this.isOpen = true;
    this.activeIndex = -1;
  }
  
  close(): void {
    this.isOpen = false;
  }
  
  filterOptions(): void {
    if (!this.inputValue || this.inputValue.length < this.minChars) {
      this.filteredOptions = [...this.options];
      return;
    }
    
    const searchTerm = this.inputValue.toLowerCase();
    
    if (this.isStringArray) {
      this.filteredOptions = this.options.filter(option =>
        (option as string).toLowerCase().includes(searchTerm)
      );
    } else {
      this.filteredOptions = this.options.filter(option =>
        option[this.displayProperty].toLowerCase().includes(searchTerm)
      );
    }
  }
  
  // ControlValueAccessor methods
  writeValue(value: any): void {
    if (value === null || value === undefined) {
      this.inputValue = '';
      this.selectedOption = null;
      return;
    }
    
    if (this.isStringArray) {
      const selectedOption = this.options.find(option => option === value);
      if (selectedOption) {
        this.selectedOption = selectedOption;
        this.inputValue = selectedOption;
      }
    } else {
      const selectedOption = this.options.find(option => option[this.valueProperty] === value);
      if (selectedOption) {
        this.selectedOption = selectedOption;
        this.inputValue = selectedOption[this.displayProperty];
      }
    }
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
}