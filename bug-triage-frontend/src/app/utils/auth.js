export function saveCurrentUser(user, token) {
  localStorage.setItem("currentUser", JSON.stringify(user));
  localStorage.setItem("token", token);
}

export function getCurrentUser() {
  const user = localStorage.getItem("currentUser");
  return user ? JSON.parse(user) : null;
}

export function getToken() {
  return localStorage.getItem("token");
}

export function logout() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("token");
}
