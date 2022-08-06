import FileWorker from './fileWorker.js';
import Bot from './bot.js';
import config from './config.js';


const fw = new FileWorker(config.fname);
const bot = new Bot(config.token, fw);

bot.listeners();
