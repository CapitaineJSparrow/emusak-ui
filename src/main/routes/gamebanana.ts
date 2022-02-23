import HttpService from "../services/HttpService";
import fetch from "node-fetch";
import cheerio from "cheerio";

export type searchProps = [string];

export const searchGameBana = async (...args: searchProps) => {
  const [name] = args;
  const res = await HttpService.searchGameBana(name) as unknown as { _idRow: number }[];

  if (res.length === 0) {
    return;
  }

  const url = `https://gamebanana.com/mods/games/${res[0]._idRow}?mid=SubmissionsList&vl[preset]=most_dld&vl%5Border%5D=downloads`;
  const modPageContent = await fetch(url).then(r => r.text()).catch(() => "");
  const $ = cheerio.load(modPageContent);
  const modsIdentifiers = $("recordCell[class='Identifiers']");
  const modsPreviews = $("recordCell[class='Preview']");

  return modsIdentifiers.map((i, element) => {
    const modElement = $(element).find("a[class='Name']");
    return {
      name: modElement.text().trim(),
      url: modElement.attr("href"),
      cover: $(modsPreviews[i]).find("img").attr("src")
    };
  });
};
