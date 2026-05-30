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
    const purgeIdlePlayers = httpsCallable<{ roomId: string }, any>(
      this.functions,
      'purgeIdlePlayers',
    );
    const nextQuestionFn = httpsCallable<{ roomId: string }, any>(this.functions, 'nextQuestion');
    const transitionPlayersFn = httpsCallable<{ roomId: string }, any>(
      this.functions,
      'transitionWaitingToThinking',
    );

    // Step 1: Clean up idle players (Thinking -> Offline)
    return from(purgeIdlePlayers({ roomId })).pipe(
      concatMap((disconnectResult) => {
        console.log('Player cleanup complete:', disconnectResult.data);

        // Step 2: Push waiting players into active state (Waiting -> Thinking)
        return from(transitionPlayersFn({ roomId }));
      }),
      concatMap((transitionResult) => {
        console.log('Players transitioned to thinking:', transitionResult.data);

        // Step 3: Securely advance the room state to the next question
        return from(nextQuestionFn({ roomId }));
      }),
    );
  }
}
