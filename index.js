require("dotenv").config();

const Discord = require("discord.js");
const client = new Discord.Client();
const nedb = require("nedb");

const db = new nedb("database.db");
db.loadDatabase();

client.on("ready", () => {
    console.log(`hello from pinout`);
});

client.on("guildMemberAdd", async (member) => {
    const general = await client.channels.fetch("779142220947259405");
    const emb = new Discord.MessageEmbed().setColor("#e50790").setTitle(`chamaaaa, ${member.displayName}!`).setDescription("bora trabalhar e clica no botao enviar");
    await general.send(emb);
});

client.on("message", async (msg) => {
    if (msg.author.bot) return;

    const args = msg.content.trim().split(" ").splice(1);

    if (msg.content.toLowerCase().startsWith("-clear")) {
        const amount = args.length == 1 ? args[0] : 100;
        await msg.channel.messages.fetch({ limit: amount }).then((messages) => {
            msg.channel.bulkDelete(messages);
        });
        return;
    }
    if (msg.channel.id === "779143551329763368") {
        const data = {};
        const splited = msg.content.trim().split(" ");
        if (!isNumeric(splited[0])) {
            const emb = new Discord.MessageEmbed().setColor("#ff0000").setTitle("Erro").setDescription("esse chat eh so pras resp pae :(");
            const errorMsg = await msg.channel.send(emb);
            msg.delete();
            setTimeout(() => {
                errorMsg.delete();
            }, 2000);
            return;
        }
        data.number = splited[0];
        if (splited.length > 1) data.answer = splited.splice(1).join(" ");
        const attachments = msg.attachments.array();
        if (attachments.length != 0) {
            data.image = attachments[0].url;
        }
        const inDB = await isInDB(data.number);
        if (!inDB) {
            db.insert(data);
        } else {
            if (data.answer) {
                db.update({ number: data.number }, { $set: { answer: data.answer } }, {}, () => {});
            } else if (data.image) {
                db.update({ number: data.number }, { $set: { image: data.image } }, {}, () => {});
            }
        }
        return;
    }
    if (msg.content.toLowerCase().startsWith("-q")) {
        if (args.length !== 1) {
            const emb = new Discord.MessageEmbed().setColor("#ff0000").setTitle("Erro").setDescription("num é assim que usa o comando n man, pergunta p miranha");
            await msg.channel.send(emb);
            return;
        }
        const number = args[0];
        const doc = await getInDB(number);
        if (!doc) {
            const emb = new Discord.MessageEmbed().setColor("#ff0000").setTitle("Erro").setDescription("essa questão ta na database não man");
            await msg.channel.send(emb);
            return;
        }
        const emb = new Discord.MessageEmbed().setColor("#e50790").setTitle(`Questão ${number}`).setThumbnail(doc.image).setDescription(`**Resposta:** ${doc.answer}`);
        await msg.channel.send(emb);
        return;
    }
    if (msg.content.toLowerCase() === "-list") {
        let questions = [];
        db.find({}, (err, docs) => {
            questions = docs;
        });
        await sleep(500);
        for (let q of questions) {
            const emb = new Discord.MessageEmbed().setColor("#e50790").setTitle(`Questão ${q.number}`).setThumbnail(q.image).setDescription(`**Resposta:** ${q.answer}`);
            await msg.channel.send(emb);
        }
    }
});

client.login(process.env.TOKEN);

async function isInDB(number) {
    let bool;
    db.findOne({ number: number }, (err, doc) => {
        bool = doc !== null;
    });
    await sleep(500);
    return bool;
}

async function getInDB(number) {
    let output;
    db.findOne({ number: number }, (err, doc) => {
        output = doc;
    });
    await sleep(500);
    return output;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
