const login = require("facebook-chat-api"),
	fs = require('fs'),
	ontime = require('ontime'), // onTime
	weather = require('weather-js'), // Weather info
	afox = require('./admins.js'),
	version = "1.5.0",
	botId = "100022605855740"; // BOT ID !IMPORTANT

var useChar = "/";
var spokoj = true,
	ai = false;

var commands = [ // All commands starts here:
	{
		cmd: "help",
		groupAccess: false,
		transform: true,
		hidden: false,
		syntax: " --",
		desc: "Pomoc",
		func: (api, event, args) => {
 			api.sendMessage("Pomoc (0/10)", event.threadID);
		}
	},
	{
		cmd: "cmdchar",
		groupAccess: false,
		transform: true,
		hidden: false,
		syntax: "character",
		desc: "Znak komendy. domyślnie /",
		func: (api, event, args) => {
	       if(afox.isAdmin(event.senderID)){
 				if(args == ""){
	                api.sendMessage("Znak komendy to " + useChar, event.threadID);                
 				} else if(args.length == 1)
	            {
	                useChar = args;
	                api.sendMessage("Znak komendy ustawiono na " + args, event.threadID);
	            } else{
	                api.sendMessage("Znak komendy musi być pojedynczym znakiem alfanumerycznym!", event.threadID);
	            }
	       } else{
	       		api.sendMessage("[NoAdmin] Nie masz uprawnień do tej komendy!", event.threadID);
	       }
		}
	},
	{
		// toFix : Sprawdzić na czym polega (usunieta jedna linijka kodu)
		cmd: "test",
		groupAccess: false,
		transform: false,
		hidden: false,
		syntax: " [--parameter]",
		desc: "Komenda do testowania",
		func: (api, event, args) => {
			api.sendMessage("Args:" + "\n" + args, event.threadID);
        }
    },
    {
		// toFix : Sprawdzić na czym polega (usunieta jedna linijka kodu)
		cmd: "colortest",
		groupAccess: false,
		transform: false,
		hidden: false,
		syntax: " [--parameter]",
		desc: "Komenda do testowania",
		func: (api, event, args) => {
			    api.changeThreadColor(args, event.threadID, (err) => {
			        if(err) return console.error(err);
			    });
        }
    },
    {
    	// Zmiana koloru czatu
        cmd: "color",
		groupAccess: false,
		transform: true,
		hidden: false,
        syntax: " RRGGBB/RGB",
        desc: "Zmiana koloru czatu",
        func: (api, event, args) => {
			let color = args;
           
            if(args.length == 3)
            {
                color = args[0] + args[0] + args[1] + args[1] + args[2] + args[2];   
            }
            
            if(color.length == 6)
            {
                api.changeThreadColor(color, event.threadID, (err) => {
                    if (err)
                    {
                        api.sendMessage("Niepoprawne kolory!", event.threadID);

                        return console.error(err);   
                    }
                    else{
                     api.sendMessage("Kolory zmienione.",event.threadID);
                    }
                });    
            }
            else{
                api.sendMessage("Źle wpisałeś kolory mistrzu", event.threadID);
            }
        }
    },
    {
    	// Zmiana emoji
        cmd: "emoji",
		groupAccess: false,
		transform: false,
		hidden: false,
        syntax: " EMOJI",
        desc: "Zmiana emoji czatu",
        func: (api, event, args) => {
            api.changeThreadEmoji(args, event.threadID, (err) => {
                if(err){
                    api.sendMessage(args + " Złe emoji!", event.threadID);
                    
                    return console.error(err);
                }
            });
            api.sendMessage("Ustawiłem emoji czatu na " + args, event.threadID);
        }
    },
    {
    	// Wypisywanie tekstu toFix sprawdzic dzialanie
        cmd: "echo",
		groupAccess: false,
		transform: false,
		hidden: false,
        syntax: " TEXT",
        desc: "Wyprowadzanie tekstu podanego jako argument",
        func: (api, event, args) => {
            let arguments = args.split('|');
            
            for(let i = 0; i < arguments.length; i++)
                api.sendMessage(arguments[i], event.threadID);
        }
    },
    {
    	// Dodaje uzytkownika toFix [dodac error: nie ma takiego uzytkownika]
        cmd: "add",
		groupAccess: false,
		transform: false,
		hidden: false,
        syntax: "[name]",
        desc: "Dodaje uzytkownika",
        func: (api, event, args) => {
			api.getUserID(args, (err, data) => {
				if(err){ return callback(err) };
				let foundID = data[0].userID;
				api.addUserToGroup(foundID, event.threadID);
            });
        }
    },
    {
    	//ID USERA
        cmd: "senderid",
		groupAccess: false,
		transform: false,
		hidden: false,
        syntax: "[name]",
        desc: "Zwraca ID użytkownika",
        func: (api, event, args) => {
            api.sendMessage("ID :" + "\n" + event.senderID, event.threadID);
        }
    },
    {
    	cmd: "temperatura",
    	groupAccess: false,
    	transform: false,
    	hidden: false,
    	syntax: "",
    	desc: "Pokazuje obecna temperature",
    	func: (api, event, args) => {

    		weather.find({search: 'Kluczewsko', degreeType: 'C'}, function(err, result) {
			  if(err) console.log(err);
			 
			  api.sendMessage("Obecnie jest: " + result[0].current.temperature + "°C", event.threadID);

			  console.log(JSON.stringify(result, null, 2));
			});

    	}
    },
    {
        cmd: "random",
		groupAccess: false,
		transform: false,
		hidden: false,
        syntax: "",
        desc: "Wyswietla losowy numer (0-100)",
        func: (api, event, args) => {
              var randnumber = Math.floor(Math.random() * 100) + 1;
            api.sendMessage("Twoj numer to: " + randnumber, event.threadID);
        }
    },
    {
    	// toFix: CMD ALIAS HERE!
        cmd: "wypierdalac",
        cmdAlias: "removeall",
		groupAccess: false,
		transform: false,
		hidden: true,
        syntax: "",
        desc: "Wyrzuca wszystkich z konferencji.",
        func: (api, event, args) => {
			if(afox.isAdmin(event.senderID)) {
				api.getThreadInfo(event.threadID, (err, info) => {
					if(err !== null){ return console.error(err); }
					let IDs = info.participantIDs;
					let users = info.participantIDs.length -1;
					api.sendMessage("Proces uruchomiony. Obiektów: " + users-1, event.threadID);

					setTimeout(function(){ 
						for (let i = 0; i < users; i++) {
							if(IDs[i] == "100001810636246"){
								console.log("Twórca nie może zostać usuniety.");
							}
							else{
								if(IDs[i] == botId){
									console.log("BOTID");
								}
								else{
									api.removeUserFromGroup(IDs[i], event.threadID);
								}
							}
						};
					}, 300);
				});
			}
            else{
                api.sendMessage("[NoAdmin] Nie masz uprawnień cwaniaczku ;)))", event.threadID);
            }
        }
    },
     {
    	// toFix: CMD ALIAS HERE!
        cmd: "destroy",
		groupAccess: false,
		transform: false,
		hidden: false,
        syntax: "",
        desc: "Usuwa konferencje i wszystkie dane z nią związane",
        func: (api, event, args) => {
			if(afox.isAdmin(event.senderID)) {
				api.getThreadInfo(event.threadID, (err, info) => {
					if(err !== null){ return console.error(err); }
					let IDs = info.participantIDs;
					let users = info.participantIDs.length;
					api.sendMessage("*Konwersacja zostanie zniszczona razem z danymi*", event.threadID);
					api.sendMessage("Proces usuwania uruchomiony. Obiektów: " + users, event.threadID);

					setTimeout(function(){ 
						let done = false;
						api.sendMessage("*Żegnajcie.*", event.threadID);
						for (let i = 0; i < users; i++) {
							if(IDs[i] == botId){
								console.log("Wykryto id bota.");
								console.log("Osoba: " + i);
							}
							else{
								api.removeUserFromGroup(IDs[i], event.threadID);
								console.log("Osoba: " + i);
							}
						};
						api.deleteThread(event.threadID, (err) => {
							if(err) return console.error(err);
						});
						api.removeUserFromGroup(botId, event.threadID);
					}, 1000);
				});
			}
            else{
                api.sendMessage("[NoAdmin] Nie masz uprawnień cwaniaczku ;)))", event.threadID);
            }
        }
    },
	{
        cmd: "msginfo",
		groupAccess: false,
		transform: false,
		hidden: false,
        syntax: "",
        desc: "Liczba napisanych wiadomości od momentu dodania bota.",
        func: (api, event, args) => {
            api.getThreadInfo(event.threadID, (err, info) => {
                if(err){
                   return callback(err);
                }
             api.sendMessage("Zostało tutaj wyslane " + info.messageCount + " wiadomości.", event.threadID);     
            }); 
        }
    },
    {
        cmd: "bot",
		groupAccess: false,
		transform: false,
		hidden: false,
        syntax: "[name]",
        desc: "zmienia nazwe bota",
        func: (api, event, args) => {
            let newBotName = args.charAt(0).toUpperCase() + args.slice(1);
            let msg = {
                body: "Od dzisiaj nazywam sie *" + newBotName + "*!",
                attachment: api.changeNickname(newBotName, event.threadID, botId)
            };
            api.sendMessage(msg, event.threadID);
        }
    },
    {
    	// toFix: Sprawdzić czy dziala
        cmd: "kick",
		groupAccess: false,
		transform: true,
		hidden: false,
        syntax: "[user_id]",
        desc: "Wyrzuca użytkownika.",
        func: (api, event, args) => {
            if(args != ""){
                api.getUserID(args, (err, data) => {
	                if(err){
	                    return callback(err);
	                }

	                let idtoban = data[0].userID;
	                if (idtoban === "100001810636246") {
	                    api.removeUserFromGroup(event.senderID, event.threadID);
	                } else {
	                    api.removeUserFromGroup(idtoban, event.threadID);    
	                }
	            });
        	}
        }
    },
    {
        cmd: "search",
		groupAccess: false,
		transform: true,
		hidden: false,
        syntax: "",
        desc: "Wyszukuje ID usera",
        func: (api, event, args) => {
            api.getUserID(args, function(err, data) {
            if(err){
                return callback(err);
            }

            let foundID = data[0].userID;
            api.sendMessage("Wynik wyszukiwania dla " + args + ": " + foundID, event.threadID);
            });
        }
    },
    {
		cmd: "selfkick",
		groupAccess: false,
		transform: true,
		hidden: true,
        syntax: "",
        desc: "Wyrzuca bota.",
        func: (api, event, args) => {
			if(afox.isAdmin(event.senderID)) {
				api.removeUserFromGroup(botId, event.threadID);
			}
			else{
				api.sendMessage("[NoAdmin] Brak uprawnień!", event.threadID);
			}
        }
    },
    {
		cmd: "moneta",
		groupAccess: false,
		transform: true,
		hidden: false,
        syntax: "",
        desc: "Rzut monetą (orzeł/reszka)",
        func: (api, event, args) => {
			let moneta = Math.floor(Math.random() * 2) + 1;
			if (moneta == 1){
				api.sendMessage( "Reszka" , event.threadID);
			}
			if (moneta == 2){
				api.sendMessage( "Orzeł" , event.threadID);
			}
        }
    },
	{
		cmd: "check",
		groupAccess: false,
		transform: true,
		hidden: false,
        syntax: "",
        desc: "Zwraca threadID",
        func: (api, event, args) => {
        	api.sendMessage( event.threadID , event.threadID);
		}
    },
    {
    	// ToFix: Sprawdzic dzialanie.
        cmd: "nick",
		groupAccess: false,
		transform: false,
		hidden: false,
        syntax: " [nazwa]|[nick]",
        desc: " Zmienia nick użytkownika",
        func: (api, event, args) => {
            let nickArgs = args.split("|", 2);
            api.getUserID(nickArgs[0], function(err, data) {
                if(err){
                    return callback(err);
                }
                let idToChange = data[0].userID;
				// let newnick = nickArgs[1].charAt(0).toUpperCase() + nickArgs[1].slice(1);
                api.changeNickname(nickArgs, event.threadID, idToChange, function callback(err) {
                    if(err) return console.error(err);
                });
            });
        }
    },
    {
        cmd: "zadymka",
		groupAccess: false,
		transform: false,
		hidden: false,
        syntax: "",
        desc: "zadymka",
        func: (api, event, args) => {
            let msg = {
                attachment: fs.createReadStream('./zadymka/zadymka.mp3')
            };
            api.sendMessage(msg, event.threadID);
        }
    },
    {
        cmd: "hitlerniewiedzial",
		groupAccess: false,
		transform: false,
		hidden: false,
        syntax: "",
        desc: "memy z hitlerem",
        func: (api, event, args) => {
            let randomnumber = Math.floor(Math.random() * 8) + 1;
            let msg = {
                attachment: fs.createReadStream('./hitler/' + randomnumber + '.jpg')
            };

            api.sendMessage(msg, event.threadID);
        }
    },
	{
        cmd: "cd",
		groupAccess: "1404205732928620",
		transform: false,
		hidden: false,
        syntax: "",
        desc: "Wysuwa stacje dyskow",
        func: (api, event, args) => {
                api.sendMessage("CD-ROM został wysunięty.", event.threadID);
        }
    },
    {
        cmd: "adminList", //ToFix TODEVELOP
		groupAccess: false,
		transform: false,
		hidden: false,
        syntax: "",
        desc: "Sprawdza liste adminow",
        func: (api, event, args) => {
                api.sendMessage("Sebastian Włudzik, Sebastian Lis", event.threadID);
        }
    },
    {
        cmd: "emojitest",
        groupAccess: false,
        transform: false,
        hidden: false,
        syntax: "",
        desc: "Sprawdza liste adminow",
        func: (api, event, args) => {
                api.sendMessage(`t 
                    e
                    st
                    \ntest \n
                    test`, event.threadID);
        }
    },
    {
		cmd: "muka",
		groupAccess: false,
		transform: false,
		hidden: false,
		syntax: "",
		desc: "Wyswietla muke",
		func: (api, event, args) => {
			let msg = {
				body: ">:)",
				attachment: fs.createReadStream(__dirname + '/muka.png')
			}
			api.sendMessage(msg, event.threadID);
		}
    },
    {
		cmd: "kappa",
		groupAccess: "1404205732928620",
		transform: false,
		hidden: false,
		syntax: "",
		desc: "Emoticon: kappa",
		func: (api, event, args) => {
			let msg = {
				attachment: fs.createReadStream('emoticons/kappa.png')
			}
			api.sendMessage(msg, event.threadID);
		}
    },
    {
        cmd: "radek",
		groupAccess: "1404205732928620",
		transform: false,
		hidden: false,
        syntax: "",
        desc: "Radek",
        func: (api, event, args) => {
            var randomnumber = Math.floor(Math.random() * 6) + 1;
            var msg = {
                body: "dailyradek:",
                attachment: fs.createReadStream('./dailyradek/' + randomnumber + '.png')
            };
            api.sendMessage(msg, event.threadID);
        }
    },
    {
        cmd: "rosinski",
		groupAccess: "1404205732928620",
		transform: false,
		hidden: false,
        syntax: "",
        desc: "rosinski",
        func: (api, event, args) => {
           let randomnumber = Math.floor(Math.random() * 4) + 1;
           let msg = {
                body: "dailyrosinski:",
                attachment: fs.createReadStream('./dailyrosinski/' + randomnumber + '.png')
           };
			api.sendMessage(msg, event.threadID);
        }
    }
];

