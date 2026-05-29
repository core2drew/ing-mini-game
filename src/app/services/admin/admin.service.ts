import { inject, Injectable } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { concatMap, from, Observable } from 'rxjs';

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

  nextQuestion(roomId: string): Observable<any> {
    const disconnectPlayersFn = httpsCallable<{ roomId: string }, any>(
      this.functions,
      'disconnectThinkingPlayers',
    );
    const nextQuestionFn = httpsCallable<{ roomId: string }, any>(this.functions, 'nextQuestion');

    // Convert the Promises returned by httpsCallable into RxJS Observables
    return from(disconnectPlayersFn({ roomId })).pipe(
      concatMap((disconnectResult) => {
        console.log('Player cleanup complete:', disconnectResult.data);
        // Execute the second function only after the first one completes successfully
        return from(nextQuestionFn({ roomId }));
      }),
    );
  }
}
