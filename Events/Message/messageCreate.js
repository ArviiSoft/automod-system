const { PermissionFlagsBits } = require('discord.js');
const fs = require("fs");
const path = require("path");
const emojiler = require('../../Settings/emojiler.json');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//OTOMOD SİSTEMİ
const dbPath = path.join(__dirname, '../../Database/otomod.json');
const kufurDosyaYolu = path.join(__dirname, '../../Database/küfür.txt');
const { isImageNSFW, loadModel } = require('../../Utils/nsfwScanner'); 

const linkRegex = /(https?:\/\/)?(www\.)?\S+\.\S{2,}/i;
const inviteRegex = /(discord\.gg\/|discordapp\.com\/invite\/)/i;
const nsfwRegex = /(porn|sex|redtube|xnxx|xvideos|youporn|erotik|amateur|nsfw|hentai)/i;

function loadKufurListesi() {
    if (!fs.existsSync(kufurDosyaYolu)) return [];
    const veriler = fs.readFileSync(kufurDosyaYolu, 'utf-8');
    return veriler
        .split('\n')
        .map(k => k.trim().toLowerCase())
        .filter(k => k.length > 0);
}

function loadSettings() {
    if (!fs.existsSync(dbPath)) return {};
    return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}

function normalizeMessage(content) {
    return content
        .toLowerCase()
        .replace(/[^a-zA-Z0-9ğüşöçıİĞÜŞÖÇ]/g, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

async function clearAndWarn(message, uyarı) {
    try {
        const fetched = await message.channel.messages.fetch({ limit: 10 });
        const userMessages = fetched.filter(m => m.author.id === message.author.id);
        await Promise.all(userMessages.map(m => m.delete().catch(() => {})));

        const warnMsg = await message.channel.send({ content: uyarı });
        setTimeout(() => warnMsg.delete().catch(() => {}), 5000);
    } catch (err) {
        console.error('Mesaj temizleme hatası:', err);
    }
}

async function warn(message, uyarı) {
    try {
        await message.delete().catch(() => {});
        const warnMsg = await message.channel.send({ content: uyarı });
        setTimeout(() => warnMsg.delete().catch(() => {}), 5000);
    } catch (err) {
        console.error('Uyarı gönderme hatası:', err);
    }
}

const userMessageCache = new Map();
const kufurListesi = loadKufurListesi();

client.on('messageCreate', async (message) => {
    if (
        message.author.bot ||
        !message.guild ||
        message.member.permissions.has(PermissionFlagsBits.Administrator)
    ) return;

    const settings = loadSettings();
    const guildSettings = settings[message.guild.id];
    if (!guildSettings || typeof guildSettings !== 'object') return;

    const content = message.content;
    const normalized = normalizeMessage(content);

    if (guildSettings.kufur && kufurListesi.some(k => normalized.includes(k))) {
        await clearAndWarn(message, `${emojiler.dikkat} **${message.author} argo kelime kullanmamalısın.**`);
        return;
    }

    if (guildSettings.link && linkRegex.test(content)) {
        await clearAndWarn(message, `${emojiler.dikkat} **${message.author} link paylaşmamalısın.**`);
        return;
    }

    if (guildSettings.davet && inviteRegex.test(content)) {
        await clearAndWarn(message, `${emojiler.dikkat} **${message.author} davet bağlantısı paylaşmamalısın.**`);
        return;
    }

    if (guildSettings.nsfw) {
    if (nsfwRegex.test(normalized)) {
        await clearAndWarn(message, `${emojiler.dikkat} **${message.author} NSFW içerik paylaşmamalısın.**`);
        return;
    }

    if (message.attachments.size > 0) {
        await loadModel();

        for (const attachment of message.attachments.values()) {
            const isNSFW = await isImageNSFW(attachment.url);
            if (isNSFW) {
                await clearAndWarn(message, `${emojiler.dikkat} **${message.author} NSFW görsel paylaşmamalısın.**`);
                return;
            }
        }
    }
}

    if (guildSettings.spam) {
        const userId = message.author.id;
        const now = Date.now();
        const userData = userMessageCache.get(userId);

        if (userData) {
            const delta = now - userData.lastMessage;
            if (delta < 2000 && userData.lastContent === normalized) {
                const fetched = await message.channel.messages.fetch({ limit: 10 });
                const userMessages = fetched.filter(m => m.author.id === userId && normalizeMessage(m.content) === normalized);
                await Promise.all(userMessages.map(m => m.delete().catch(() => {})));
                await warn(message, `${emojiler.dikkat} **${message.author} spam yapmamalısın.**`);
                return;
            }
        }

        userMessageCache.set(userId, {
            lastMessage: now,
            lastContent: normalized
        });
    }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////