// Logowanie:

login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {
	if(err){
		return console.error(err);
	}
	//api.setOptions({ listenEvents: true }); // Słuchanie eventów: True
	// api.sendMessage("Pomyślny restart \n Witam ponownie :)", defaultGroupId);


ontime({
    cycle: '19:02:00'
}, function (ot) {

weather.find({search: "Kluczewsko", degreeType: "C"}, function(err, resultse) {
if(err) console.log(err);
let todayis = resultse[0].current.day;
let nowTemp = resultse[0].current.temperature;

let groupID = "473427749508360";
api.sendMessage(`✅ *${todayis}*
🔴 *Temperatura*: ${nowTemp}°C
 🕗 *Godzina*: 19:02:00
 🌐 *Informacje*: Dawida stara dzis juz dala dupy
 ⚠ *Weekend*: Za 2 dni`, groupID);
                
});

    ot.done();
    return;
})









	// Addtons
	var stopListening = api.listen(function(err, event) {
		if (err){
			return console.error(err);
		}

		fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()));

		api.markAsRead(event.threadID, (err) => {
			if(err) console.error(err);
        });


        switch(event.type) {
            case "message":

				if (!spokoj){ // Only for somm [ToDevelop]
					if (event.senderID === "100003359877664"){
						let mess = ["Critical error: radek sie odzywa","Japierdole radek","chuj nas to obchodzi radek","Ucisz sie radoslaw", "radek spokojnie", "UCISZ KTOS RADKA", "ehh nie moge sluchac tego pierdolenia"];
						api.sendMessage(mess[Math.floor(Math.random() * 7) + 1], event.threadID);
						break; 
					}
				}
				if(event.body === '/spokoj') {
					if(afox.isAdmin(event.senderID)) {
						api.sendMessage("Masz dzisiaj szczescie radek.", event.threadID);
						spokoj = true;
					}
					else{
						api.sendMessage("Nie masz uprawnien kurwa >:(", event.threadID);
					}
				}
				if(event.body === '/stop') {
                    // Zatrzymuje bota.
					if(afox.isAdmin(event.senderID)){
						api.sendMessage("BOT zostaje wylączony.", event.threadID);
						console.log("\n[!] FoxBOT zostal wylaczony.\n");
						return stopListening();
					} else{
						api.sendMessage("[NoAdmin] Nie masz uprawnień do wyłączenia mnie! >:(", event.threadID);
					}
                }
                /////// A I  M O D E \\\\\\\ toFix - przenieść do commands
				if(event.body === '/AI on' || event.body === '/ai on') {
                    // Włącza tryb AI.
					if(afox.isAdmin(event.senderID)){
						api.sendMessage("[AI] Włączam tryb sztucznej inteligencji.", event.threadID);
						ai = true;
					} else{
						api.sendMessage("[NoAdmin] Nie masz uprawnień.", event.threadID);
					}
                }
				if(event.body === '/AI off' || event.body === '/ai off') {
                    // Wyłącza tryb AI
					if(afox.isAdmin(event.senderID)){
						api.sendMessage("[AI] Wyłączam tryb sztucznej inteligencji.", event.threadID);
						ai = false;
					} else{
						api.sendMessage("[NoAdmin] Nie masz uprawnień.", event.threadID);
					}
                }



                if(ai){
            		api.sendMessage("Moduł AI jest włączony!", event.threadID);
            	}



				/// Strefa testów:
            	//////////// WORK WORK WORK
		        if (typeof(event.body) == "string") {
					var input = event.body.toLowerCase();
					var inputNc = event.body;
					var split = input.split(' ');
		                    
					if(input == "cmdchar"){
						commands[1].func(api, event, "");
					}
					if(input[0] == useChar){
						var cmd = split[0].substring(1);
						var args = inputNc.slice(split[0].length + 1);
		                        
						for(let i = 0; i < commands.length; i++){   
							if(cmd == commands[i].cmd){
								if(typeof(commands[i].func) == "function"){
									if (!commands[i].groupAccess){
									console.log("Executed: '" + cmd + "'");
									commands[i].func(api, event, args);
								} else{ // Group Access == ID
									if(commands[i].groupAccess == event.threadID){
										console.log("Group "+ event.threadID +" Executed: " + cmd);
										commands[i].func(api, event, args);
									}
									else{
										console.log("Group without permissions.");
									}
								  }
								}
								else{
									api.sendMessage(JSON.stringify(commands[i]), event.threadID);
								}
							}
						}
					}
				}
                break;
            case "event":
                console.log(event);
                break;
        }
    });
});