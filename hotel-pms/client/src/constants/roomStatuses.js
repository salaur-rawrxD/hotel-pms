export const ROOM_STATUSES = Object.freeze({
  VACANT: "VACANT",
  OCCUPIED: "OCCUPIED",
  DIRTY: "DIRTY",
  CLEAN: "CLEAN",
  OUT_OF_ORDER: "OUT_OF_ORDER",
  DUE_IN: "DUE_IN",
  DUE_OUT: "DUE_OUT",
});

export const ROOM_STATUS_LABELS = {
  VACANT: "Vacant",
  OCCUPIED: "Occupied",
  DIRTY: "Dirty",
  CLEAN: "Clean",
  OUT_OF_ORDER: "Out of Order",
  DUE_IN: "Due In",
  DUE_OUT: "Due Out",
};

export const ROOM_STATUS_LIST = Object.values(ROOM_STATUSES);
