let loginMounted = false;

export const setLoginMounted = (mounted: boolean) => {
  loginMounted = mounted;
};

export const isLoginMounted = () => loginMounted;
