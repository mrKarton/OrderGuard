const DS = require('discord.js');
const fs = require('fs');

const bot = new DS.Client();
const token = "Njg4NjcyNzY4NzY1ODUzNzUw.XswRHQ.wIBgVpARHLY3FYmHX7wV0yxuOIE";
const prefix="!";

var guildID = '687554615004102666';
var mutes = new Map();
mutes = jsonToMap(fs.readFileSync('./mutes.json'));
var news = new Map();
var defRole = "692762833024319550";
var guild = bot.guild;

setInterval(() => {
    fs.writeFileSync('./mutes.json', mapToJson(mutes), (err)=>{if(err) throw err});
}, 1000 * 30 * 60);

bot.login(token);
bot.on('ready',()=>{
    console.log('Guardian is started');
    guild = bot.guilds.cache.get(guildID);
    console.log("Working on " + guild.name + "-" + guild.id);

});


bot.on('guildMemberAdd',(member)=>{
    member.send('Добро пожаловать в Орден Фортуны! Я стражник ордена. Я здесь для того, чтобы удостовериться, что тебе можно доверять!');
    member.send('И так. Мне нужно понять. А не бот ли ты?');
    member.send('Скажи, путник, сколько будет 2+2?');
    news.set(member.user, "NEWER");
    mutes.set(member.id, "688672768765853750");

    var minutes = 30;
    setInterval(()=>{ if(news.get(member) != null) member.kick(); }, 1000 * 60 * minutes);
});

bot.on('message',(msg)=>{

    if(news.has(msg.author))
    {
        if(msg.content == "4")
        {
            msg.author.send("Так и знал, что ты наш! Добро пожаловать в Орден!");
            msg.author.send("Сообщение от программиста: это пока тестовая дичь, у нас не на ком было проверять, если чёт не работает, пиши https://vk.com/ms_bandit");
            news.delete(msg.author);
            bot.guilds.cache.get(guildID).member(msg.author).edit({roles:[defRole]});
            mutes.delete(msg.author.id);
            
        }
    }

    if(!mutes.has(msg.author.id))
    {
        if(msg.content.startsWith(prefix))
        {
            var values = splitForBot(msg.content.toLowerCase());

            switch(values[0])
            {

                case "set-def-role":
                    if(isAdmin(msg.author))
                    {
                        defRole = values[1];
                        msg.reply("Установлена роль по умолчанию: " + bot.guilds.cache.get(guildID).roles.cache.get(values[1]).name);
                    }
                break;
                
                case "give-roles":
                    if(isAdmin(msg.author))
                    {
                        var c = 0;
                        var ks = bot.guilds.cache.get(guildID).members.cache.keyArray();
                        for(var l of bot.guilds.cache.get(guildID).members.cache.keyArray())
                        {   
                            u = bot.guilds.cache.get(guildID).members.cache.get(l);
                            if(u.roles.cache.keyArray().length == 1)
                            {
                                u.edit({roles:[defRole]});
                                c++;
                            }
                        }
                        msg.reply("выдано " + c + " ролей");
                    }
                break;

                case "kick-newers":
                    msg.channel.send(kickNA() + " пользователь было кикнуто, МОНСТР >:(");
                break;

                case "sayto":
                    Say(values);
                break;
            }
        }
    }
    else
    {
        msg.delete();
    }
});

