import { IUser } from "../zustand/useUserStore";
import { ENDPOINT, getCommonHeaders } from "./api";

class UserService {
  async createOrUpdateUser(user: IUser) {
    const res = await fetch(ENDPOINT + "/user/update", {
      method: "POST",
      body: JSON.stringify(user),
      headers: await getCommonHeaders(),
    });

    const data = await res.json();
    return data;
  }
}

const userService = new UserService();

export default userService;
