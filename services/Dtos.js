export const userDTO = (user) => {
  const { userId, fullName, email, role } = user;
  return {
    userId,
    fullName,
    email,
    role,
  };
};

export const allTruckDto = (trucks) => {
  const { id, numberPlate, chesosNumber, createdAt, updatedAt, User } = trucks;
  return {
    id,
    numberPlate,
    chesosNumber,
    createdAt,
    updatedAt,
    user: {
      fullName: User?.fullName || null,
      email: User?.email || null,
    },
  };
};
