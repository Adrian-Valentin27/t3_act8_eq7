export const loginAPI = async (username, password) => {
  try {
    const response = await fetch('https://dummyjson.com/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    if (!response.ok) {
      throw new Error('Usuario o contraseña incorrectos.');
    }

    const data = await response.json();
    return data; 
  } catch (error) {
    throw error;
  }
};