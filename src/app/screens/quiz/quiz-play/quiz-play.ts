import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/api.service';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutocompleteComponent } from '../../../components/autocomplete.component';

interface Quiz {
  id: number;
  name: string;
  description: string;
  type: string;
  isSelected?: boolean;
}

@Component({
  selector: 'app-quiz-play',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, AutocompleteComponent],
  templateUrl: './quiz-play.html',
  styleUrl: './quiz-play.scss'
})
export class QuizPlay implements OnInit {
  private apiService = inject(ApiService);
  
  quizzes: Quiz[] = [];
  loading: boolean = true;
  error: string | null = null;
  selectedQuiz: Quiz | null = null;
  isGameStarted = signal(false);
  gameOptionModalOpen = signal(false);
  availableBooks: string[] = [];
  questionCount = signal(0);
  timer = signal(0);
  selectedBook = signal('');
  
  ngOnInit() {
    this.fetchGameList();
  }

  fetchGameList() {
    this.loading = true;
    this.apiService.getQuizList().subscribe({
      next: (res: any) => {
        if (res.success && res.quizzes) {
          this.quizzes = res.quizzes.map((quiz: Quiz) => ({
            ...quiz,
            isSelected: false
          }));
          this.loading = false;
        }
      },
      error: (err: any) => {
        this.error = 'Failed to load quiz games. Please try again.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  selectQuiz(quiz: Quiz) {
    this.quizzes.forEach(q => q.isSelected = false);
    quiz.isSelected = true;
    this.selectedQuiz = quiz;
  }

  startQuiz() {
    if (this.selectedQuiz) {
      this.apiService.getBibleBooks().subscribe({
        next: (res: any) => {
          if (res.success && res.books) {
            this.availableBooks = res.books;
            this.gameOptionModalOpen.set(true);
          }
        },
        error: (err: any) => {
          console.error(err);
        }
      });
    }
  }

  getQuizIcon(type: string): string {
    switch(type) {
      case 'group':
        return 'people-group';
      default:
        return 'gamepad';
    }
  }

  onBookSelected(value: any) {
    this.selectedBook.set(value);
  }

  submitGameOption() {
    /* after game option is submitted, start the quiz */
    this.isGameStarted.set(true);
  }
}