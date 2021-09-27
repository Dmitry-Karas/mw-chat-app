import axios from "axios";

axios.defaults.baseURL = `http://localhost:8080`;

export class ChatAPI {
  static async auth(credentials) {
    try {
      const { data } = await axios.post("/auth", credentials);

      return data;
    } catch (error) {
      console.log(error.message);
    }
  }
}
