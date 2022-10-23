module.exports = {
   menuOptions: {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [{text: 'Сделать заказ', callback_data: '/order'}],
          [{text: 'Меню', callback_data: '/menu'}, {text: 'Информация о нас', callback_data: '/info'}],
          [{text: 'Перезапустить', callback_data: '/start'}]
        ]
      })
    },
};