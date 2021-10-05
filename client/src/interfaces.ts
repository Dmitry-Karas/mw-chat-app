export interface IMessage {
  _id: string;
  userId: string;
  sender: string;
  body: string;
  time: string;
  createdAt: Date;
}

export interface IUser {
  _id: string;
  name: string;
  role: string;
  isBanned: boolean;
  isMuted: boolean;
  color: string;
}
