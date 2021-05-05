import * as fs from "fs";
import fetch from "isomorphic-fetch"
import {parseNswXML} from "./src/service/xml";

fetch('http://nswdb.com/xml.php')
  .then((r: any) => r.text())
  .then(async (text: string) => {
    text = text.replace(/\[Rev 1.0.0]/gi, '');
    text = text.replace(/<\/name>/gi, '');
    let json = await parseNswXML(text)
    json = json.map(item => ({ ...item, ...{ id: item.id.split(' ')[0] } }))
    fs.writeFileSync('./src/assets/test.json', JSON.stringify(json), 'utf-8')
  })
