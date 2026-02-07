require('dotenv').config()
const TelegramAPI = require('node-telegram-bot-api')
TOKEN = process.env.BOT_TOKEN
const db = require('./db')
CMC_API = process.env.CMC_API
const axios = require('axios')
const bot = new TelegramAPI(TOKEN, {polling:true})

async function checkAlerts () {

    try{
        const res = await db.query(`SELECT user_id,price,crypto,direction FROM alert WHERE trigered = false`)

        
        const final = res.rows

        const cryptoPrice = axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',{
            headers:{
                'x-CMC_PRO_API_KEY':CMC_API
            },
            params:{
                symbol:'BTC,ETH,SOL,TON'
            }
        })

        for(const alert of final) {


        
        

        const finaleth = (await cryptoPrice).data.data['ETH'].quote.USD.price.toFixed(2)
        const finalbtc = Number((await cryptoPrice).data.data['BTC'].quote.USD.price.toFixed(2))
        const finalton = (await cryptoPrice).data.data['TON'].quote.USD.price.toFixed(2)


        const finalSol = (await cryptoPrice).data.data['SOL'].quote.USD.price.toFixed(2)
        
        
        if (alert.crypto === 'BTC') {

    
            if (alert.direction === 'above') {
                
                
                const finalprice = Number(alert.price)
                    
                   
                if (finalbtc > finalprice){
                    try {await bot.sendMessage(alert.user_id,`Внимание! Сработал тригер по BTC выше ${finalprice}`)
                     await db.query(`UPDATE alert SET trigered = true WHERE user_id = ${alert.user_id} AND crypto = 'BTC' AND price = '${finalprice}' AND user_id = ${alert.user_id} AND direction = 'above'`)
                     console.log('the alert was trigered')
                    }
                    catch(err) {
                        await bot.sendMessage(alert.user_id,'ошибка')
                    }
                }
            }
            if (alert.direction === 'below') {
                
                
                const finalprice = Number(alert.price)
                
                if (finalbtc < finalprice) {
                   try  {await bot.sendMessage(alert.user_id,`Внимание! Сработал тригер по BTC ниже ${finalprice}`)
                    await db.query(`UPDATE alert SET trigered = true WHERE user_id = ${alert.user_id} AND crypto = 'BTC' AND price = '${finalprice}' AND user_id = ${alert.user_id} AND direction = 'below'`)
                    console.log('the alert was trigered')}
                    catch(err) {
                        await bot.sendMessage(alert.user_id,'ошибка')
                    }
                }
            }
        }
        if (alert.crypto === 'ETH') {
            if (alert.direction === 'above' ) {
                const finalprice = Number(alert.price)
                if (finaleth > finalprice){
                   try  {await bot.sendMessage(alert.user_id,`Внимание! Сработал тригер по ETH выше ${finalprice}`)
                    await db.query(`UPDATE alert SET trigered = true WHERE user_id = ${alert.user_id} AND crypto = 'ETH' AND price = '${finalprice}' AND direction = 'above'`)}
                    catch(err) {
                        await bot.sendMessage(alert.user_id,'the error occured')
                    }
                }
            }
            if (alert.direction === 'below') {
                const finalprice = Number(alert.price)

                if (finaleth < finalprice) {
                    try {await bot.sendMessage(alert.user_id,`Внимание! Сработал тригер по ETH ниже ${finalprice}`)
                    await db.query(`UPDATE alert SET trigered = true WHERE user_id = ${alert.user_id} AND crypto = 'ETH' AND price = '${finalprice}' AND direction = 'below'`)}
                    catch(err) {
                        await bot.sendMessage(alert.user_id,'the error occured')
                    }
                }
            }
        }
        if (alert.crypto === 'SOL') {
            if(alert.direction === 'above') {
                const finalprice = Number(alert.price)

                if (finalSol > finalprice) {
                   try {await bot.sendMessage(alert.user_id,`Внимание! Сработал тригер по SOL выше ${finalprice}`)
                    await db.query(`UPDATE alert SET trigered = true WHERE user_id = ${alert.user_id} AND crypto = 'SOL' AND price = '${finalprice}' AND direction = 'above'`)}
                    catch(err) {
                        await bot.sendMessage(alert.user_id,'the error occured')
                    }
                }
            }
            if (alert.direction === 'below') {
                const finalprice = Number(alert.price)

                if (finalSol < finalprice) {
                    try {await bot.sendMessage(alert.user_id,`Внимание! Сработал тригер по SOL ниже ${finalprice}`)
                    await db.query(`UPDATE alert SET trigered = true WHERE user_id = ${alert.user_id} AND crypto = 'SOL' AND price = '${finalprice}' AND direction = 'below'`)}
                    catch(err) {
                        await bot.sendMessage(alert.user_id,'the error occured')
                    }
                }
            }
        }
        if (alert.crypto === 'TON'){
            if (alert.direction === 'above'){
                const finalprice = Number(alert.price)
                    if (finalton > finalprice){
                        try{
                            await bot.sendMessage(alert.user_id,`Внимание! Сработал тригер по TON выше ${finalprice}`)
                            await db.query(`UPDATE alert SET trigered = true WHERE user_id = ${alert.user_id} AND crypto = 'TON' AND price = '${finalprice}' AND direction = 'above'`)
                        }
                        catch(err) {
                            await bot.sendMessage(alert.user_id,'ошибка')
                        }
                    }
                }
                if(alert.direction === 'below') {
                    const finalprice = Number(alert.price)

                    if (finalton < finalprice) {
                        try{
                            await bot.sendMessage(alert.user_id,`Внимание! Сработал тригер по TON ниже ${finalprice}`)
                            await db.query(`UPDATE alert SET trigered = true WHERE user_id = ${alert.user_id} AND crypto = 'TON' AND price = '${finalprice}' AND direction = 'below'`)
                        }
                         catch(err) {
                        await bot.sendMessage(alert.user_id,'ошибка')
                    }
                    }
                   
                }
            }
        
    }
    }
    catch(err) {
        console.error(err)
    }
}
    

