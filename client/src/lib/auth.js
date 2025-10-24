import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const {
    user,
    isLoading,
    isAuthenticated,
    error,
    login: storeLogin,
    register: storeRegister,
    logout: storeLogout,
    forgotPassword: storeForgotPassword,
    resetPassword: storeResetPassword,
    updateProfile: storeUpdateProfile,
    updatePassword: storeUpdatePassword,
    clearError,
    handleGoogleAuth,
  } = useAuthStore();

  const login = async (email, password) => {
    return await storeLogin({ email, password });
  };

  const register = async (userData) => {
    return await storeRegister(userData);
  };

  const logout = async () => {
    await storeLogout();
  };

  const forgotPassword = async (email) => {
    return await storeForgotPassword(email);
  };

  const resetPassword = async (token, password) => {
    return await storeResetPassword(token, password);
  };

  const updateProfile = async (profileData) => {
    return await storeUpdateProfile(profileData);
  };

  const updatePassword = async (passwordData) => {
    return await storeUpdatePassword(passwordData);
  };

  const loginWithGoogle = () => {
    handleGoogleAuth();
    return { success: true };
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    updatePassword,
    loginWithGoogle,
    clearError,
  };
}
