// Location parsing and validation utilities
export interface LocationInfo {
  zone: string;
  subZone: string;
  floor: number;
}

export function parseLocation(location: string): LocationInfo | null {
  if (!location) return null;
  
  // Parse format like "A-1-01" or "B-2-03"
  const match = location.match(/^([A-Z]+)-(\d+)-(\d+)$/);
  if (!match) return null;
  
  return {
    zone: match[1],
    subZone: match[2],
    floor: parseInt(match[3])
  };
}

export function validateLocation(location: string): boolean {
  return parseLocation(location) !== null;
}

export function generateWarehouseLayoutData() {
  const zones = ['A', 'B', 'C', 'D'];
  const layout = [];
  
  for (const zone of zones) {
    for (let subZone = 1; subZone <= 5; subZone++) {
      layout.push({
        zoneName: `구역-${zone}`,
        subZoneName: `${zone}-${subZone}`,
        floors: [1, 2, 3, 4, 5]
      });
    }
  }
  
  return layout;
}
