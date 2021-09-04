import { data } from "../assets/tinfoil_database.json";
import nswdb from "../assets/nswdb.json";

let customDatabase = {};

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

// Download custom database remotely
fetch('https://raw.githubusercontent.com/CapitaineJSparrow/emusak-ui/main/src/assets/custom_database.json')
  .then(r => r.json())
  .then(d => customDatabase = d);

