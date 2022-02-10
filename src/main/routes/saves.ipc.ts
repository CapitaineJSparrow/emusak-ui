import HttpService from "../services/HttpService";

export type listSavesProps = [string];

const listSavesForGame = async (...args: listSavesProps) => HttpService.downloadSavesDetails(args[0]);

export default listSavesForGame;
