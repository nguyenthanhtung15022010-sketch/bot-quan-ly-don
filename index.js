const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');
const express = require('express');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Khởi tạo Express server để giữ bot online 24/7 trên Render
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot Discord is running!');
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

client.once('ready', () => {
    console.log(`🤖 Bot ${client.user.tag} đã sẵn sàng!`);
});

client.on('interactionCreate', async interaction => {
    // Xử lý khi bấm nút "Xem đơn hàng"
    if (interaction.isButton()) {
        await interaction.deferReply({ flags: 64 });

        const embedDonHang = new EmbedBuilder()
            .setTitle('📦 DANH SÁCH ĐƠN HÀNG')
            .setDescription('Hiện tại chưa có đơn hàng nào mới hoặc các đơn đã được cập nhật.')
            .setColor(0x00FF00);

        await interaction.editReply({ embeds: [embedDonHang] });
        return;
    }

    if (!interaction.isChatInputCommand()) return;

    // Lệnh /tao_bang_don
    if (interaction.commandName === 'tao_bang_don') {
        const embed = new EmbedBuilder()
            .setTitle('📦 QUẢN LÝ ĐƠN HÀNG')
            .setDescription('Nhấn **👀 Xem đơn hàng** để xem chi tiết.')
            .setColor(0x00FF00);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_xem_don')
                .setLabel('👀 Xem đơn hàng')
                .setStyle(ButtonStyle.Success)
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
});

client.login(process.env.DISCORD_TOKEN);