import { data } from "../assets/tinfoil_database.json";
import customDatabase from "../assets/custom_database.json";

export const matchIdFromTinfoil = (id: string): string => {
  let tinFoilName: any = data.find(d => d.id.toUpperCase() === id);

  if (tinFoilName) {
    const matches = />(.+)</.exec(tinFoilName.name)

    if (matches && matches.length >= 2) {
      return matches[1];
    }
  }

  return null;
}

export const matchIdFromCustomDatabase = (id: string) : string => {
  return (customDatabase as ({ [key: string]: string}))[id] || null;
}
