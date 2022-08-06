import TelegramBot from 'node-telegram-bot-api';

class Bot {
	constructor(token, fw){
		this.bot = new TelegramBot(token, {polling: true});
		this.fw = fw;
	}
	listeners(){
		this.bot.on('message', (msg) => {
	
			if (typeof msg.reply_to_message === 'undefined'){
				const chat_id = msg.chat.id;
				this.main(chat_id)
			}
			
		})

		this.bot.on("callback_query", (callbackQuery) => {
	        const button = callbackQuery.data;
	        const chat_id = callbackQuery.message.chat.id;
	        this.bot.deleteMessage(chat_id, callbackQuery.message.message_id)

	        switch(button){
	        	case 'next':
	        		this.nextMeeting(chat_id);
	        		break;
	        	case 'list-tag':
	        		this.tagList(chat_id);
	        		break;
	        	case 'list-meet':
	        		this.meetList(chat_id);
	        		break
	        	case 'new-tag':
	        		this.newTag(chat_id);
	        		break;
	        	case 'new-meet':
	        		this.newMeeting(chat_id);
	        		break;
	        	case 'main':
	        		this.main(chat_id);
	        		break;
	        	case 'tags':
	        		this.tags(chat_id)
	        		break;
	        	case 'meets':
	        		this.meets(chat_id);
	        		break;
	        	case 'save-meet':
	        		this.saveMeet(chat_id, true);
	        		break;
	        	case 'no-save-meet':
	        		this.saveMeet(chat_id, false);
	        		break;
	        	case 'rand-tags':
	        		this.randTags(chat_id);
	        		break;
	        }
        })

      	this.bot.on('polling_error', (msg) => {
        	console.log(msg)
      	})

	}
	main(chat_id){
		const text = 'Активные комманды: '
    	const options = {
        	reply_markup: {
          		inline_keyboard: [
        	    [
        	      {
        	      	text: 'Свиданочки',
        	      	callback_data: 'meets'
        	      },
    	          {
        	        text: 'Тэги',
            	    callback_data: 'tags'
	              }
	            ]

	          ]
	        }
    	  }
		this.bot.sendMessage(chat_id, text, options)
	}
	meets(chat_id){
		const text = 'Свидания, встречи, междусобойчики =)';
		const options = {
			reply_markup: {
				inline_keyboard: [
				[
            	  {
                	text: 'Ближайшая',
	                callback_data: 'next'
	              },
	              {
                	text: 'Новая',
	                callback_data: 'new-meet'
	              },
	              {
	              	text: 'Прошедшие',
	              	callback_data: 'list-meet'
	              },
	              {
	            	text: '<--',
	                callback_data: 'main'
	              }
				]
				]
			}
		}
		this.bot.sendMessage(chat_id, text, options);
	}

