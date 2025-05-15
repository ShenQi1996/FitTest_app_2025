import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  email: null,
  role: null,
  firstname: null,
  lastname: null,
  birthday: null,
  appointments: [],
  phone: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action) {
      state.email = action.payload.email;
      state.role = action.payload.role;
      state.firstname = action.payload.firstname;
      state.lastname = action.payload.lastname;
      state.birthday = action.payload.birthday;
      state.phone = action.payload.phone;
    },
    clearUser(state) {
      state.email = null;
      state.role = null;
      state.firstname = null;
      state.lastname = null;
      state.birthday = null;
      state.phone = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
