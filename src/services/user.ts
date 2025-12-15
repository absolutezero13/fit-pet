import useUserStore, { IUser } from "../zustand/useUserStore";
import api, { ENDPOINT } from "./api";

class UserService {
  async createOrUpdateUser(user: IUser) {
    const res = await api.post(ENDPOINT + "/user/update", {
      fields: user,
    });

    console.log("UserService createOrUpdateUser", res.data.user);

    useUserStore.setState(res.data.user);

    return res.data as { user: IUser; message: string };
  }

  async getUser() {
    const res = await api.get(ENDPOINT + "/user");
    console.log("UserService getUser", res.data.user);
    useUserStore.setState(res.data.user);

    return res.data as { user: IUser; message: string };
  }

  async deletUser() {
    const res = await api.delete(ENDPOINT + "/user");
    useUserStore.setState({} as IUser);

    return res.data as { message: string };
  }
}

const userService = new UserService();

export default userService;
