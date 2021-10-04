import axios from "axios";

axios.defaults.baseURL = `http://localhost:8080`;

export class ChatAPI {
  static async auth(credentials: { name: string; password: string }) {
    try {
      const { data } = await axios.post("/auth", credentials);

      return data;
    } catch (error: any) {
      console.log(error.message);
    }
  }
}
