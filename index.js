const http = require('http');

// This tiny server tells Koyeb "I am alive!" so it doesn't kill your bot.
http.createServer(async (req, res) => {


    try{
        await checkAlerts()
    }
    catch(err) {
        console.log('the error occured')
    }

  await res.writeHead(200, { 'Content-Type': 'text/plain' });
  await res.end('Bot is running...');
}).listen(8000);

require('dotenv').config()
const TelegramAPI = require('node-telegram-bot-api')
TOKEN = process.env.BOT_TOKEN
const db = require('./db')
CMC_API = process.env.CMC_API
const axios = require('axios')
const bot = new TelegramAPI(TOKEN, {polling:true})


const cryptoActives = {
    reply_markup : {
        inline_keyboard:[
            [{text:'btc',callback_data:'ask_price_btc'}],
            [{text:'eth',callback_data:'ask_price_eth'}],
            [{text:'sol',callback_data:'ask_price_sol'}]
        ]
    }
}

const direction = {
    reply_markup:{
        inline_keyboard:[
            [{text:'above',callback_data:'above'}],
            [{text:'below',callback_data:'below'}]
        ]
    }
}

bot.setMyCommands([
    {command:'/start',description:'start command'},
    {command:'/info',description:'a command about this bot'},
    {command:'/set_alert',description:'a command that sets the alert'},
    {command:'/view_alerts',description:'a command that write all your current alerts'},
    {command:'/delete_alert',description:'a command that deletes alert by id'}
])

bot.on('message', async msg => {
    const text = msg.text
    const chatId = msg.chat.id


    if (text === '/start'){
        await bot.sendMessage(chatId,'Hello and welcome to reaper alert bot')
        try{
            await db.query(`INSERT INTO users(chat_id,username) VALUES (${chatId},'${msg.chat.first_name}')`)
        }
        catch(err) {
            console.log(err)
        }
    }
    if (text === '/info'){
        await bot.sendMessage(chatId,'Real-time Crypto Price Alerts. Set your target, sit back, and get notified the second your coin hits the mark')
    }
    if(text === '/set_alert'){
        await bot.sendMessage(chatId,'choose the crypto that you want to set an alert to',cryptoActives)
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
            await bot.sendMessage(chatId,'the error occured')
        }



    }
    if (text === '/delete_alert') {
        await bot.sendMessage(chatId,'write the alert id that you want to delete')
        bot.once('message', async msg => {
            const chatid = msg.chat.id
            const text = msg.text

            const finaltext = Number(text)

            try{
                await db.query(`DELETE FROM alert WHERE alert_id = ${finaltext} AND user_id = ${chatid}`)
                await bot.sendMessage(chatid,`the alert with id:${finaltext} was successfully deleted`)
            }
            catch(err) {
                await bot.sendMessage(chatid,'the error occured')
            }
        })
    }

   
})



bot.on('callback_query', async msg => {
    const data = msg.data
    const chatId = msg.message.chat.id

    if (data === 'ask_price_btc'){
        const prompt = bot.sendMessage(chatId,'Write price for BTC',{
            reply_markup:{
                force_reply:true
            }
        })
        const price = axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',{
            headers:{
                'x-CMC_PRO_API_KEY':CMC_API
            },
            params:{
                symbol:'BTC'
            }
        })

        const answer = (await price).data.data['BTC'].quote.USD.price.toFixed(2)
        await bot.sendMessage(chatId,`the btc price is ${answer}`)
        
            bot.onReplyToMessage(chatId,(await prompt).message_id,async msg => {
            const userInp = msg.text

            
            await bot.sendMessage(chatId,'where do you want to get your price',direction)
            bot.once('callback_query', async msg => {
                const values = msg.data
                const chatid = msg.message.chat.id
                if (values === 'above'){
                    try {
                        await db.query(`INSERT INTO alert(user_id,price,crypto,trigered,direction) VALUES(${chatId},'${userInp}','BTC',false,'above')`)
                        
                    }
                    catch(err) {
                        await bot.sendMessage(chatId,'the error occured')
                    }
                    await bot.sendMessage(chatId,`your alert is:${values},BTC,${userInp}`)
                }
                if (values === 'below') {
                    try {
                        await db.query(`INSERT INTO alert(user_id,price,crypto,trigered,direction) VALUES(${chatId},'${userInp}','BTC',false,'below')`)
                        
                    }
                    catch(err) {
                        await bot.sendMessage(chatId,'the error occured')
                    }
                    await bot.sendMessage(chatId,`your alert is:${values},BTC,${userInp}`)
                }
        
            })
            
        
    })}
    if(data === 'ask_price_eth'){
        const prompt = bot.sendMessage(chatId,'write price for eth',{
            reply_markup:{
                force_reply:true
            }
        })
        const price = axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',{
            headers:{
                'x-CMC_PRO_API_KEY':CMC_API
            },
            params:{
                symbol:'ETH'
            }
        })


        const answer = (await price).data.data['ETH'].quote.USD.price.toFixed(2)
        //in order to select all alert i just need to select user id from the database and compare that to the chatid

        bot.sendMessage(chatId,`the eth price is ${answer}`)
        bot.onReplyToMessage(chatId,(await prompt).message_id,async msg => {
            const userInp = msg.text


            
            await bot.sendMessage(chatId,'where do you want your price to go',direction)
        bot.once('callback_query',async cb => {
            const values = cb.data

            if (values === 'above'){
                try { 
                    await db.query(`INSERT INTO alert(user_id,price,crypto,trigered,direction) VALUES (${chatId},'${userInp}','ETH',false,'above')`)
                }
                catch(err) {
                    await bot.sendMessage(chatId,'the error occured')
                }
            }
            
            if (values === 'below'){
                try {
                   await db.query(`INSERT INTO alert(user_id,price,crypto,trigered,direction) VALUES (${chatId},'${userInp}','ETH',false,'below')`)
                }
                catch(err){
                    await bot.sendMessage(chatId,'the error occured')
                }
            }
            await bot.sendMessage(chatId,`your alert is:${values}, ETH,${userInp}`)
        })
        })

    }
    if (data === 'ask_price_sol'){
        const prompt = bot.sendMessage(chatId,'write your price for sol',{
            reply_markup:{
                force_reply:true
            }
        })

        const price = axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',{
            headers:{
                'x-CMC_PRO_API_KEY':CMC_API
            },
            params:{
                symbol:'SOL'
            }
        })


        const answer = (await price).data.data['SOL'].quote.USD.price.toFixed(2)

        
        await bot.sendMessage(chatId,`the sol price is ${answer}`)

        bot.onReplyToMessage(chatId,(await prompt).message_id, async msg => {
            const userInp = msg.text

            
        await bot.sendMessage(chatId,'where do you want your price to go',direction)

        bot.once('callback_query',async cb => {
            const data1 = cb.data
            

            if (data1 === 'above') {
                try{
                    await db.query(`INSERT INTO alert(user_id,price,crypto,trigered,direction) VALUES (${chatId},'${userInp}','SOL',false,'above')`)
                }
                catch(err) {
                    await bot.sendMessage(chatId,'the error occured')
                }
            }
            if(data1 === 'below') {
                try {
                    await db.query(`INSERT INTO alert(user_id,price,crypto,trigered,direction) VALUES (${chatId},'${userInp}','SOL',false,'below')`)
                }
                catch(err) {
                    await bot.sendMessage(chatId,'the error occured')
                }
            }
            await bot.sendMessage(chatId,`your alert is :${data1},SOL,at ${userInp}`)
        })
        
        })
        

    }

})