	tags(chat_id){
		const text = 'Тэги:';
		const options = {
			reply_markup: {
				inline_keyboard: [
				[
            	  {
                	text: 'Список',
	                callback_data: 'list-tag'
	              },
	              {
                	text: 'Новый',
	                callback_data: 'new-tag'
	              },
	              {
	              	text: '2 случайных',
	              	callback_data: 'rand-tags'
	              },
	              {
	            	text: '<--',
	                callback_data: 'main'
	              }	
				]
				]
			}
		}
		this.bot.sendMessage(chat_id, text, options);
	}
	meetList(chat_id){
		const list = this.fw.readKey('list-meet');
		let text = "";
		const options = {
	    	reply_markup: {
	      		inline_keyboard: [
		    	    [
		        	  {
		            	text: '<--',
		                callback_data: 'main'
		              }
		            ]
        		]
        	}
		}
		if(list.length > 0){
			text = "Прошедшие встречи:\n"
			list.forEach( meet => {
				text += " -- " + meet + "\n";
			})	
		}else {
			text = "Пока нет добавленных встреч =(";
		}
		this.bot.sendMessage(chat_id, text, options);
	}
	nextMeeting(chat_id){
		const timedate = Date.parse(this.fw.readKey('next-meet-time'));
		
		const datadate = this.fw.readKey('next-meet-data');
		let text = "";
		const options = {
	    	reply_markup: {
	      		inline_keyboard: [
	    	    [
	        	  {
	            	text: '<--',
	                callback_data: 'main'
	              }
	            ]

	          ]
	        }
		}
		if( timedate > Date.now()){
			const diffTime = Math.abs(timedate - Date.now());
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
			const diffHours = diffDays * 24;
			const diffMinutes = diffHours * 60;
			text = datadate + "\nДо следующей встречи осталось: " + diffDays + " дней... А точнее " + diffHours + " часов... А точнее " + diffMinutes + " минут)";
		}else {
			text = "Новое свидание еще не назначено =(\nПрошедшее: " + datadate;
		}
		this.bot.sendMessage(chat_id, text, options);
	}
	newMeeting(chat_id){
		const datadate = this.fw.readKey('next-meet-data');

		const text = 'Прошлая встреча (' + datadate + ') состоялась?';
		const options = {
			reply_markup: {
				inline_keyboard: [
				[
            	  {
                	text: 'Да',
	                callback_data: 'save-meet'
	              },
	              {
                	text: 'Нет',
	                callback_data: 'no-save-meet'
	              },
	              {
	            	text: '<--',
	                callback_data: 'main'
	              }	
				]
				]
			}
		}
		this.bot.sendMessage(chat_id, text, options)
	}
	async saveMeet(chat_id, save){
		if(save){
			const datadate = this.fw.readKey('next-meet-data');
			let listMeet = this.fw.readKey('list-meet');
			listMeet.push(datadate);
			this.fw.writeKey('list-meet', listMeet);
		}
		const text = "Назначить новую встречу: (место)";
		const options = {
			reply_markup: {
				force_reply: true
			}
		}
		const prompt = await this.bot.sendMessage(chat_id, text, options);
		this.bot.onReplyToMessage(chat_id, prompt.message_id, async (data) => {
			const meetData = data.text;
			
			this.fw.writeKey('next-meet-data', meetData);
			const text = "Дата и время (год-месяц-деньTчасы:минуты)";
			const options = {
				reply_markup: {
					force_reply: true
				}
			}
			const promptTime = await this.bot.sendMessage(chat_id, text, options);
			this.bot.onReplyToMessage(chat_id, promptTime.message_id, async (timedata) => {
				const meetTime = timedata.text;

				this.fw.writeKey('next-meet-time', meetTime);
				const text = "Встреча добавлена";
				const options = {
			    	reply_markup: {
			      		inline_keyboard: [
				    	    [
				        	  {
				            	text: '<--',
				                callback_data: 'main'
				              }
				            ]
		        		]
		        	}
				}
				this.bot.sendMessage(chat_id, text, options);
			})
		})

	}
	tagList(chat_id){
		const list = this.fw.readKey('tags');
		let text = "";
		const options = {
	    	reply_markup: {
	      		inline_keyboard: [
		    	    [
		        	  {
		            	text: '<--',
		                callback_data: 'main'
		              }
		            ]
        		]
        	}
		}
		if(list.length > 0){
			text = "Добавлены тэги:\n"
			list.forEach( tag => {
				text += "#" + tag + "\n";
			})	
		}else {
			text = "Пока нет добавленных тэгов =(";
		}
		this.bot.sendMessage(chat_id, text, options);
	}
	async newTag(chat_id){
		const text = "Написать новый тэг";
		const options = {
	    	reply_markup: {
				force_reply: true
			}
		}
		const prompt = await this.bot.sendMessage(chat_id, text, options)
		this.bot.onReplyToMessage(chat_id, prompt.message_id, async (newtag) => {
			const tag = newtag.text;
			let listTags = this.fw.readKey('tags');
			listTags.push(tag);
			this.fw.writeKey('tags', listTags);
			const textSuccess = "Тэг сохранен!";
			const optionsSuccess = {
		    	reply_markup: {
		      		inline_keyboard: [
			    	    [
			        	  {
			            	text: '<--',
			                callback_data: 'main'
			              }
			            ]
	        		]
	        	}
			}
			this.bot.sendMessage(chat_id, textSuccess, optionsSuccess);
		})
	}
	randTags(chat_id){
		const tags = this.fw.readKey('tags');
		const tag1 = tags[Math.floor(Math.random()*tags.length)];
		const tag2 = tags[Math.floor(Math.random()*tags.length)];
		const text = "#" + tag1 + " + #" + tag2;
		const options = {
	    	reply_markup: {
	      		inline_keyboard: [
		    	    [
		        	  {
		            	text: '<--',
		                callback_data: 'main'
		              }
		            ]
        		]
        	}
		}
		this.bot.sendMessage(chat_id, text, options);
	}
}

export default Bot;