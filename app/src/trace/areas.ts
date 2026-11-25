export const AREAS = ["Head", "Face", "Throat", "Chest", "Stomach", "Back", "Arms", "Hands", "Hips", "Legs", "Feet", "Other"] as const;

export type Pick3D = {
  area: string;
  point: [number, number, number];
  normal: [number, number, number];
  x: number;
  y: number;
};

export function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}