async function checkAlerts () {

    try{
        const res = await db.query(`SELECT user_id,price,crypto,direction FROM alert WHERE trigered = false`)

        
        const final = res.rows

        for(const alert of final) {

            

        
        const cryptoPrice = axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',{
            headers:{
                'x-CMC_PRO_API_KEY':CMC_API
            },
            params:{
                symbol:'BTC,ETH,SOL'
            }
        })

        const finaleth = (await cryptoPrice).data.data['ETH'].quote.USD.price.toFixed(2)
        const finalbtc = Number((await cryptoPrice).data.data['BTC'].quote.USD.price.toFixed(2))


        const finalSol = (await cryptoPrice).data.data['SOL'].quote.USD.price.toFixed(2)
        
        
        if (alert.crypto === 'BTC') {

    
            if (alert.direction === 'above') {
                
                
                const finalprice = Number(alert.price)
                    
                   
                if (finalbtc > finalprice){
                    await bot.sendMessage(alert.user_id,`alert! BTC alert above ${finalprice} was trigered`)
                     await db.query(`UPDATE alert SET trigered = true WHERE user_id = ${alert.user_id} AND crypto = 'BTC' AND price = '${finalprice}' AND user_id = ${alert.user_id} AND direction = 'above'`)
                     console.log('the alert was trigered')
                    
                }
            }
            if (alert.direction === 'below') {
                
                
                const finalprice = Number(alert.price)
                
                if (finalbtc < finalprice) {
                    await bot.sendMessage(alert.user_id,`alert!BTC alert below ${finalprice} was trigered`)
                    await db.query(`UPDATE alert SET trigered = true WHERE user_id = ${alert.user_id} AND crypto = 'BTC' AND price = '${finalprice}' AND user_id = ${alert.user_id} AND direction = 'below'`)
                    console.log('the alert was trigered')
                }
            }
        }
        if (alert.crypto === 'ETH') {
            if (alert.direction === 'above' ) {
                const finalprice = Number(alert.price)
                if (finaleth > finalprice){
                    await bot.sendMessage(alert.user_id,`alert!ETH alert above ${finalprice} was trigered`)
                    await db.query(`UPDATE alert SET trigered = true WHERE user_id = ${alert.user_id} AND crypto = 'ETH' AND price = '${finalprice}' AND direction = 'above'`)
                }
            }
            if (alert.direction === 'below') {
                const finalprice = Number(alert.price)

                if (finaleth < finalprice) {
                    await bot.sendMessage(alert.user_id,`alert!ETH alert below ${finalprice} was trigered`)
                    await db.query(`UPDATE alert SET trigered = true WHERE user_id = ${alert.user_id} AND crypto = 'ETH' AND price = '${finalprice}' AND direction = 'below'`)
                }
            }
        }
        if (alert.crypto === 'SOL') {
            if(alert.direction === 'above') {
                const finalprice = Number(alert.price)

                if (finalSol > finalprice) {
                    await bot.sendMessage(alert.user_id,`alert! SOL alert above ${finalprice} was trigered`)
                    await db.query(`UPDATE alert SET trigered = true WHERE user_id = ${alert.user_id} AND crypto = 'SOL' AND price = '${finalprice}' AND direction = 'above'`)
                }
            }
            if (alert.direction === 'below') {
                const finalprice = Number(alert.price)

                if (finalSol < finalprice) {
                    await bot.sendMessage(alert.user_id,`alert!SOL alert below ${finalprice} was trigered`)
                    await db.query(`UPDATE alert SET trigered = true WHERE user_id = ${alert.user_id} AND crypto = 'SOL' AND price = '${finalprice}' AND direction = 'below'`)
                }
            }
        }
    }
    }
    catch(err) {
        console.error(err)
    }
}
            
        
        
checkAlerts()

