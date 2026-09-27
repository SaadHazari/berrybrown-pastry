export type Zone = {
  id: string;
  name: string;
  fee: number;
  freeOver: number;
  pickup?: boolean;
};

export const DUBAI_ZONE_ID = 'dubai';
export const PICKUP_ZONE_ID = 'pickup';

/** One Dubai zone: AED 20, free over AED 300. Never a headline — a line in checkout only. */
export const ZONES: Zone[] = [
  { id: DUBAI_ZONE_ID, name: 'Dubai', fee: 20, freeOver: 300 },
  { id: PICKUP_ZONE_ID, name: 'Pickup from the studio', fee: 0, freeOver: 0, pickup: true },
];

export const DELIVERY_ZONE = ZONES[0];

export const TIME_SLOTS = [
  { id: 'morning', label: '10am – 1pm' },
  { id: 'afternoon', label: '2pm – 5pm' },
  { id: 'evening', label: '6pm – 9pm' },
];

export function getZone(id: string): Zone | undefined {
  return ZONES.find((z) => z.id === id);
}
