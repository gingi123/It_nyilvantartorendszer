import { jwtDecode } from "jwt-decode";
import { createContext, useMemo, useState } from "react";

export const AuthContext = createContext(null);

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const TOKEN_KEY = "token";
const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

function getRoleFromToken(token){
  if (!token) return null;
  try{
    const decoded = jwtDecode(token);
    return decoded.role ?? decoded[ROLE_CLAIM] ?? null;
  }
  catch{
    return null;
  }
}

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  const login = async ({ username, password }) => {
    const res = await fetch(`${baseUrl}/Auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Sikertelen belépés");
    }

    const data = await res.json(); 
    if (!data?.token) throw new Error("Nem érkezett token a szervertől");

    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    return data.token;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  const role = getRoleFromToken(token);

  const value = useMemo(() => ({ token, role, isAuthed: !!token, login, logout }), [token, role]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}