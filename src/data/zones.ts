export type Zone = {
  id: string;
  name: string;
  fee: number;
  freeOver: number;
  pickup?: boolean;
};

export const PICKUP_ZONE_ID = 'pickup';

export const ZONES: Zone[] = [
  { id: 'downtown', name: 'Downtown, DIFC & Business Bay', fee: 30, freeOver: 500 },
  { id: 'marina', name: 'Marina, JBR & Palm', fee: 35, freeOver: 500 },
  { id: 'jumeirah', name: 'Jumeirah, Umm Suqeim & Al Wasl', fee: 30, freeOver: 500 },
  { id: 'hills', name: 'Dubai Hills, Barsha & JVC', fee: 35, freeOver: 500 },
  { id: 'ranches', name: 'Arabian Ranches, Damac Hills & Mudon', fee: 45, freeOver: 650 },
  { id: 'creek', name: 'Creek Harbour, Festival City & Mirdif', fee: 45, freeOver: 650 },
  { id: PICKUP_ZONE_ID, name: 'Pickup from our Al Quoz kitchen', fee: 0, freeOver: 0, pickup: true },
];

export const TIME_SLOTS = [
  { id: 'morning', label: '10am – 1pm' },
  { id: 'afternoon', label: '2pm – 5pm' },
  { id: 'evening', label: '6pm – 9pm' },
];

export function getZone(id: string): Zone | undefined {
  return ZONES.find((z) => z.id === id);
}
