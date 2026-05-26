import { inject, Injectable } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private functions = inject(Functions);

  async startQuizSession(roomId: string | null): Promise<any> {
    if (!roomId) {
      throw new Error('roomId is required');
    }
    // Reference your backend Cloud Function
    const startSessionFn = httpsCallable<{ roomId: string }, { success: boolean }>(
      this.functions,
      'startQuiz',
    );

    // Fire and forget—the backend will take it from here
    return await startSessionFn({ roomId });
  }

  async restartQuizSession(roomId: string | null): Promise<any> {
    if (!roomId) {
      throw new Error('roomId is required');
    }
    const restartSessionFn = httpsCallable<{ roomId: string }, { success: boolean }>(
      this.functions,
      'restartQuiz',
    );

    return await restartSessionFn({ roomId });
  }

  async endQuizSession(roomId: string | null): Promise<any> {
    if (!roomId) {
      throw new Error('roomId is required');
    }
    const endSessionFn = httpsCallable<{ roomId: string }, { success: boolean }>(
      this.functions,
      'endQuiz',
    );

    return await endSessionFn({ roomId });
  }

  async nextQuestion(roomId: string | null): Promise<any> {
    if (!roomId) {
      throw new Error('roomId is required');
    }
    try {
      const nextQuestionFn = httpsCallable<{ roomId: string }, { success: boolean }>(
        this.functions,
        'nextQuestion',
      );
      return await nextQuestionFn({ roomId });
    } catch (error) {
      console.error('Error in nextQuestion:', error);
      throw error;
    }
  }
}
