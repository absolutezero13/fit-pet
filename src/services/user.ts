import { IUser } from "../zustand/useUserStore";
import api, { ENDPOINT } from "./api";

class UserService {
  async createOrUpdateUser(user: IUser) {
    const res = await api.post(ENDPOINT + "/user/update", {
      fields: user,
    });

    return res.data;
  }
}

const userService = new UserService();

export default userService;
