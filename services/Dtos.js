function calculateTotalAmount(price, quantity) {
  return price * quantity;
}

export const userDTO = (user) => {
  const { userId, fullName, email, role, phone, status } = user;
  return {
    userId,
    fullName,
    email,
    role,
    phone,
    status,
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

export const truckDetailDto = (truck) => {
  const { id, numberPlate, chesosNumber, createdAt, updatedAt, User } = truck;
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

export const allSparePartDto = (sparePart) => {
  const { id, name, quantity, price, createdAt, updatedAt, User } = sparePart;
  return {
    id,
    name,
    quantity,
    price,
    createdAt,
    updatedAt,
    user: {
      fullName: User?.fullName || null,
      email: User?.email || null,
    },
  };
};

export const sparePartDetailDto = (sparePart) => {
  const { id, name, quantity, price, createdAt, updatedAt, User } = sparePart;
  return {
    id,
    name,
    quantity,
    price,
    createdAt,
    updatedAt,
    user: {
      fullName: User?.fullName || null,
      email: User?.email || null,
    },
  };
};

export const allLoadsDto = (loadTruck) => {
  const { id, date, from, to, createdAt, amount, updatedAt, User, Truck } =
    loadTruck;
  return {
    id,
    date,
    from,
    to,
    amount,
    createdAt,
    updatedAt,
    user: {
      fullName: User?.fullName || null,
      email: User?.email || null,
    },
    truck: {
      id: Truck?.id || null,
      numberPlate: Truck?.numberPlate || null,
      chesosNumber: Truck?.chesosNumber || null,
    },
  };
};

export const loadTruckDetailDto = (loadTruck) => {
  const { id, date, from, to, amount, createdAt, updatedAt, User, Truck } =
    loadTruck;
  return {
    id,
    date,
    from,
    to,
    amount,
    createdAt,
    updatedAt,
    user: {
      fullName: User?.fullName || null,
      email: User?.email || null,
    },
    truck: {
      id: Truck?.id || null,
      numberPlate: Truck?.numberPlate || null,
      chesosNumber: Truck?.chesosNumber || null,
    },
  };
};

export const allUsedPartDto = (usedPart) => {
  const { id, quantityUsed, createdAt, updatedAt, User, Truck, SparePart } =
    usedPart;
  return {
    id,
    quantityUsed,
    createdAt,
    updatedAt,
    totalAmount: calculateTotalAmount(SparePart.price, quantityUsed),
    user: { ...User },
    truck: { ...Truck },
    sparePart: { ...SparePart },
  };
};

export const usedPartDetailDto = (usedPart) => {
  const { id, quantityUsed, createdAt, updatedAt, User, Truck, SparePart } =
    usedPart;
  return {
    id,
    quantityUsed,
    createdAt,
    updatedAt,
    totalAmount: calculateTotalAmount(SparePart.price, quantityUsed),
    user: { ...User },
    truck: { ...Truck },
    sparePart: { ...SparePart },
  };
};
