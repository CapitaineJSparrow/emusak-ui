import { data } from "../assets/tinfoil_database.json";
import customDatabase from "../assets/custom_database.json";
import nswdb from "../assets/nswdb.json";

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

export const matchIdFromCustomDatabase = (id: string): string => ( customDatabase as ( { [key: string]: string } ) )[id]

export const matchIdFromNswdb = (id: string): string => nswdb.find(entry => entry.id === id)?.title

export const titleIdToName = (id: string) => matchIdFromCustomDatabase(id) || matchIdFromTinfoil(id) || matchIdFromNswdb(id) || id