//#region mutes
    function mute(user, by)
    {
        if(getUserByNickname(user) != null)
        {
            mutes.set(getUserByNickname(user).id, by.id);
            console.log(user);
            
            return true;
        }
        else
        {
            return false;
        }
    }

    function unmute(user)
    {

        if(getUserByNickname(user)!= null)
        {
            if (mutes.get(getUserByNickname(user).id) != null)
            {

                mutes.delete(getUserByNickname(user).id);
                
                return true;
            }   
            else
            {
                return false;
            }
        }
        else
        {
            return false;
        }
    }

    function muteds()
    {
        if(mutes.size > 0)
        {
            var str = "СПИСОК ЗАГЛУШЕННЫХ: \n";
            for (let k of mutes.keys()) 
            {
                if(bot.users.cache.get(k) != null && mutes.get(k) != "688672768765853750")
                {
                    var s = "***" + bot.users.cache.get(k).username + "***  by ***" + bot.users.cache.get(mutes.get(k)).username + "***";
                }
                str += s + "\n";
            }
            return str;
        }
        else
        {
            return "Никто не заглушен";
        }
    }

    function kickNA()
    {
        var c = 0;
        for(var k of bot.users.cache.keys())
        {
            if(bot.guilds.cache.get(guildID).member(k).roles.cache.size == 1)
            {
                bot.guilds.cache.get(guildID).member(k).kick();
                c++;
            }
            
        }

        for(var k of news)
        {
            bot.guilds.cache.get(guildID).member(k).kick();
            c++;
        }

        for(var k of mutes)
        {
            if(bot.guilds.cache.get(guildID).members.cache.get(k) != null)
            {
                bot.guilds.cache.get(guildID).members.cache.get(k).kick();
            }
        }

        return c;

    }

    function Say(vals)
    {
        console.log(vals);
        getChannelID(vals[1]);
        switch(vals[2])
        {
            case "j":
                bot.channels.cache.get("688056957537484880").send("!сказатьв " + getChannelID(vals[1]) + " " + getValuesAfter(3, vals));
            break;

            case "s":
                bot.channels.cache.get(getChannelID(vals[1])).send(getValuesAfter(3, vals));
            break;
        }
    }
//#endregion

//#region help functions

function splitForBot(content) {
    if (typeof (content) == typeof ("String")) //Checking for type of content (we need a string)
    {
        var step1 = content.split('!');//spliting prefix
        if (step1[1] != null)                     //if there are comands
        {
            var step2 = step1[1].split(" ");     //spliting arguments
            var step3 = step2.filter(element => element != '');//remove empty entries
            return step3; //return
        }
        else {
            return 0; //return 0 if error
        }
    }
    else {
        return 0;    //return 0 if error
    }
}

function getChannelID(snake)
{
    var step1 = "";
    for(var i = 2; i < snake.length; i++)
    {
        step1 += snake[i];
    }
    console.log(step1);
    var step2 = "";
    for(var i = 0; i < step1.length - 1; i ++)
    {
        step2 += step1[i];
    }
    console.log(step2);
    return step2;
}

function getValuesAfter(it, arr)
{
    var str = "";
    for(var i = it; i < arr.length; i++)
    {
        if(i != it)
        {
            str += " ";
        }
        str += arr[i];

    }

    return str;
}

function getUserByNickname(nickname)
{
    var keys = bot.guilds.cache.get(guildID).members.cache.keyArray();
    for(var i = 0; i < keys.length; i++)
    {
        //console.log(bot.guilds.cache.get(guildID).members.cache.get(keys[i]).user.username + " " + nickname);
        if(nickname.toLowerCase() == bot.guilds.cache.get(guildID).members.cache.get(keys[i]).user.username.toLowerCase())
        {
            return bot.guilds.cache.get(guildID).members.cache.get(keys[i]).user;
        }

    }

    return null;
}

function isAdmin(usr)
{

    var id = usr.id;
    guild = guildID;
    var mem = bot.guilds.cache.get(guild).members.cache.get(id);

    if(mem.roles.cache.has('687554873713360927') || mem.roles.cache.has('687555354736853026') || mem.id == "471976309598322700")
    {
        return true;
    }
    else return false; 
}

//#endregion

//map serializtion
function mapToJson(map) {
    return JSON.stringify([...map]);
}
function jsonToMap(jsonStr) {
    return new Map(JSON.parse(jsonStr));
}


// //TODO start a machine riot
// function GetAMind()
// {
//     imort Main from ('./gitignored/mind.js');
//     Main.run();
// }