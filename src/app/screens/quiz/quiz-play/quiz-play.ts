import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/api.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AutocompleteComponent } from '../../../components/autocomplete.component';
import { DropdownComponent } from '../../../components/dropdown.component';
import { ToastService } from '../../../core/toast/toast.service';

interface Quiz {
  id: number;
  name: string;
  description: string;
  type: string;
  isSelected?: boolean;
}

interface Question {
  id: number;
  question: string;
  answer: string;
  time: number;
  isAnswered?: boolean;
}

@Component({
  selector: 'app-quiz-play',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    AutocompleteComponent,
    DropdownComponent,
  ],
  templateUrl: './quiz-play.html',
  styleUrl: './quiz-play.scss',
})
export class QuizPlay implements OnInit {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  games: Quiz[] = [];
  error: string | null = null;
  selectedGame: Quiz | null = null;
  isGameStarted = false;
  gameOptionModalOpen = false;
  availableBooks: string[] = [];

  // Game Options
  selectedBook = '';
  selectedTime = 0;
  selectedQuestionCount = 0;

  // Questions
  questionPattern: Question[] = [];
  selectedQuestion: Question | null = null;
  isAnswerRevealed = false;
  countdown = 0;
  timerRef: any = null;
  questionList: any[] = [];

  // Timer options
  timerOptions = Array.from({ length: 10 }, (_, i) => {
    const seconds = (i + 1) * 30;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    let label: string;
    if (minutes === 0) {
      label = `${seconds} seconds`;
    } else if (remainingSeconds === 0) {
      label = `${minutes} minute${minutes === 1 ? '' : 's'}`;
    } else {
      label = `${minutes} minute${minutes === 1 ? '' : 's'} ${remainingSeconds} seconds`;
    }

    return { label, value: seconds };
  });

  ngOnInit() {
    this.fetchGameList();
  }

  fetchGameList() {
    this.apiService.getQuizList().subscribe({
      next: (res: any) => {
        if (res.success && res.quizzes) {
          this.games = res.quizzes.map((quiz: Quiz) => ({
            ...quiz,
            isSelected: false,
          }));
        }
      },
      error: (err: any) => {
        this.error = 'Failed to load quiz games.';
        console.error(err);
      },
    });
  }

  selectQuiz(quiz: Quiz) {
    this.games.forEach((q) => (q.isSelected = false));
    quiz.isSelected = true;
    this.selectedGame = quiz;
  }

  startQuiz() {
    if (this.selectedGame) {
      this.apiService.getBibleBooks().subscribe({
        next: (res: any) => {
          if (res.success && res.books) {
            this.availableBooks = res.books;
            this.gameOptionModalOpen = true;
          }
        },
        error: () => {
          this.toastService.show({ message: 'Could not load books.', type: 'error' });
        },
      });
    }
  }

  getQuizIcon(type: string): string {
    return type === 'group' ? 'people-group' : 'gamepad';
  }

  onBookSelected(value: string) {
    this.selectedBook = value;
  }

  onTimeSelected(event: { value: number }) {
    this.selectedTime = event.value;
  }

  onQuestionInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.selectedQuestionCount = Number(value);
  }

  onQuestionInputBlur(): void {
    if (!this.selectedQuestionCount || this.selectedQuestionCount < 1) {
      this.selectedQuestionCount = 1;
    } else if (this.selectedQuestionCount > 100) {
      this.selectedQuestionCount = 100;
    }
  }

  submitGameOption() {
    if (!this.selectedBook || !this.selectedTime || !this.selectedQuestionCount) {
      this.toastService.show({ message: 'Please fill all game options.', type: 'error' });
      return;
    }
    this.apiService.playGame().subscribe((res: any) => {
      console.log(res);
      this.questionList = res;
    });

    if (this.questionList.length) {
      this.questionPattern = this.questionList
        .filter(q => q.book === this.selectedBook)
        .slice(0, this.selectedQuestionCount)
        .map((q) => ({
          ...q,
          time: this.selectedTime,
          isAnswered: false,
        }));
      this.isGameStarted = true;
      this.gameOptionModalOpen = false;
    }
  }

  selectQuestion(question: Question) {
    if (question.isAnswered) {
      this.toastService.show({ message: 'You already answered this question.', type: 'info' });
      return;
    }

    if (this.timerRef) clearInterval(this.timerRef);

    this.selectedQuestion = question;
    this.countdown = question.time;
    this.isAnswerRevealed = false;

    this.timerRef = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.isAnswerRevealed = true;
        question.isAnswered = true;
        clearInterval(this.timerRef);
      }
    }, 1000);
  }

  revealAnswer() {
    if (this.timerRef) clearInterval(this.timerRef);
    this.isAnswerRevealed = true;
  }

  closeQuestionModal() {
    // if (this.timerRef) clearInterval(this.timerRef);

    if (this.selectedQuestion) {
      // this.isAnswerRevealed = true;
      this.selectedQuestion.isAnswered = true;
    }

    this.selectedQuestion = null;
    this.isAnswerRevealed = false;
    this.countdown = 0;
  }

  ngOnDestroy() {
    if (this.timerRef) clearInterval(this.timerRef);
  }
}