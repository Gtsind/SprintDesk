import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";
import type { User } from "../types";
import {
  setAuthToken,
  login as apiLogin,
  getCurrentUser,
} from "../services/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

type AuthAction =
  | { type: "LOGIN_SUCCESS"; payload: { user: User; token: string } }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean };

interface AuthContextType {
  state: AuthState;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
      };

    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: localStorage.getItem("token"),
    isLoading: false,
  });

  useEffect(() => {
    if (state.token) {
      setAuthToken(state.token);
      getCurrentUser()
        .then((user) => {
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: { user, token: state.token! },
          });
        })
        .catch(() => {
          localStorage.removeItem("token");
          dispatch({ type: "LOGOUT" });
        });
    }
  }, [state.token]);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await apiLogin(username, password);

      localStorage.setItem("token", response.access_token);
      setAuthToken(response.access_token);

      const user = await getCurrentUser();

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user, token: response.access_token },
      });
      return true;
    } catch (error) {
      dispatch({ type: "SET_LOADING", payload: false });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthToken(null);
    dispatch({ type: "LOGOUT" });
  };

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
