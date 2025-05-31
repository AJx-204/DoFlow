const parseEnvTime = (timeStr) => {
    const value = parseInt(timeStr);
    if (timeStr.endsWith('d')) return value * 24 * 60 * 60 * 1000;
    if (timeStr.endsWith('h')) return value * 60 * 60 * 1000;
    if (timeStr.endsWith('m')) return value * 60 * 1000;
    return value * 1000;
  };
export const getCookieOptions = (type = "access") => {
    const expiry = type === "access"
      ? process.env.ACCESS_TOKEN_EXPIRY
      : process.env.REFRESH_TOKEN_EXPIRY;
  
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: '/',
      maxAge: parseEnvTime(expiry),
    };
  };