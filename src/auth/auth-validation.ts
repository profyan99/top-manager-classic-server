export default async (decoded, request, h) => {
  const user = {}; // TODO
  if (!user) {
    return {
      valid: false
    };
  }
  return {
    valid: true,
    credentials: {
      user,
    },
  }
};
