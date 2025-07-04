import useUserStore, { IUser } from "../zustand/useUserStore";
import api, { ENDPOINT } from "./api";

class UserService {
  async createOrUpdateUser(user: IUser) {
    const res = await api.post(ENDPOINT + "/user/update", {
      fields: user,
    });

    useUserStore.setState(res.data.user);

    return res.data as { user: IUser; message: string };
  }

  async getUser() {
    const res = await api.get(ENDPOINT + "/user");
    console.log("UserService getUser", res.data.user);
    useUserStore.setState(res.data.user);

    return res.data as { user: IUser; message: string };
  }
}

const userService = new UserService();

export default userService;
