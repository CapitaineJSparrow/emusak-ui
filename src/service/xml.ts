// http://nswdb.com/
const parseNswXML = async (xml: string) => {
  const idRegex = /<titleid>(.+)</g
  const nameRegex = /<name>(.+)/g
  const idMatches = [];
  const nameMatches: any = [];

  let idMatch = idRegex.exec(xml);
  while (idMatch != null) {
    idMatches.push(idMatch[1]);
    idMatch = idRegex.exec(xml);
  }

  let nameMatch = nameRegex.exec(xml);
  while (nameMatch != null) {
    nameMatches.push(nameMatch[1]);
    nameMatch = nameRegex.exec(xml);
  }

  return idMatches.map((id, index) => ({ id: id, title: nameMatches[index] }));
}

export {
  parseNswXML
}
