import { Injectable } from '@angular/core';
import { doc, getDoc } from 'firebase/firestore';
import { FirebaseService } from '@services/firebase.service';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  constructor(private firebaseService: FirebaseService) {}

  async joinRoom(roomCode: string): Promise<boolean> {
    const roomRef = doc(this.firebaseService.getDb(), 'Rooms', roomCode);
    const roomSnap = await getDoc(roomRef);
    return roomSnap.exists();
  }
}
