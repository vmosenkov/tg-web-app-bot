const TelegramBot = require("node-telegram-bot-api");
const express = require('express');
const cors = require('cors');

const token = process.env.REACT_APP_TELEGRAM_TOKEN 
const webAppUrl = 'https://d259-95-58-80-195.eu.ngrok.io';

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());

/* const menuOptions = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{text: 'Сделать заказ', callback_data: '/order'}],
      [{text: 'Меню', callback_data: '/menu'}, {text: 'Информация о нас', callback_data: '/info'}],
      [{text: 'Перезапустить', callback_data: '/start'}]
    ]
  })
} */

/* const aboutUs = async () => {
  await bot.sendMessage(chatId, `Здесь написано что-то о нас`);
} */



const start = () => {

/*   bot.setMyCommands([
    {command: '/start', description:'Начальное приветствие'},
    {command: '/menu', description:'Меню'},
    {command: '/info', description:'Информация о нас'},
    {command: '/info_me', description:'Информация о себе'},
    {command: '/question', description:'Задать вопрос'},
    {command: '/order', description:'Сделать заказ'},
  ]) */

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text
    console.log(msg)

    const menuOptions = async () => {
      await bot.sendMessage(chatId, 'Меню', {
        reply_markup: {
          resize_keyboard: true,
          one_time_keyboard: true,
          keyboard: [
            [{text: 'Сделать заказ 📦', web_app:{url: webAppUrl}}],
            [{text: 'Меню', menuOptions}],
            [{text: 'Информация о нас'}],
            [{text: 'Задать вопрос'}],
            [{text: '/start', start}]
          ]
        }
      });
    }
  
    if(text === '/start') {
      //await bot.sendSticker(chatId, 'https://chpic.su/_data/stickers/y/Yellowboi/Yellowboi_002.webp')
      await bot.sendMessage(chatId, `Добро пожаловать ${msg.from.first_name}`);
      return menuOptions();
    }
  
    if(text === 'Меню') {
      return menuOptions();
    }
  
    if(text === 'Информация о нас') {
      return bot.sendMessage(chatId, 'Здесь написано что-то о нас');
    }
  
    if(text === '/order') {
      await bot.sendMessage(chatId, 'Ниже будет форма', {
        reply_markup: {
          keyboard: [
            [{text: 'Заполнить форму', web_app:{url: webAppUrl + '/form'} }]
          ]
        }
      });
  
      /* return bot.sendMessage(chatId, 'Заходи в наш интернет магазин по кнопке ниже', {
        reply_markup: {
          inline_keyboard: [
            [{text: 'Сделать заказ', web_app:{url: webAppUrl} }]
          ]
        }
      }); */
    }
  
    if(msg?.web_app_data?.data) {
      try {
        const data = JSON.parse(msg?.web_app_data?.data)
        console.log(data)
        await bot.sendMessage(chatId, 'Спасибо за обратную связь!')
        await bot.sendMessage(chatId, 'Ваша страна: ' + data?.country);
        await bot.sendMessage(chatId, 'Ваша улица: ' + data?.street);
  
        setTimeout(async () => {
          return bot.sendMessage(chatId, 'Всю информацию вы получите в этом чате');
        }, 3000)
      } catch (e) {
        console.log(e);
      }
    }
  
    if(text === 'Задать вопрос') {
      return bot.sendMessage(chatId, 'Можешь написать свой вопрос сюда (ссылка на бота)');
    }

    return bot.sendMessage(chatId, 'Я тебя не понимаю( воспользуйся пожалуйста этим меню или напиши нам (ссылка на бота)', menuOptions)
  
  });

  bot.on('callback_query', (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;

    bot.sendMessage(chatId, `${data}`)
    console.log(msg)
  })
}

start();



app.post('/web-data', async (req, res) => {
  const {queryId, products = [], totalPrice} = req.body;
  try {
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'Успешная покупка',
      input_message_content: {
          message_text: `Поздравляю с покупкой, вы приобрели товар на сумму ${totalPrice}, ${products.map(item => item.title).join(', ')}`
      }
    })
    return res.status(200).json({});
  } catch (e) {
      await bot.answerWebAppQuery(queryId, {
        type: 'article',
        id: queryId,
        title: 'Не удалось приобрести товар',
        input_message_content: {
            message_text: `Не удалось приобрести товар`
        }
      })
    return res.status(500).json({})
  }
})

const PORT = process.env.REACT_APP_PORT;

app.listen(PORT, () => console.log('server started on PORT ' + PORT))