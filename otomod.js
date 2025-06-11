const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const emojiler = require('../../Settings/emojiler.json');

const dbPath = path.join(__dirname, '../../Database/otomod.json');

function loadSettings() {
    if (!fs.existsSync(dbPath)) return {};
    return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}

function saveSettings(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('otomod')
        .setDescription('Otomatik moderasyon ayarlarını düzenler.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub =>
            sub.setName('küfür')
                .setDescription('Küfür filtresini ayarlar.')
                .addStringOption(opt =>
                    opt.setName('durum')
                        .setDescription('Aç veya kapat')
                        .setRequired(true)
                        .addChoices(
                            { name: 'aç', value: 'aç' },
                            { name: 'kapat', value: 'kapat' }
                        )
                )
        )
        .addSubcommand(sub =>
            sub.setName('spam')
                .setDescription('Spam filtresini ayarlar.')
                .addStringOption(opt =>
                    opt.setName('durum')
                        .setDescription('Aç veya kapat')
                        .setRequired(true)
                        .addChoices(
                            { name: 'aç', value: 'aç' },
                            { name: 'kapat', value: 'kapat' }
                        )
                )
        )
        .addSubcommand(sub =>
            sub.setName('link')
                .setDescription('Link filtresini ayarlar.')
                .addStringOption(opt =>
                    opt.setName('durum')
                        .setDescription('Aç veya kapat')
                        .setRequired(true)
                        .addChoices(
                            { name: 'aç', value: 'aç' },
                            { name: 'kapat', value: 'kapat' }
                        )
                )
        )

        .addSubcommand(sub =>
    sub.setName('davet')
        .setDescription('Davet bağlantısı filtresini ayarlar.')
        .addStringOption(opt =>
            opt.setName('durum')
                .setDescription('Aç veya kapat')
                .setRequired(true)
                .addChoices(
                    { name: 'aç', value: 'aç' },
                    { name: 'kapat', value: 'kapat' }
                )
        )
)
.addSubcommand(sub =>
    sub.setName('nsfw')
        .setDescription('NSFW/medya filtresini ayarlar.')
        .addStringOption(opt =>
            opt.setName('durum')
                .setDescription('Aç veya kapat')
                .setRequired(true)
                .addChoices(
                    { name: 'aç', value: 'aç' },
                    { name: 'kapat', value: 'kapat' }
                )
        )
)
     .addSubcommand(sub =>
            sub.setName('durum')
                .setDescription('Otomod ayarlarını gösterir.')
        ),

    async execute(interaction) {
        const settings = loadSettings();
        const guildId = interaction.guild.id;

        if (!settings[guildId]) {
            settings[guildId] = { kufur: false, spam: false, link: false };
        }

        const sub = interaction.options.getSubcommand();
        const durum = interaction.options.getString('durum');

        if (sub === 'küfür') {
            settings[guildId].kufur = durum === 'aç';
            saveSettings(settings);
            return interaction.reply({ content: `${emojiler.tik} Küfür filtresi **${durum}ıldı**.`, flags: 64 });
        }

        if (sub === 'spam') {
            settings[guildId].spam = durum === 'aç';
            saveSettings(settings);
            return interaction.reply({ content: `${emojiler.tik} Spam filtresi **${durum}ıldı**.`, flags: 64 });
        }

        if (sub === 'link') {
            settings[guildId].link = durum === 'aç';
            saveSettings(settings);
            return interaction.reply({ content: `${emojiler.tik} Link filtresi **${durum}ıldı**.`, flags: 64 });
        }

        if (sub === 'davet') {
    settings[guildId].davet = durum === 'aç';
    saveSettings(settings);
    return interaction.reply({ content: `${emojiler.tik} Davet filtresi **${durum}ıldı**.`, flags: 64 });
}

if (sub === 'nsfw') {
    settings[guildId].nsfw = durum === 'aç';
    saveSettings(settings);
    return interaction.reply({ content: `${emojiler.tik} NSFW filtresi **${durum}ıldı**.`, flags: 64 });
}

        const { kufur, spam, link, davet, nsfw } = settings[guildId];
return interaction.reply({
    content: `## <a:ayar_arviis:1043272548370104370> Sistem Durumları
- Küfür: ${kufur ? `${emojiler.tik} Açık` : `${emojiler.carpi} Kapalı`}
- Spam: ${spam ? `${emojiler.tik} Açık` : `${emojiler.carpi} Kapalı`}
- Link: ${link ? `${emojiler.tik} Açık` : `${emojiler.carpi} Kapalı`}
- Davet: ${davet ? `${emojiler.tik} Açık` : `${emojiler.carpi} Kapalı`}
- NSFW: ${nsfw ? `${emojiler.tik} Açık` : `${emojiler.carpi} Kapalı`}`,
    flags: 64
});
        }
    }