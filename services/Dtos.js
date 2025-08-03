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
  const {
    id,
    numberPlate,
    chesosNumber,
    createdAt,
    updatedAt,
    User,
    driverName,
    driverIqamaNumber,
    iqamaDocument,
  } = trucks;
  return {
    id,
    numberPlate,
    chesosNumber,
    createdAt,
    updatedAt,
    driverName,
    driverIqamaNumber,
    iqamaDocument,
    user: {
      fullName: User?.fullName || null,
      email: User?.email || null,
    },
  };
};

export const truckDetailDto = (truck) => {
  const {
    id,
    numberPlate,
    chesosNumber,
    createdAt,
    updatedAt,
    User,
    driverName,
    driverIqamaNumber,
    iqamaDocument,
  } = truck;
  return {
    id,
    numberPlate,
    chesosNumber,
    createdAt,
    updatedAt,
    driverName,
    driverIqamaNumber,
    iqamaDocument,
    user: {
      fullName: User?.fullName || null,
      email: User?.email || null,
    },
  };
};

export const allSparePartDto = (sparePart) => {
  const { id, name, quantity, invoice, price, createdAt, updatedAt, User } =
    sparePart;
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
    ...(invoice && { invoice: invoice }),
  };
};

export const sparePartDetailDto = (sparePart) => {
  const { id, name, invoice, quantity, price, createdAt, updatedAt, User } =
    sparePart;
  return {
    id,
    name,
    quantity,
    price,
    createdAt,
    updatedAt,
    ...(invoice && { invoice: invoice }),
    user: {
      fullName: User?.fullName || null,
      email: User?.email || null,
    },
  };
};

export const allLoadsDto = (loadTruck) => {
  const {
    id,
    date,
    payment,
    invoice,
    from,
    to,
    createdAt,
    amount,
    updatedAt,
    User,
    Truck,
    tripMoney,
  } = loadTruck;
  return {
    id,
    date,
    from,
    to,
    payment,
    amount,
    createdAt,
    updatedAt,
    tripMoney,
    user: {
      fullName: User?.fullName || null,
      email: User?.email || null,
    },
    truck: {
      id: Truck?.id || null,
      numberPlate: Truck?.numberPlate || null,
      chesosNumber: Truck?.chesosNumber || null,
      driverName: Truck?.driverName || null,
    },
    ...(invoice && { invoice: invoice }),
  };
};

export const loadTruckDetailDto = (loadTruck) => {
  const {
    id,
    date,
    from,
    payment,
    invoice,
    to,
    amount,
    createdAt,
    updatedAt,
    User,
    Truck,
    tripMoney,
  } = loadTruck;
  return {
    id,
    date,
    from,
    to,
    payment,
    amount,
    createdAt,
    updatedAt,
    tripMoney,
    user: {
      fullName: User?.fullName || null,
      email: User?.email || null,
    },
    truck: {
      id: Truck?.id || null,
      numberPlate: Truck?.numberPlate || null,
      chesosNumber: Truck?.chesosNumber || null,
      driverName: Truck?.driverName || null,
    },
    ...(invoice && { invoice: invoice }),
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