const http = require('http');

// This tiny server tells Koyeb "I am alive!" so it doesn't kill your bot.
http.createServer(async (req, res) => {


    try{
        await checkAlerts()
    }
    catch(err) {
        console.log('the error occured')
    }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running...');
}).listen(8080);




const cryptoActives = {
    reply_markup : {
        inline_keyboard:[
            [{text:'btc',callback_data:'ask_price_btc'}],
            [{text:'eth',callback_data:'ask_price_eth'}],
            [{text:'sol',callback_data:'ask_price_sol'}],
            [{text:'ton',callback_data:'ask_price_ton'}]
        ]
    }
}

const direction = {
    reply_markup:{
        inline_keyboard:[
            [{text:'выше',callback_data:'above'}],
            [{text:'ниже',callback_data:'below'}]
        ]
    }
}

bot.setMyCommands([
    {command:'/info',description:'инфо про бот и его команды'},
    {command:'/set_alert',description:'команда для создания тригера'},
    {command:'/view_alerts',description:'просмотреть свои тригеры'},
    {command:'/delete_alert',description:'команда чтобы удалить тригер'}
])

bot.on('message', async msg => {
    const text = msg.text
    const chatId = msg.chat.id


    if (text === '/start'){
        await bot.sendMessage(chatId,'Приветствуем в reaper alert')
        try{
            await db.query(`INSERT INTO users(chat_id,username) VALUES (${chatId},'${msg.chat.first_name}')`)
        }
        catch(err) {
            console.log(err)
        }
    }
    if (text === '/info'){
        await bot.sendMessage(chatId,'Крипто-алерты в реальном времени. Установите цель, расслабьтесь и получите уведомление в ту же секунду, когда монета достигнет нужной отметки.' + '\n' + 'commands:"/set_alert":создать тригер,"/view_alerts":просмотр текущих тригеров,"/delete_alert":удалить тригер с помощью id')
    }
    if(text === '/set_alert'){
        await bot.sendMessage(chatId,'выберите крипту',cryptoActives)
    }
    if (text === '/view_alerts'){
        try{
            const res = await db.query(`SELECT alert_id,crypto,price,direction,trigered FROM alert WHERE user_id = '${chatId}';`)


            const text = JSON.stringify(res.rows).replace(/[\[\]]/g, '')        // Removes [ and ]
        .replace(/{/g, '\n—\n')        // Replaces start of object { with a separator line
        .replace(/}/g, '')             // Removes closing }
        .replace(/"/g, '')             // Removes all double quotes
        .replace(/:/g, ': ')           // Adds a space after colons for readability
        .replace(/,/g, '\n');
        
            await bot.sendMessage(chatId,text)
        }
        catch(err) {
            await bot.sendMessage(chatId,'ошибка')
        }



    }
    if (text === '/delete_alert') {
        await bot.sendMessage(chatId,'напишите id алерта чтобы удалить его')
        bot.once('message', async msg => {
            const chatid = msg.chat.id
            const text = msg.text

            const finaltext = Number(text)

            try{
                await db.query(`DELETE FROM alert WHERE alert_id = ${finaltext} AND user_id = ${chatid}`)
                await bot.sendMessage(chatid,`алерт с id:${finaltext} был удален`)
            }
            catch(err) {
                await bot.sendMessage(chatid,'ошибка')
            }
        })
    }

   
})



bot.on('callback_query', async msg => {
    const data = msg.data;
    const chatId = msg.message.chat.id;

    // --- BTC SECTION ---
    if (data === 'ask_price_btc') {
        const prompt = await bot.sendMessage(chatId, 'напишите цену для BTC', {
            reply_markup: { force_reply: true }
        });
        const price = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest', {
            headers: { 'x-CMC_PRO_API_KEY': CMC_API },
            params: { symbol: 'BTC' }
        });

        const answer = Number(price.data.data['BTC'].quote.USD.price.toFixed(2));
        await bot.sendMessage(chatId, `цена BTC: ${answer}`);

        bot.onReplyToMessage(chatId, prompt.message_id, async replyMsg => {
            const userInp = replyMsg.text;
            await bot.sendMessage(chatId, 'выберите направление', direction);
            
            bot.once('callback_query', async cbMsg => {
                const values = cbMsg.data;
                try {
                    await db.query(`INSERT INTO alert(user_id,price,crypto,trigered,direction) VALUES(${chatId},'${userInp}','BTC',false,'${values}')`);
                    await bot.sendMessage(chatId, `Ваш алерт создан: BTC ${values} ${userInp}`);
                } catch (err) {
                    await bot.sendMessage(chatId, 'ошибка при сохранении');
                }
            });
        });
    }

    // --- TON SECTION ---
    if (data === 'ask_price_ton') {
        const prompt = await bot.sendMessage(chatId, 'напишите цену для TON', {
            reply_markup: { force_reply: true }
        });
        const price = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest', {
            headers: { 'x-CMC_PRO_API_KEY': CMC_API },
            params: { symbol: 'TON' }
        });

        const answer = Number(price.data.data['TON'].quote.USD.price.toFixed(2));
        await bot.sendMessage(chatId, `цена TON: ${answer}`);

        bot.onReplyToMessage(chatId, prompt.message_id, async replyMsg => {
            const userInp = replyMsg.text;
            await bot.sendMessage(chatId, 'выберите направление', direction);

            bot.once('callback_query', async cbMsg => {
                const values = cbMsg.data;
                try {
                    await db.query(`INSERT INTO alert(user_id,price,crypto,trigered,direction) VALUES(${chatId},'${userInp}','TON',false,'${values}')`);
                    await bot.sendMessage(chatId, `Ваш алерт создан: TON ${values} ${userInp}`);
                } catch (err) {
                    await bot.sendMessage(chatId, 'ошибка при сохранении');
                }
            });
        });
    }

    // --- ETH SECTION ---
    if (data === 'ask_price_eth') {
        const prompt = await bot.sendMessage(chatId, 'напишите цену для ETH', {
            reply_markup: { force_reply: true }
        });
        const price = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest', {
            headers: { 'x-CMC_PRO_API_KEY': CMC_API },
            params: { symbol: 'ETH' }
        });

        const answer = Number(price.data.data['ETH'].quote.USD.price.toFixed(2));
        await bot.sendMessage(chatId, `цена eth: ${answer}`);

        bot.onReplyToMessage(chatId, prompt.message_id, async replyMsg => {
            const userInp = replyMsg.text;
            await bot.sendMessage(chatId, 'выберите направление', direction);

            bot.once('callback_query', async cbMsg => {
                const values = cbMsg.data;
                try {
                    await db.query(`INSERT INTO alert(user_id,price,crypto,trigered,direction) VALUES (${chatId},'${userInp}','ETH',false,'${values}')`);
                    await bot.sendMessage(chatId, `Ваш алерт создан: ETH ${values} ${userInp}`);
                } catch (err) {
                    await bot.sendMessage(chatId, 'ошибка');
                }
            });
        });
    }

    // --- SOL SECTION ---
    if (data === 'ask_price_sol') {
        const prompt = await bot.sendMessage(chatId, 'напишите цену для SOL', {
            reply_markup: { force_reply: true }
        });
        const price = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest', {
            headers: { 'x-CMC_PRO_API_KEY': CMC_API },
            params: { symbol: 'SOL' }
        });

        const answer = Number(price.data.data['SOL'].quote.USD.price.toFixed(2));
        await bot.sendMessage(chatId, `цена SOL: ${answer}`);

        bot.onReplyToMessage(chatId, prompt.message_id, async replyMsg => {
            const userInp = replyMsg.text;
            await bot.sendMessage(chatId, 'выберите направление', direction);

            bot.once('callback_query', async cbMsg => {
                const data1 = cbMsg.data;
                try {
                    await db.query(`INSERT INTO alert(user_id,price,crypto,trigered,direction) VALUES (${chatId},'${userInp}','SOL',false,'${data1}')`);
                    await bot.sendMessage(chatId, `Ваш алерт создан: SOL ${data1} ${userInp}`);
                } catch (err) {
                    await bot.sendMessage(chatId, 'ошибка');
                }
            });
        });
    }

}); 
