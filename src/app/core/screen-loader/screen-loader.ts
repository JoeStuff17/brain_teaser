import { Component, inject } from '@angular/core';
import { LoaderService } from '../loader.service';

@Component({
  selector: 'app-screen-loader',
  imports: [],
  templateUrl: './screen-loader.html',
  styleUrl: './screen-loader.scss'
})
export class ScreenLoader {
  loaderService = inject(LoaderService);
}
